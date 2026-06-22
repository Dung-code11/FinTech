package com.fintrack.backend.service;

import com.fintrack.backend.dto.ChatRequest;
import com.fintrack.backend.dto.Response.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiService {

    private static final List<String> FINANCE_KEYWORDS = List.of(
            "tien", "tai chinh", "chi tieu", "thu", "chi", "giao dich", "vi", "wallet",
            "ngan sach", "budget", "tiet kiem", "saving", "no", "debt", "du doan",
            "tong quan", "bao cao", "so du", "han muc", "credit", "luong", "thuong",
            "dong tien", "roi ri", "lang phi", "muc tieu", "tra no", "lich su", "gan day",
            "ke hoach", "phan bo", "quy du phong"
    );

    private static final List<String> CONTEXTUAL_FINANCE_PHRASES = List.of(
            "toi nen", "minh nen", "toi co nen", "goi y", "tu van", "danh gia", "phan tich giup",
            "cham diem", "xem giup", "can chu y", "nen chu y", "luc nay", "hien tai cua toi"
    );

    private static final List<String> OFF_TOPIC_KEYWORDS = List.of(
            "thoi tiet", "weather", "bong da", "football", "the thao", "ket qua tran", "lich thi dau",
            "giai tri", "phim", "ca si", "bai hat", "lyrics", "lap trinh", "code", "debug",
            "java", "react", "spring", "toan", "giai bai", "vat ly", "hoa hoc", "lich su viet nam",
            "dia ly", "chinh tri", "tin tuc", "news"
    );

    private static final List<String> MARKET_PRICE_KEYWORDS = List.of(
            "gia vang", "vang hom nay", "gia usd", "usd hom nay", "ty gia", "dollar",
            "bitcoin", "btc", "crypto", "chung khoan hom nay", "co phieu hom nay", "lai suat hom nay"
    );

    private final AiAnalyzerService analyzer;
    private final AiPredictService predictor;
    private final GeminiService geminiService;
    private final TransactionAIService transactionAIService;
    private final AiFinanceSnapshotService financeSnapshotService;

    public ChatResponse chat(ChatRequest request, String accountId) {
        String message = request != null ? request.getMessage() : null;
        if (message == null || message.isBlank()) {
            return ChatResponse.builder()
                    .reply(buildHelpReply())
                    .action("HELP")
                    .refreshScopes(List.of())
                    .build();
        }

        ChatResponse transactionResult = transactionAIService.handleTransaction(message, accountId);
        if (transactionResult != null) {
            return transactionResult;
        }

        AiFinanceSnapshotService.FinanceSnapshot snapshot = financeSnapshotService.buildSnapshot(accountId);
        ChatIntent intent = detectIntent(normalize(message));

        String reply = switch (intent) {
            case HELP -> buildHelpReply();
            case OVERVIEW -> analyzer.buildOverview(snapshot);
            case SPENDING_PLAN -> analyzer.buildFinancialPlan(message, snapshot);
            case SPENDING_ANALYSIS -> resolveSpendingReply(message, snapshot, accountId);
            case BUDGET_STATUS -> analyzer.summarizeBudgets(snapshot);
            case SAVINGS_STATUS -> analyzer.summarizeSavings(snapshot);
            case DEBT_STATUS -> analyzer.summarizeDebts(snapshot);
            case WALLET_STATUS -> analyzer.summarizeWallets(snapshot);
            case RECENT_TRANSACTIONS -> analyzer.summarizeRecentTransactions(snapshot);
            case PREDICTION -> predictor.predict(snapshot);
            case GENERAL -> buildGeneralReply(request, snapshot);
        };

        return ChatResponse.builder()
                .reply(reply)
                .action("ANSWER")
                .refreshScopes(List.of())
                .build();
    }

    private String resolveSpendingReply(String message,
                                        AiFinanceSnapshotService.FinanceSnapshot snapshot,
                                        String accountId) {
        String normalized = normalize(message);
        if (containsAny(normalized, "lang phi", "ro ri", "roi ri")) {
            return analyzer.detectLeak(accountId);
        }
        return analyzer.analyzeSpending(snapshot);
    }

    private ChatIntent detectIntent(String normalizedMessage) {
        if (containsAny(normalizedMessage, "help", "giup", "huong dan", "lam duoc gi")) {
            return ChatIntent.HELP;
        }
        if (containsAny(normalizedMessage,
                "ke hoach chi tieu", "lap ke hoach chi tieu", "len ke hoach chi tieu",
                "phan bo chi tieu", "chia ngan sach", "toi nen chi tieu the nao",
                "toi nen phan bo tien the nao", "spending plan", "plan chi tieu",
                "ke hoach tai chinh", "lap ke hoach tai chinh", "len ke hoach tai chinh",
                "phan bo luong", "chia luong", "ke hoach tra no", "ke hoach tiet kiem",
                "quy du phong", "ke hoach ngan sach", "financial plan")) {
            return ChatIntent.SPENDING_PLAN;
        }
        if (containsAny(normalizedMessage, "du doan", "cuoi thang", "forecast", "predict")) {
            return ChatIntent.PREDICTION;
        }
        if (containsAny(normalizedMessage, "giao dich", "gan day", "moi nhat", "lich su", "recent")) {
            return ChatIntent.RECENT_TRANSACTIONS;
        }
        if (containsAny(normalizedMessage, "ngan sach", "budget")) {
            return ChatIntent.BUDGET_STATUS;
        }
        if (containsAny(normalizedMessage, "tiet kiem", "saving", "quy")) {
            return ChatIntent.SAVINGS_STATUS;
        }
        if (containsAny(normalizedMessage, "khoan no", "tra no", "debt", "no con")) {
            return ChatIntent.DEBT_STATUS;
        }
        if (containsAny(normalizedMessage, "so du", "wallet", "vi", "han muc", "credit")) {
            return ChatIntent.WALLET_STATUS;
        }
        if (containsAny(normalizedMessage, "chi tieu", "phan tich", "lang phi", "ro ri", "vuot muc", "vuot")) {
            return ChatIntent.SPENDING_ANALYSIS;
        }
        if (containsAny(normalizedMessage, "tong quan", "bao cao", "overview")) {
            return ChatIntent.OVERVIEW;
        }
        return ChatIntent.GENERAL;
    }

    private String buildHelpReply() {
        return """
                Minh co the ho tro ngay trong FinTrack:
                - Ghi giao dich: "an trua 45k", "nhan luong 15tr"
                - Xem tong quan tai chinh thang nay
                - Xem so du vi va han muc the
                - Kiem tra ngan sach nao sap vuot
                - Xem tien do tiet kiem va no con lai
                - Goi y ke hoach chi tieu, phan bo luong, tra no, tiet kiem, quy du phong
                - Liet ke giao dich gan nhat hoac du doan cuoi thang
                """.trim();
    }

    private String buildGeneralReply(ChatRequest request, AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        String normalized = normalize(request == null ? null : request.getMessage());
        if (isMarketPriceQuestion(normalized)) {
            return buildMarketDataReply();
        }

        if (!isFinanceScopeQuestion(request, snapshot)) {
            return buildOutOfScopeReply();
        }

        String fallback = snapshot.hasAnyData()
                ? analyzer.buildOverview(snapshot)
                : buildHelpReply();

        if (!geminiService.isAvailable()) {
            return fallback;
        }

        String history = request.getHistory() == null
                ? ""
                : request.getHistory().stream()
                .skip(Math.max(request.getHistory().size() - 6, 0))
                .map(item -> (item.getRole() == null ? "user" : item.getRole()) + ": " + item.getText())
                .collect(Collectors.joining("\n"));

        String prompt = """
                Ban la tro ly tai chinh cho ung dung FinTrack.
                Chi tra loi trong pham vi quan ly tai chinh ca nhan, giao dich, vi, ngan sach, tiet kiem, no, va ke hoach tai chinh.
                Tra loi ngan gon, thuc te, co the dung bullet neu can.

                Man hinh nguoi dung dang mo: %s

                Tom tat du lieu nguoi dung:
                %s

                Lich su gan day:
                %s

                Cau hoi hien tai:
                %s
                """.formatted(
                request.getActiveTab() == null ? "unknown" : request.getActiveTab(),
                analyzer.buildOverview(snapshot),
                history.isBlank() ? "(khong co)" : history,
                request.getMessage()
        );

        String reply = geminiService.callGemini(prompt, fallback);
        return reply == null || reply.isBlank() ? fallback : reply;
    }

    private boolean isFinanceScopeQuestion(ChatRequest request,
                                           AiFinanceSnapshotService.FinanceSnapshot snapshot) {
        String message = request == null ? null : request.getMessage();
        String normalized = normalize(message);
        if (normalized.isBlank()) {
            return true;
        }

        if (containsAny(normalized, FINANCE_KEYWORDS.toArray(String[]::new))) {
            return true;
        }

        if (snapshot.hasAnyData() && containsAny(normalized, CONTEXTUAL_FINANCE_PHRASES.toArray(String[]::new))) {
            return true;
        }

        if (containsAny(normalized, OFF_TOPIC_KEYWORDS.toArray(String[]::new))) {
            return false;
        }

        if (!geminiService.isAvailable()) {
            return false;
        }

        return classifyFinanceScopeWithGemini(message);
    }

    private boolean classifyFinanceScopeWithGemini(String message) {
        String prompt = """
                Hay phan loai cau sau co thuoc pham vi tro ly tai chinh ca nhan trong ung dung FinTrack hay khong.
                In-scope neu cau hoi lien quan den thu chi, giao dich, vi, so du, ngan sach, tiet kiem, no,
                bao cao tai chinh ca nhan, hoac loi khuyen dua tren du lieu tai chinh cua chinh nguoi dung.
                Out-of-scope neu la kien thuc chung, thoi tiet, the thao, lap trinh, toan, tin tuc, giai tri, hoac chu de khong lien quan.

                Chi tra loi dung 1 tu:
                IN_SCOPE
                hoac
                OUT_OF_SCOPE

                Cau: "%s"
                """.formatted(message == null ? "" : message);

        String result = geminiService.callGemini(prompt, "OUT_OF_SCOPE");
        return "IN_SCOPE".equalsIgnoreCase(result == null ? "" : result.trim());
    }

    private boolean isMarketPriceQuestion(String normalized) {
        return containsAny(normalized, MARKET_PRICE_KEYWORDS.toArray(String[]::new));
    }

    private String buildMarketDataReply() {
        return """
                Minh co the trao doi ve chu de kinh te hoac tai chinh chung, nhung hien khong co du lieu thi truong thoi gian thuc trong FinTrack de bao gia live nhu vang, USD, Bitcoin hay co phieu hom nay.
                Neu can, ban co the hoi theo huong phan tich hoac giai thich, vi du: "vang tang thi anh huong gi", "nen theo doi ty gia the nao", hoac "bitcoin bien dong manh do dau".
                """.trim();
    }

    private String buildOutOfScopeReply() {
        return """
                Minh chi ho tro cac cau hoi trong pham vi tai chinh ca nhan tren FinTrack.
                Ban co the hoi ve giao dich, vi, so du, ngan sach, tiet kiem, no hoac nho minh ghi nhan mot khoan thu/chi.
                Vi du: "an trua 45k", "tong quan tai chinh thang nay", "ngan sach nao sap vuot?".
                """.trim();
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
}
