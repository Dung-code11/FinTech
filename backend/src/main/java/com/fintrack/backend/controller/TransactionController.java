package com.fintrack.backend.controller;

import com.fintrack.backend.dto.TransactionRequest;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/transaction", "/transaction"})
public class TransactionController {

    @Autowired
    private TransactionService service;

    // 🟢 GET ALL
    @GetMapping
    public List<Transaction> getAll(Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.getAll(acc); // Sửa: truyền Account thay vì String
    }

    // 🟢 GET BY ID
    @GetMapping("/{id}")
    public Transaction getById(@PathVariable String id,
                               Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.getById(id, acc); // Sửa: truyền Account thay vì String
    }

    // 🟢 CREATE
    @PostMapping
    public Transaction create(@RequestBody TransactionRequest req,
                              Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.create(req, acc); // Sửa: truyền Account thay vì String
    }

    // 🟡 UPDATE
    @PutMapping("/{id}")
    public Transaction update(@PathVariable String id,
                              @RequestBody TransactionRequest req,
                              Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.update(id, req, acc); // Sửa: truyền Account thay vì String
    }

    // 🔴 DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable String id,
                         Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        service.delete(id, acc); // Sửa: truyền Account thay vì String
        return "Delete transaction success";
    }
}
