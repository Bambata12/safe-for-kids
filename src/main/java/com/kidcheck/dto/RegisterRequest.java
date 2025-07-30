package com.kidcheck.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String childName;
    private String userType;

    // Constructors
    public RegisterRequest() {}

    public RegisterRequest(String name, String email, String password, String childName, String userType) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.childName = childName;
        this.userType = userType;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
