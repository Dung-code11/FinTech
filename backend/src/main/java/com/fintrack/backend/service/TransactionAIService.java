package com.fintrack.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.model.Category;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class TransactionAIService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    // ================= MAIN =================
    public String handleTransaction(String message, String accountId) {

        try {
            String aiResponse = geminiService.callGemini(buildPrompt(message));
            JsonNode json = mapper.readTree(aiResponse);

            // 🔥 nếu AI bảo không phải transaction → fallback
            if (json.has("isTransaction") && !json.get("isTransaction").asBoolean()) {
                return fallbackProcess(message, accountId);
            }

            TransactionType type = parseType(json);
            BigDecimal amount = parseAmount(json);
            String desc = parseDescription(json, message);
            String categoryName = parseCategory(json);

            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return fallbackProcess(message, accountId);
            }

            return saveTransaction(accountId, type, amount, desc, categoryName);

        } catch (Exception e) {
            // 🔥 cực quan trọng: luôn fallback
            return fallbackProcess(message, accountId);
        }
    }

    // ================= SAVE =================
    private String saveTransaction(String accountId,
                                   TransactionType type,
                                   BigDecimal amount,
                                   String desc,
                                   String categoryName) {

        Wallet wallet = walletRepository
                .findByAccount_Id(accountId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        Category category = categoryRepository
                .findSmartCategory(categoryName, accountId)
                .orElseGet(() -> createCategory(categoryName, type));

        Transaction t = new Transaction();
        t.setId(UUID.randomUUID().toString());
        t.setWallet(wallet);
        t.setAmount(amount);
        t.setDescription(desc);
        t.setType(type);
        t.setCategory(category);

        transactionRepository.save(t);

        return buildCuteResponse(type, amount.longValue(), desc);
    }

    // ================= CATEGORY =================
    private Category createCategory(String name, TransactionType type) {
        Category c = new Category();
        c.setId(UUID.randomUUID().toString());
        c.setCategoryName(name);
        c.setType(type == TransactionType.EXPENSE
                ? CategoryType.EXPENSE
                : CategoryType.INCOME);
        c.setIsDefault(false);
        return categoryRepository.save(c);
    }

    // ================= AI PARSE =================
    private TransactionType parseType(JsonNode json) {
        try {
            return TransactionType.valueOf(json.get("type").asText());
        } catch (Exception e) {
            return TransactionType.EXPENSE;
        }
    }

    private BigDecimal parseAmount(JsonNode json) {
        try {
            return BigDecimal.valueOf(json.get("amount").asLong());
        } catch (Exception e) {
            return null;
        }
    }

    private String parseDescription(JsonNode json, String fallback) {
        return json.has("description")
                ? json.get("description").asText()
                : fallback;
    }

    private String parseCategory(JsonNode json) {
        return json.has("category")
                ? normalizeCategory(json.get("category").asText())
                : "Khác";
    }

    // ================= NORMALIZE =================
    private String normalizeCategory(String raw) {

        raw = raw.toLowerCase();

        if (raw.contains("ăn") || raw.contains("uống")) return "Ăn uống";

        if (raw.contains("xăng")
                || raw.contains("bus")
                || raw.contains("xe buýt")
                || raw.contains("taxi")
                || raw.contains("grab")) return "Di chuyển";

        if (raw.contains("giải trí")) return "Giải trí";

        if (raw.contains("lương") || raw.contains("thu")) return "Thu nhập";

        return "Khác";
    }

    // ================= FALLBACK =================
    private String fallbackProcess(String message, String accountId) {

        String msg = message.toLowerCase();

        // 🔥 FIX: thêm xe buýt
        boolean isExpense = msg.matches(".*(ăn|mua|uống|xăng|phí|xe buýt|bus|taxi|grab|xe).*");
        boolean isIncome = msg.matches(".*(lương|thưởng|nhận|được).*");

        if (!isExpense && !isIncome) return null;

        BigDecimal amount = extractMoney(msg);
        if (amount == null) return "😵 Không thấy tiền...";

        TransactionType type = isExpense
                ? TransactionType.EXPENSE
                : TransactionType.INCOME;

        String category = detectCategory(msg, isExpense);

        return saveTransaction(accountId, type, amount, message, category);
    }

    private String detectCategory(String msg, boolean isExpense) {

        if (msg.contains("ăn") || msg.contains("phở") || msg.contains("cơm"))
            return "Ăn uống";

        if (msg.contains("xăng")
                || msg.contains("xe buýt")
                || msg.contains("bus")
                || msg.contains("taxi")
                || msg.contains("grab"))
            return "Di chuyển";

        if (msg.contains("game") || msg.contains("netflix"))
            return "Giải trí";

        if (!isExpense)
            return "Thu nhập";

        return "Khác";
    }

    // ================= MONEY =================
    private BigDecimal extractMoney(String msg) {
        try {
            String number = msg.replaceAll("[^0-9]", "");
            if (number.isEmpty()) return null;

            BigDecimal value = new BigDecimal(number);

            if (msg.matches(".*\\d+k.*"))
                value = value.multiply(BigDecimal.valueOf(1_000));

            else if (msg.matches(".*\\d+m.*"))
                value = value.multiply(BigDecimal.valueOf(1_000_000));

            else if (msg.matches(".*\\d+b.*"))
                value = value.multiply(BigDecimal.valueOf(1_000_000_000));

            return value;

        } catch (Exception e) {
            return null;
        }
    }

    // ================= PROMPT =================
    private String buildPrompt(String input) {
        return """
Phân tích câu sau thành JSON.

- isTransaction: true/false
- type: INCOME hoặc EXPENSE
- amount: số tiền (VND)
- description: mô tả ngắn
- category:

+ "xe buýt", "bus", "taxi", "grab", "xăng" → "Di chuyển"
+ ăn uống → "Thức ăn và Đồ uống"
+ mua đồ → "Mua sắm"
+ lương → "Lương"

Chỉ trả JSON.

Câu: "%s"
""".formatted(input);
    }

    // ================= RESPONSE =================
    private String buildCuteResponse(TransactionType type, long amount, String desc) {

        List<String> expense = List.of(
                "💸 \"%s\" %dđ đã bay khỏi ví!",
                "🍜 \"%s\" %dđ đã được ghi lại!",
                "😆 \"%s\" %dđ nhé, tiêu vui nha!"
        );

        List<String> income = List.of(
                "💰 +%dđ từ \"%s\"!",
                "🎉 \"%s\" +%dđ, giàu lên rồi!",
                "🤑 nhận %dđ từ \"%s\"!"
        );

        Random rand = new Random();

        if (type == TransactionType.EXPENSE) {
            return String.format(
                    expense.get(rand.nextInt(expense.size())),
                    desc, amount
            );
        } else {
            return String.format(
                    income.get(rand.nextInt(income.size())),
                    amount, desc
            );
        }
    }
}