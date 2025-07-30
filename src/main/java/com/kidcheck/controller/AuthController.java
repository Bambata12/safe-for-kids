package com.kidcheck.controller;

import com.kidcheck.dto.ApiResponse;
import com.kidcheck.dto.LoginRequest;
import com.kidcheck.dto.RegisterRequest;
import com.kidcheck.model.User;
import com.kidcheck.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getChildName(),
                request.getUserType()
            );
            
            // Remove password from response
            user.setPassword(null);
            
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Registration failed"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userService.loginUser(
                request.getEmail(),
                request.getPassword(),
                request.getUserType()
            );

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Remove password from response
                user.setPassword(null);
                return ResponseEntity.ok(ApiResponse.success(user));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Login failed"));
        }
    }
}
