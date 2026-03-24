package com.fintrack.backend.service;

import com.fintrack.backend.dto.CategoryRequest;
import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Category;
import com.fintrack.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.*;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getByType(String type, String accountId){

        CategoryType t = CategoryType.valueOf(type);

        return categoryRepository
                .findByTypeAndOwner_IdOrTypeAndIsDefaultTrue(t, accountId, t);
    }

    public Category create(CategoryRequest req, String accountId){

        Category c = new Category();
        c.setId(UUID.randomUUID().toString());
        c.setCategoryName(req.name);
        c.setType(CategoryType.valueOf(req.type));
        c.setIsDefault(false);

        Account acc = new Account();
        acc.setId(accountId);
        c.setOwner(acc);

        return categoryRepository.save(c);
    }

    public Category update(String id, CategoryRequest req, String accountId){

        Category c = categoryRepository.findById(id)
                .orElseThrow();

        if(c.getOwner() != null && !c.getOwner().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        if(Boolean.TRUE.equals(c.getIsDefault())){
            throw new RuntimeException("Cannot modify default");
        }

        c.setCategoryName(req.name);
        c.setType(CategoryType.valueOf(req.type));

        return categoryRepository.save(c);
    }

    public void delete(String id, String accountId){

        Category c = categoryRepository.findById(id)
                .orElseThrow();

        if(c.getOwner() != null && !c.getOwner().getId().equals(accountId)){
            throw new RuntimeException("Access denied");
        }

        categoryRepository.delete(c);
    }
}
