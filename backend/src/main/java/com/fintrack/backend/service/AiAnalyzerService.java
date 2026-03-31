package com.fintrack.backend.service;

import com.fintrack.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AiAnalyzerService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private GeminiService geminiService;

    // 🚨 Cảnh báo vượt mức
    public String analyzeSpending(String accountId){

        BigDecimal expense = transactionRepository.sumExpense(accountId);
        BigDecimal avg = transactionRepository.avgLast3MonthsExpense(accountId);

        if(avg == null) avg = BigDecimal.ZERO;

        if(expense.compareTo(avg.multiply(BigDecimal.valueOf(1.2))) > 0){
            return "⚠️ Bạn đang chi tiêu vượt mức trung bình!";
        }

        String prompt = String.format("""
Bạn là chuyên gia tài chính.

Chi tháng: %s
Trung bình: %s

Nhận xét ngắn gọn.
""", expense, avg);

        return geminiService.callGemini(prompt);
    }

    // 💧 Phát hiện rò rỉ
    public String detectLeak(String accountId){

        List<Object[]> data = transactionRepository.findSmallFrequent(accountId);

        StringBuilder text = new StringBuilder();

        for(Object[] row : data){
            text.append(row[0]).append(": ")
                    .append(row[1]).append(" lần - ")
                    .append(row[2]).append("\n");
        }

        String prompt = """
Phân tích chi tiêu nhỏ lặp lại:

""" + text + """

Cảnh báo rò rỉ tài chính.
Trả lời ngắn gọn.
""";

        return geminiService.callGemini(prompt);
    }
}
