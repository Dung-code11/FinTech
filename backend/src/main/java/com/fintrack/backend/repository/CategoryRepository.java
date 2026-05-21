package com.fintrack.backend.repository;

import com.fintrack.backend.enums.CategoryType;
import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    List<Category> findByTypeAndOwner_IdOrTypeAndIsDefaultTrue(
            CategoryType type1,
            String ownerId,
            CategoryType type2
    );

    Optional<Category> findByCategoryName(String categoryName);

    @Query("""
    SELECT c FROM Category c
    WHERE LOWER(c.categoryName) = LOWER(:name)
    AND (c.owner.id = :accountId OR c.isDefault = true)
    """)
    Optional<Category> findSmartCategory(
            @Param("name") String name,
            @Param("accountId") String accountId
    );

    @Query("""
    SELECT c FROM Category c
    WHERE LOWER(c.categoryName) = LOWER(:name)
    AND c.type = :type
    AND ((c.owner IS NOT NULL AND c.owner.id = :accountId) OR c.isDefault = true)
    """)
    Optional<Category> findSmartCategoryByNameAndType(
            @Param("name") String name,
            @Param("type") CategoryType type,
            @Param("accountId") String accountId
    );

    Optional<Category> findByCategoryNameAndOwnerId(String categoryName, String ownerId);

    List<Category> findByOwnerIdAndType(String ownerId, TransactionType type);

    Optional<Category> findByCategoryNameAndIsDefaultTrue(String categoryName);

    List<Category> findByOwnerAndType(Account account, CategoryType categoryType);

    @Query("""
        SELECT c FROM Category c
        WHERE c.type = :type
        AND (c.owner.id = :ownerId OR c.isDefault = true)
    """)
    List<Category> findByTypeAndOwnerIdOrIsDefaultTrue(
            @Param("type") CategoryType type,
            @Param("ownerId") String ownerId
    );

    @Query("""
        SELECT c FROM Category c
        WHERE c.categoryName = :name
        AND c.owner IS NULL
        AND c.type = :type
    """)
    Optional<Category> findByCategoryNameAndOwnerIsNullAndType(
            @Param("name") String name,
            @Param("type") CategoryType type
    );

    List<Category> findByOwnerId(String ownerId);

    List<Category> findByIsDefaultTrue();

    @Query("""
        SELECT c FROM Category c
        WHERE c.type = :type
        AND (c.owner.id = :ownerId OR c.isDefault = true)
    """)
    List<Category> findCategoriesForUserByType(
            @Param("type") CategoryType type,
            @Param("ownerId") String ownerId
    );

    @Query("""
        SELECT COUNT(t) FROM Transaction t
        WHERE t.category.id = :categoryId
    """)
    long countTransactionsByCategoryId(@Param("categoryId") String categoryId);

    @Query("""
        SELECT COUNT(s) FROM SubCategory s
        WHERE s.category.id = :categoryId
    """)
    long countSubCategoriesByCategoryId(@Param("categoryId") String categoryId);
}
