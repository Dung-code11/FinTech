package com.fintrack.backend.controller;

import com.fintrack.backend.dto.SubCategoryRequest;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.SubCategory;
import com.fintrack.backend.service.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/sub-category", "/sub-category"})
public class SubCategoryController {

    @Autowired
    private SubCategoryService service;

    @GetMapping("/{categoryId}")
    public List<SubCategory> get(@PathVariable String categoryId, Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.get(categoryId, acc.getId());
    }

    @PostMapping
    public SubCategory create(@RequestBody SubCategoryRequest req, Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        return service.create(req, acc.getId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, Authentication auth){
        Account acc = (Account) auth.getPrincipal();
        service.delete(id, acc.getId());
    }
}
