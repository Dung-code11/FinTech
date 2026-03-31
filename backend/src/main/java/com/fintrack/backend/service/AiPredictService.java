package com.fintrack.backend.service;

import com.fintrack.backend.repository.TransactionRepository;
import com.fintrack.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AiPredictService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private GeminiService geminiService;

    public String predict(String accountId){

        BigDecimal balance = walletRepository.getTotalBalance(accountId);
        BigDecimal expense = transactionRepository.sumExpense(accountId);

        int day = LocalDate.now().getDayOfMonth();
        int totalDay = LocalDate.now().lengthOfMonth();

        BigDecimal daily = expense.divide(BigDecimal.valueOf(day), 2, BigDecimal.ROUND_HALF_UP);

        int remain = totalDay - day;

        BigDecimal predicted = balance.subtract(daily.multiply(BigDecimal.valueOf(remain)));

        String prompt = String.format("""
Số dư hiện tại: %s
Chi tiêu/ngày: %s
Dự đoán cuối tháng: %s

Nhận xét ngắn gọn.
""", balance, daily, predicted);

        return geminiService.callGemini(prompt);
    }
}
