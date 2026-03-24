package com.fintrack.backend.service;

import com.fintrack.backend.dto.SubCategoryRequest;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Category;
import com.fintrack.backend.model.SubCategory;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SubCategoryService {

    @Autowired
    private SubCategoryRepository subRepo;

    @Autowired
    private CategoryRepository categoryRepo;

    public List<SubCategory> get(String categoryId, String accountId){
        return subRepo.findByCategoryAndOwner(categoryId, accountId);
    }

    public SubCategory create(SubCategoryRequest req, String accountId){

        Category category = categoryRepo.findById(req.categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        SubCategory s = new SubCategory();
        s.setId(UUID.randomUUID().toString());
        s.setSubcategoryName(req.name);
        s.setCategory(category);
        s.setIsDefault(false);

        Account acc = new Account();
        acc.setId(accountId);
        s.setOwner(acc);

        return subRepo.save(s);
    }

    public void delete(String id, String accountId){

        SubCategory s = subRepo.findById(id).orElseThrow();

        if(s.getOwner() != null && !s.getOwner().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        subRepo.delete(s);
    }
}
