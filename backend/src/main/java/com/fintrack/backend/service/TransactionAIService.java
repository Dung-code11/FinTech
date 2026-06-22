package com.fintrack.backend.service;

import com.fintrack.backend.dto.Response.ChatResponse;
import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Category;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.AccountRepository;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TransactionAIService {

    private static final Pattern MONEY_PATTERN = Pattern.compile("(\\d+(?:[\\.,]\\d+)*)\\s*(ty|ti|trieu|tr|nghin|ngan|k|m|b|vnd|d|dong)?", Pattern.CASE_INSENSITIVE);

    private final GeminiService geminiService;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    public ChatResponse handleTransaction(String message, String accountId) {
        String normalized = normalize(message);

        if (!looksLikeTransactionRequest(normalized)) {
            return null;
        }

        ParsedTransaction parsed = parseHeuristically(message, normalized);
        if (parsed.requiresAmount()) {
            return ChatResponse.builder()
                    .reply("Mình hiểu bạn muốn ghi giao dịch nhưng chưa thấy số tiền rõ ràng. Ví dụ: \"ăn trưa 45k\" hoặc \"nhận lương 15tr\".")
                    .action("NEEDS_CLARIFICATION")
                    .refreshScopes(List.of())
                    .build();
        }

        if (!parsed.isTransaction()) {
            parsed = parseWithGemini(message);
        }

        if (parsed == null || !parsed.isTransaction() || parsed.amount() == null || parsed.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        return saveTransaction(accountId, message.trim(), normalized, parsed);
    }

    private ChatResponse saveTransaction(String accountId,
                                         String originalMessage,
                                         String normalizedMessage,
                                         ParsedTransaction parsed) {

        List<Wallet> wallets = walletRepository.findByAccount_Id(accountId);
        if (wallets.isEmpty()) {
            return ChatResponse.builder()
                    .reply("Bạn chưa có ví nào để mình ghi giao dịch. Hãy tạo ví trước rồi thử lại.")
                    .action("NO_WALLET")
                    .refreshScopes(List.of())
                    .build();
        }

        WalletResolution walletResolution = resolveWallet(wallets, normalizedMessage, parsed.type());
        if (walletResolution.requiresClarification()) {
            return ChatResponse.builder()
                    .reply(walletResolution.message())
                    .action("NEEDS_CLARIFICATION")
                    .refreshScopes(List.of())
                    .build();
        }

        Wallet wallet = walletResolution.wallet();
        String moneyValidationError = validateWalletImpact(wallet, parsed.type(), parsed.amount());
        if (moneyValidationError != null) {
            return ChatResponse.builder()
                    .reply(moneyValidationError)
                    .action("REJECTED")
                    .refreshScopes(List.of())
                    .build();
        }

        Category category = categoryRepository
                .findSmartCategoryByNameAndType(
                        parsed.categoryName(),
                        parsed.type() == TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE,
                        accountId
                )
                .orElseGet(() -> createCategory(accountId, parsed.categoryName(), parsed.type()));

        applyMoneyEffect(wallet, parsed.type(), parsed.amount());
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setWallet(wallet);
        transaction.setAmount(parsed.amount());
        transaction.setDescription(buildDescription(originalMessage));
        transaction.setType(parsed.type());
        transaction.setCategory(category);
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        String walletSummary = "CREDIT".equalsIgnoreCase(wallet.getType().name())
                ? "Dư nợ hiện tại của " + wallet.getName() + " là " + formatCurrency(safe(wallet.getUnpaidBalance())) + "."
                : "Số dư hiện tại của " + wallet.getName() + " là " + formatCurrency(safe(wallet.getInitialBalance())) + ".";

        String reply = "Đã ghi "
                + (parsed.type() == TransactionType.INCOME ? "khoản thu " : "khoản chi ")
                + formatCurrency(parsed.amount())
                + " cho \""
                + transaction.getDescription()
                + "\".\n"
                + "- Danh mục: "
                + category.getCategoryName()
                + "\n- "
                + walletSummary;

        return ChatResponse.builder()
                .reply(reply)
                .action("TRANSACTION_RECORDED")
                .refreshScopes(List.of("wallets", "transactions"))
                .build();
    }

    private ParsedTransaction parseHeuristically(String message, String normalized) {
        boolean explicitRecordCommand = containsAny(normalized, "ghi giao dich", "them giao dich", "luu giao dich", "ghi lai", "ghi");
        BigDecimal amount = extractAmount(message);
        TransactionType type = detectType(normalized);

        if (amount == null && explicitRecordCommand) {
            return ParsedTransaction.missingAmount();
        }

        if (amount == null || type == null) {
            return ParsedTransaction.notTransaction();
        }

        String category = detectCategory(normalized, type);
        return new ParsedTransaction(true, false, type, amount, category);
    }

    private ParsedTransaction parseWithGemini(String message) {
        if (!geminiService.isAvailable()) {
            return ParsedTransaction.notTransaction();
        }

        String prompt = """
                Trích xuất giao dịch tài chính từ câu sau và trả đúng 1 JSON object.
                Các field:
                - isTransaction: true hoặc false
                - type: INCOME hoặc EXPENSE
                - amount: số tiền VND dạng số
                - category: tên danh mục ngắn gọn

                Nếu không chắc đây là giao dịch cần ghi nhận, đặt isTransaction=false.
                Chỉ trả JSON.

                Câu: "%s"
                """.formatted(message);

        Map<String, Object> json = geminiService.parseJsonObject(geminiService.callGemini(prompt, ""));
        if (json.isEmpty() || !Boolean.TRUE.equals(json.get("isTransaction"))) {
            return ParsedTransaction.notTransaction();
        }

        try {
            TransactionType type = TransactionType.valueOf(String.valueOf(json.get("type")).toUpperCase(Locale.ROOT));
            BigDecimal amount = new BigDecimal(String.valueOf(json.get("amount")));
            String category = normalizeCategory(String.valueOf(json.getOrDefault("category", "Khác")), type);
            return new ParsedTransaction(true, false, type, amount, category);
        } catch (Exception e) {
            return ParsedTransaction.notTransaction();
        }
    }

    private void applyMoneyEffect(Wallet wallet, TransactionType type, BigDecimal amount) {
        if ("CREDIT".equalsIgnoreCase(wallet.getType().name())) {
            BigDecimal unpaidBalance = safe(wallet.getUnpaidBalance());
            wallet.setUnpaidBalance(type == TransactionType.INCOME
                    ? unpaidBalance.subtract(amount)
                    : unpaidBalance.add(amount));
            return;
        }

        BigDecimal balance = safe(wallet.getInitialBalance());
        wallet.setInitialBalance(type == TransactionType.INCOME
                ? balance.add(amount)
                : balance.subtract(amount));
    }

    private Category createCategory(String accountId, String name, TransactionType type) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        Category category = new Category();
        category.setId(UUID.randomUUID().toString());
        category.setCategoryName(name);
        category.setType(type == TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE);
        category.setOwner(account);
        category.setIsDefault(false);
        return categoryRepository.save(category);
    }

    private WalletResolution resolveWallet(List<Wallet> wallets, String normalizedMessage, TransactionType type) {
        Optional<Wallet> walletByName = wallets.stream()
                .filter(wallet -> normalizedMessage.contains(normalize(wallet.getName())))
                .findFirst();

        if (walletByName.isPresent()) {
            return WalletResolution.selected(walletByName.get());
        }

        boolean preferCredit = containsAny(normalizedMessage, "the", "credit", "visa", "master");

        List<Wallet> matchedTypeWallets = wallets.stream()
                .filter(wallet -> preferCredit
                        ? "CREDIT".equalsIgnoreCase(wallet.getType().name())
                        : "CASH".equalsIgnoreCase(wallet.getType().name()))
                .toList();

        if (matchedTypeWallets.size() == 1) {
            return WalletResolution.selected(matchedTypeWallets.get(0));
        }

        if (wallets.size() == 1) {
            return WalletResolution.selected(wallets.get(0));
        }

        String walletTypeLabel = preferCredit ? "thẻ tín dụng" : type == TransactionType.INCOME ? "ví nhận tiền" : "ví chi tiền";
        String walletNames = wallets.stream()
                .map(Wallet::getName)
                .limit(5)
                .reduce((left, right) -> left + ", " + right)
                .orElse("");

        return WalletResolution.clarification(
                "Mình chưa chắc bạn muốn dùng " + walletTypeLabel + " nào để ghi giao dịch này. "
                        + "Hãy nói rõ tên ví, ví dụ: \"ăn trưa 45k từ ví " + wallets.get(0).getName() + "\". "
                        + (walletNames.isBlank() ? "" : "Các ví hiện có: " + walletNames + ".")
        );
    }

    private String buildDescription(String originalMessage) {
        String message = originalMessage.trim();
        return message.length() > 120 ? message.substring(0, 120) : message;
    }

    private TransactionType detectType(String normalizedMessage) {
        boolean income = containsAny(normalizedMessage,
                "nhan", "thu", "luong", "thuong", "hoan tien", "refund", "lai", "ban duoc", "co tuc");
        boolean expense = containsAny(normalizedMessage,
                "chi", "mua", "an", "uong", "tra tien", "thanh toan", "xang", "grab", "taxi", "bus", "cafe", "ca phe", "dong tien");

        if (income && !expense) {
            return TransactionType.INCOME;
        }

        if (expense) {
            return TransactionType.EXPENSE;
        }

        return null;
    }

    private String detectCategory(String normalizedMessage, TransactionType type) {
        if (type == TransactionType.INCOME) {
            if (containsAny(normalizedMessage, "luong")) {
                return "Lương";
            }
            if (containsAny(normalizedMessage, "thuong", "bonus")) {
                return "Thưởng";
            }
            return "Thu nhập";
        }

        if (containsAny(normalizedMessage, "an", "uong", "com", "pho", "bun", "tra sua", "cafe", "ca phe")) {
            return "Ăn uống";
        }
        if (containsAny(normalizedMessage, "xang", "grab", "taxi", "bus", "xe", "di chuyen")) {
            return "Di chuyển";
        }
        if (containsAny(normalizedMessage, "shop", "mua sam", "quan ao", "giay")) {
            return "Mua sắm";
        }
        if (containsAny(normalizedMessage, "dien", "nuoc", "internet", "wifi", "hoa don")) {
            return "Hóa đơn";
        }
        if (containsAny(normalizedMessage, "netflix", "spotify", "xem phim", "giai tri")) {
            return "Giải trí";
        }
        if (containsAny(normalizedMessage, "vien phi", "thuoc", "kham", "suc khoe")) {
            return "Sức khỏe";
        }
        if (containsAny(normalizedMessage, "hoc phi", "khoa hoc", "sach")) {
            return "Giáo dục";
        }

        return "Khác";
    }

    private String normalizeCategory(String rawCategory, TransactionType type) {
        String normalized = normalize(rawCategory);
        return detectCategory(normalized, type);
    }

    private BigDecimal extractAmount(String message) {
        Matcher matcher = MONEY_PATTERN.matcher(normalize(message));
        while (matcher.find()) {
            String rawNumber = matcher.group(1);
            String unit = matcher.group(2);
            BigDecimal amount = parseAmount(rawNumber, unit);
            if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
                return amount;
            }
        }
        return null;
    }

    private BigDecimal parseAmount(String rawNumber, String unit) {
        try {
            String compactNumber = rawNumber.replace(" ", "");
            BigDecimal value;

            boolean hasDecimalWithUnit = unit != null
                    && compactNumber.matches("\\d+[\\.,]\\d{1,2}");

            if (hasDecimalWithUnit) {
                value = new BigDecimal(compactNumber.replace(',', '.'));
            } else {
                value = new BigDecimal(compactNumber.replaceAll("[^\\d]", ""));
            }

            long multiplier = switch (unit == null ? "" : unit.toLowerCase(Locale.ROOT)) {
                case "k", "nghin", "ngan" -> 1_000L;
                case "tr", "trieu", "m" -> 1_000_000L;
                case "ty", "ti", "b" -> 1_000_000_000L;
                default -> 1L;
            };

            return value.multiply(BigDecimal.valueOf(multiplier));
        } catch (Exception e) {
            return null;
        }
    }

    private boolean looksLikeTransactionRequest(String normalizedMessage) {
        boolean hasAmount = MONEY_PATTERN.matcher(normalizedMessage).find();
        boolean explicitRecordCommand = containsAny(normalizedMessage, "ghi giao dich", "them giao dich", "luu giao dich", "ghi lai", "ghi");
        boolean hasTransactionVerb = detectType(normalizedMessage) != null;
        boolean financeDomainQuestion = containsAny(normalizedMessage,
                "ngan sach", "tiet kiem", "du doan", "phan tich", "tong quan", "so du", "lich su", "gan day", "bao nhieu", "xem",
                "con bao nhieu", "the nao", "sao", "tai sao");
        boolean questionStyle = normalizedMessage.contains("?")
                || containsAny(normalizedMessage, "co", "khong", "nao", "gi", "bao nhieu");
        boolean hasWalletSignal = containsAny(normalizedMessage, "vi", "the", "credit", "visa", "master");

        if (!hasAmount && !explicitRecordCommand) {
            return false;
        }

        if (financeDomainQuestion && questionStyle && !explicitRecordCommand) {
            return false;
        }

        if (!explicitRecordCommand && !hasTransactionVerb) {
            return false;
        }

        if (questionStyle && !explicitRecordCommand && !hasWalletSignal) {
            return false;
        }

        return true;
    }

    private String validateWalletImpact(Wallet wallet, TransactionType type, BigDecimal amount) {
        if ("CREDIT".equalsIgnoreCase(wallet.getType().name())) {
            BigDecimal unpaidBalance = safe(wallet.getUnpaidBalance());
            BigDecimal creditLimit = safe(wallet.getCreditLimit());

            if (type == TransactionType.EXPENSE) {
                BigDecimal availableCredit = creditLimit.subtract(unpaidBalance);
                if (amount.compareTo(availableCredit) > 0) {
                    return "Khoản chi này vượt hạn mức còn lại của " + wallet.getName()
                            + ". Hiện bạn chỉ còn " + formatCurrency(availableCredit) + " khả dụng.";
                }
                return null;
            }

            if (amount.compareTo(unpaidBalance) > 0) {
                return "Khoản ghi giảm nợ này lớn hơn dư nợ hiện tại của " + wallet.getName()
                        + " (" + formatCurrency(unpaidBalance) + "). Hãy kiểm tra lại số tiền hoặc chọn ví khác.";
            }
            return null;
        }

        BigDecimal balance = safe(wallet.getInitialBalance());
        if (type == TransactionType.EXPENSE && amount.compareTo(balance) > 0) {
            return "Khoản chi này vượt số dư hiện tại của " + wallet.getName()
                    + ". Số dư còn lại là " + formatCurrency(balance) + ".";
        }

        return null;
    }

    private boolean containsAny(String normalizedMessage, String... keywords) {
        for (String keyword : keywords) {
            if (Pattern.compile("(?<!\\p{Alnum})" + Pattern.quote(keyword) + "(?!\\p{Alnum})")
                    .matcher(normalizedMessage)
                    .find()) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String input) {
        if (input == null) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replace('đ', 'd');

        return normalized.replaceAll("\\s+", " ").trim();
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String formatCurrency(BigDecimal amount) {
        return amount.setScale(0, RoundingMode.HALF_UP).toPlainString() + "đ";
    }

    private record ParsedTransaction(
            boolean isTransaction,
            boolean requiresAmount,
            TransactionType type,
            BigDecimal amount,
            String categoryName
    ) {
        private static ParsedTransaction notTransaction() {
            return new ParsedTransaction(false, false, null, null, null);
        }

        private static ParsedTransaction missingAmount() {
            return new ParsedTransaction(true, true, null, null, null);
        }
    }

    private record WalletResolution(
            Wallet wallet,
            boolean requiresClarification,
            String message
    ) {
        private static WalletResolution selected(Wallet wallet) {
            return new WalletResolution(wallet, false, null);
        }

        private static WalletResolution clarification(String message) {
            return new WalletResolution(null, true, message);
        }
    }
}
