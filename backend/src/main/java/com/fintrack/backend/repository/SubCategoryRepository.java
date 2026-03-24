package com.fintrack.backend.repository;

import com.fintrack.backend.model.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {

    @Query("""
        SELECT s FROM SubCategory s
        WHERE s.category.id = :categoryId
        AND (s.owner.id = :accountId OR s.isDefault = true)
    """)
    List<SubCategory> findByCategoryAndOwner(String categoryId, String accountId);
}
