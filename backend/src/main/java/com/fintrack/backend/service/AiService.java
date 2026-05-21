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
                Mình có thể hỗ trợ ngay trong FinTrack:
                - Ghi giao dịch: "ăn trưa 45k", "nhận lương 15tr"
                - Xem tổng quan tài chính tháng này
                - Xem số dư ví và hạn mức thẻ
                - Kiểm tra ngân sách nào sắp vượt
                - Xem tiến độ tiết kiệm và nợ còn lại
                - Liệt kê giao dịch gần nhất hoặc dự đoán cuối tháng
                """.trim();
    }

    private String buildGeneralReply(ChatRequest request, AiFinanceSnapshotService.FinanceSnapshot snapshot) {
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
                Bạn là trợ lý tài chính cho ứng dụng FinTrack.
                Chỉ trả lời trong phạm vi quản lý tài chính cá nhân, giao dịch, ví, ngân sách, tiết kiệm và nợ.
                Trả lời ngắn gọn, thực tế, có thể dùng bullet nếu cần.

                Màn hình người dùng đang mở: %s

                Tóm tắt dữ liệu người dùng:
                %s

                Lịch sử gần đây:
                %s

                Câu hỏi hiện tại:
                %s
                """.formatted(
                request.getActiveTab() == null ? "unknown" : request.getActiveTab(),
                analyzer.buildOverview(snapshot),
                history.isBlank() ? "(không có)" : history,
                request.getMessage()
        );

        String reply = geminiService.callGemini(prompt, fallback);
        return reply == null || reply.isBlank() ? fallback : reply;
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
