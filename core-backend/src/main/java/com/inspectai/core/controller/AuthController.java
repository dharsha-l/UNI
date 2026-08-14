package com.inspectai.core.controller;

import com.inspectai.core.model.User;
import com.inspectai.core.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Email is required"));
        }

        email = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Auto-provision demo user account so login never fails during demo
            String role = "INSPECTOR";
            String name = "Dr. Rajesh Sharma";
            if (email.contains("admin")) {
                role = "INSPECTION_ADMIN";
                name = "System Administrator";
            } else if (email.contains("inst") || email.contains("college") || email.contains("abctech")) {
                role = "INSTITUTION_ADMIN";
                name = "Institutional Admin (ABC Tech)";
            }

            user = new User("usr-" + (System.currentTimeMillis() % 10000), name, email, password != null ? password : "password123", role);
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", "demo-jwt-token-" + System.currentTimeMillis(),
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
            )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        User user = userRepository.findAll().stream().findFirst()
                .orElse(new User("usr-1", "Dr. Rajesh Sharma", "inspector@demo.com", "inspector123", "INSPECTOR"));
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset link sent to email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
    }
}
