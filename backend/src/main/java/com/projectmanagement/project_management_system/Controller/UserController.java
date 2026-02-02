package com.projectmanagement.project_management_system.Controller;

import com.projectmanagement.project_management_system.DTO.RegisterRequestDTO;
import com.projectmanagement.project_management_system.DTO.UserResponseDTO;
import com.projectmanagement.project_management_system.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequestDTO request) {
        UserResponseDTO userResponseDTO = userService.saveUser(request);
        return ResponseEntity.status(201).body(userResponseDTO);
    }

    @GetMapping("/user")
    public ResponseEntity<String> getUserDetails(){
        return ResponseEntity.ok("Fetched user details successfully");
    }

    @GetMapping("/validate-token")  // Fixed: removed duplicate /auth and typo
    public ResponseEntity<?> validateToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Return success response with user info
        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("email", email);
        response.put("message", "Token is valid");

        return ResponseEntity.ok(response);
    }
}
