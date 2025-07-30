package com.kidcheck.service;

import com.kidcheck.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final List<User> users = new ArrayList<>();

    public User registerUser(String name, String email, String password, String childName, String userType) {
        // Check if user already exists
        if (findUserByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User(name, email, password, childName, userType);
        users.add(user);
        return user;
    }

    public Optional<User> loginUser(String email, String password, String userType) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email) && 
                               user.getPassword().equals(password) &&
                               user.getUserType().equals(userType))
                .findFirst();
    }

    public Optional<User> findUserByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users);
    }
}
