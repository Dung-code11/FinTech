package com.fintrack.backend.controller;

import com.fintrack.backend.dto.CategoryRequest;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Category;
import com.fintrack.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private CategoryService service;

    @GetMapping
    public List<Category> get(@RequestParam String type, Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.getByType(type, acc.getId());
    }

    @PostMapping
    public Category create(@RequestBody CategoryRequest req, Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.create(req, acc.getId());
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable String id,
                           @RequestBody CategoryRequest req,
                           Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.update(id, req, acc.getId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        service.delete(id, acc.getId());
    }
}
