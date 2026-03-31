package com.fintrack.backend.mapper;

import com.fintrack.backend.dto.Response.WalletResponse;
import com.fintrack.backend.enums.WalletType;
import com.fintrack.backend.model.Wallet;

import java.math.BigDecimal;

public class WalletMapper {

    public static WalletResponse toDTO(Wallet w) {
        WalletResponse res = new WalletResponse();

        res.id = w.getId();
        res.name = w.getName();
        res.currency = w.getCurrency();
        res.type = w.getType().name();

        // 🔥 CHỐT LOGIC Ở ĐÂY
        if (w.getType() == WalletType.CASH) {
            res.balance = w.getInitialBalance();
        } else if (w.getType() == WalletType.CREDIT) {

            BigDecimal limit = w.getCreditLimit() != null ? w.getCreditLimit() : BigDecimal.ZERO;
            BigDecimal unpaid = w.getUnpaidBalance() != null ? w.getUnpaidBalance() : BigDecimal.ZERO;

            // 👉 số tiền còn dùng được
            res.balance = limit.subtract(unpaid);
        }

        res.creditLimit = w.getCreditLimit();
        res.unpaidBalance = w.getUnpaidBalance();
        res.expiryDate = w.getExpiryDate();

        return res;
    }
}