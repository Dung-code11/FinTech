package com.fintrack.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    @Autowired
    private AiAnalyzerService analyzer;

    @Autowired
    private AiPredictService predictor;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private TransactionAIService transactionAIService;

    public String chat(String message, String accountId){

        String msg = message.toLowerCase();

        // 🧠 AI xử lý transaction trước
        String result = transactionAIService.handleTransaction(message, accountId);
        if(result != null){
            return result;
        }

        // 📊 phân tích
        if(msg.contains("vượt") || msg.contains("nhiều")){
            return analyzer.analyzeSpending(accountId);
        }

        if(msg.contains("rò") || msg.contains("lãng phí")){
            return analyzer.detectLeak(accountId);
        }

        if(msg.contains("dự đoán") || msg.contains("cuối tháng")){
            return predictor.predict(accountId);
        }
        return geminiService.callGemini(
                "Bạn là trợ lý tài chính thông minh. Trả lời thân thiện pha chút hóm hỉnh: " + message
        );
    }
}