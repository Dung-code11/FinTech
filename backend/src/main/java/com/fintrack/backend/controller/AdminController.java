package com.fintrack.backend.controller;

import com.fintrack.backend.dto.CategoryRequest;
import com.fintrack.backend.dto.Response.AdminCategoryResponse;
import com.fintrack.backend.dto.Response.AdminStatsResponse;
import com.fintrack.backend.dto.Response.AdminTransactionResponse;
import com.fintrack.backend.dto.Response.AdminUserResponse;
import com.fintrack.backend.enums.Role;
import com.fintrack.backend.model.Account;
import com.fintrack.backend.model.Debt;
import com.fintrack.backend.model.Saving;
import com.fintrack.backend.model.Wallet;
import com.fintrack.backend.repository.DebtRepository;
import com.fintrack.backend.repository.SavingRepository;
import com.fintrack.backend.repository.WalletRepository;
import com.fintrack.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private SavingRepository savingRepository;

    // ========== KIỂM TRA QUYỀN ADMIN ==========
    private void checkAdmin(Authentication auth) {
        Account account = (Account) auth.getPrincipal();
        if (account.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied. Admin role required.");
        }
    }

    // ========== THỐNG KÊ HỆ THỐNG ==========
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats(Authentication auth) {
        checkAdmin(auth);
        return ResponseEntity.ok(adminService.getStats());
    }

    // ========== QUẢN LÝ NGƯỜI DÙNG ==========
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(
            Authentication auth,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active
    ) {
        checkAdmin(auth);
        List<AdminUserResponse> users = adminService.getAllUsers();

        // Filter theo search
        if (search != null && !search.isBlank()) {
            String s = search.toLowerCase();
            users = users.stream()
                    .filter(u -> (u.getFullname() != null && u.getFullname().toLowerCase().contains(s))
                            || (u.getUsername() != null && u.getUsername().toLowerCase().contains(s))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(s)))
                    .toList();
        }

        // Filter theo role
        if (role != null && !role.isBlank()) {
            users = users.stream()
                    .filter(u -> u.getRole().equalsIgnoreCase(role))
                    .toList();
        }

        // Filter theo active status
        if (active != null) {
            users = users.stream()
                    .filter(u -> u.getIsActived().equals(active))
                    .toList();
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(
            @PathVariable String id,
            Authentication auth
    ) {
        checkAdmin(auth);
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> toggleUserStatus(
            @PathVariable String id,
            @RequestParam boolean active,
            Authentication auth
    ) {
        checkAdmin(auth);
        adminService.toggleAccountStatus(id, active);

        Map<String, String> response = new HashMap<>();
        response.put("message", active ? "Tài khoản đã được kích hoạt" : "Tài khoản đã bị khóa");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable String id,
            @RequestParam String role,
            Authentication auth
    ) {
        checkAdmin(auth);
        adminService.updateUserRole(id, role);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã cập nhật vai trò thành " + role);
        return ResponseEntity.ok(response);
    }

    // ========== QUẢN LÝ VÍ ==========
    @GetMapping("/wallets")
    public ResponseEntity<List<Map<String, Object>>> getAllWallets(Authentication auth) {
        checkAdmin(auth);
        List<Wallet> wallets = walletRepository.findAll();

        List<Map<String, Object>> result = wallets.stream().map(w -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", w.getId());
            map.put("name", w.getName());
            map.put("type", w.getType() != null ? w.getType().name() : null);
            map.put("currency", w.getCurrency());
            map.put("initialBalance", w.getInitialBalance());
            map.put("creditLimit", w.getCreditLimit());
            map.put("unpaidBalance", w.getUnpaidBalance());
            map.put("expiryDate", w.getExpiryDate());
            if (w.getAccount() != null) {
                map.put("username", w.getAccount().getUsername());
                map.put("accountId", w.getAccount().getId());
                map.put("userRole", w.getAccount().getRole().name());
            }
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // ========== QUẢN LÝ GIAO DỊCH ==========
    @GetMapping("/categories")
    public ResponseEntity<List<AdminCategoryResponse>> getAllCategories(
            Authentication auth,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String scope
    ) {
        checkAdmin(auth);
        List<AdminCategoryResponse> categories = adminService.getAllCategories();

        if (search != null && !search.isBlank()) {
            String s = search.toLowerCase();
            categories = categories.stream()
                    .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(s))
                            || (c.getOwnerUsername() != null && c.getOwnerUsername().toLowerCase().contains(s)))
                    .toList();
        }

        if (type != null && !type.isBlank()) {
            categories = categories.stream()
                    .filter(c -> c.getType() != null && c.getType().equalsIgnoreCase(type))
                    .toList();
        }

        if (scope != null && !scope.isBlank()) {
            if ("default".equalsIgnoreCase(scope)) {
                categories = categories.stream()
                        .filter(c -> Boolean.TRUE.equals(c.getIsDefault()))
                        .toList();
            } else if ("custom".equalsIgnoreCase(scope)) {
                categories = categories.stream()
                        .filter(c -> !Boolean.TRUE.equals(c.getIsDefault()))
                        .toList();
            }
        }

        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<AdminCategoryResponse> createCategory(
            @RequestBody CategoryRequest request,
            Authentication auth
    ) {
        checkAdmin(auth);
        return ResponseEntity.ok(adminService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<AdminCategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestBody CategoryRequest request,
            Authentication auth
    ) {
        checkAdmin(auth);
        return ResponseEntity.ok(adminService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(
            @PathVariable String id,
            Authentication auth
    ) {
        checkAdmin(auth);
        adminService.deleteCategory(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Xoa danh muc thanh cong");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<AdminTransactionResponse>> getAllTransactions(
            Authentication auth,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String accountId
    ) {
        checkAdmin(auth);
        List<AdminTransactionResponse> transactions = adminService.getAllTransactions();

        // Filter theo type
        if (type != null && !type.isBlank()) {
            transactions = transactions.stream()
                    .filter(t -> t.getType().equalsIgnoreCase(type))
                    .toList();
        }

        // Filter theo search (description, username)
        if (search != null && !search.isBlank()) {
            String s = search.toLowerCase();
            transactions = transactions.stream()
                    .filter(t -> (t.getDescription() != null && t.getDescription().toLowerCase().contains(s))
                            || (t.getUsername() != null && t.getUsername().toLowerCase().contains(s)))
                    .toList();
        }

        // Filter theo accountId
        if (accountId != null && !accountId.isBlank()) {
            transactions = transactions.stream()
                    .filter(t -> accountId.equals(t.getAccountId()))
                    .toList();
        }

        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Map<String, String>> deleteTransaction(
            @PathVariable String id,
            Authentication auth
    ) {
        checkAdmin(auth);
        // Xóa transaction (admin có quyền xóa bất kỳ transaction nào)
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa giao dịch thành công");
        return ResponseEntity.ok(response);
    }

    // ========== QUẢN LÝ NỢ ==========
    @GetMapping("/debts")
    public ResponseEntity<List<Map<String, Object>>> getAllDebts(Authentication auth) {
        checkAdmin(auth);
        List<Debt> debts = debtRepository.findAll();

        List<Map<String, Object>> result = debts.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("currency", d.getCurrency());
            map.put("totalAmount", d.getTotalAmount());
            map.put("remainingAmount", d.getRemainingAmount());
            map.put("createdDate", d.getCreatedDate());
            map.put("targetDate", d.getTargetDate());
            map.put("note", d.getNote());
            map.put("paymentCount", d.getPayments() != null ? d.getPayments().size() : 0);
            if (d.getWallet() != null) {
                map.put("walletName", d.getWallet().getName());
                map.put("walletId", d.getWallet().getId());
                if (d.getWallet().getAccount() != null) {
                    map.put("username", d.getWallet().getAccount().getUsername());
                    map.put("accountId", d.getWallet().getAccount().getId());
                }
            }
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // ========== QUẢN LÝ TIẾT KIỆM ==========
    @GetMapping("/savings")
    public ResponseEntity<List<Map<String, Object>>> getAllSavings(Authentication auth) {
        checkAdmin(auth);
        List<Saving> savings = savingRepository.findAll();

        List<Map<String, Object>> result = savings.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("title", s.getTitle());
            map.put("currency", s.getCurrency());
            map.put("targetAmount", s.getTargetAmount());
            map.put("currentAmount", s.getCurrentAmount());
            map.put("type", s.getType() != null ? s.getType().name() : null);
            map.put("category", s.getCategory());
            map.put("targetDate", s.getTargetDate());
            map.put("period", s.getPeriod() != null ? s.getPeriod().name() : null);
            map.put("status", s.getStatus() != null ? s.getStatus().name() : null);
            map.put("transactionCount", s.getTransactions() != null ? s.getTransactions().size() : 0);
            if (s.getWallet() != null) {
                map.put("walletName", s.getWallet().getName());
                map.put("walletId", s.getWallet().getId());
                if (s.getWallet().getAccount() != null) {
                    map.put("username", s.getWallet().getAccount().getUsername());
                    map.put("accountId", s.getWallet().getAccount().getId());
                }
            }
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // ========== DASHBOARD TỔNG HỢP ==========
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData(Authentication auth) {
        checkAdmin(auth);
        AdminStatsResponse stats = adminService.getStats();
        List<AdminTransactionResponse> recentTransactions = adminService.getAllTransactions();

        // Lấy 10 giao dịch gần nhất
        List<AdminTransactionResponse> last10 = recentTransactions.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(10)
                .toList();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("stats", stats);
        dashboard.put("recentTransactions", last10);

        return ResponseEntity.ok(dashboard);
    }
}
