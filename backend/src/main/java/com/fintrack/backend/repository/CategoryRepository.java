package com.fintrack.backend.repository;

import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    List<Category> findByTypeAndOwner_IdOrTypeAndIsDefaultTrue(
            CategoryType type1,
            String ownerId,
            CategoryType type2
    );
}