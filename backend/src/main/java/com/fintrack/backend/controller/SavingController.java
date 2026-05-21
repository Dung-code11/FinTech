package com.fintrack.backend.controller;



import com.fintrack.backend.dto.*;
import com.fintrack.backend.dto.Response.SavingResponse;
import com.fintrack.backend.mapper.SavingMapper;
import com.fintrack.backend.model.Saving;
import com.fintrack.backend.service.SavingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/savings", "/savings"})
@RequiredArgsConstructor
public class SavingController {

    private final SavingService savingService;

    @PostMapping("/{walletId}")
    public SavingResponse create(
            @PathVariable String walletId,
            @RequestBody SavingRequest request
    ) {
        Saving saving = savingService.createSaving(walletId, request);
        return SavingMapper.toDTO(saving);
    }

    @GetMapping("/{walletId}")
    public List<SavingResponse> getByWallet(@PathVariable String walletId) {
        return savingService.getByWallet(walletId)
                .stream()
                .map(SavingMapper::toDTO)
                .toList();
    }

    @PostMapping("/deposit/{savingId}")
    public SavingResponse deposit(
            @PathVariable String savingId,
            @RequestBody SavingTransactionRequest request
    ) {
        Saving saving = savingService.addMoney(savingId, request);
        return SavingMapper.toDTO(saving);
    }
    @PostMapping("/withdraw/{savingId}")
    public SavingResponse withdraw(
            @PathVariable String savingId,
            @RequestBody WithdrawSavingRequest request
    ) {
        return SavingMapper.toDTO(
                savingService.withdraw(savingId, request)
        );
    }
}
