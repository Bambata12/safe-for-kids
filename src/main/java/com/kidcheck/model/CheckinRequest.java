package com.kidcheck.model;

import java.time.LocalDateTime;

public class CheckinRequest {
    private String id;
    private String type; // "checkin" or "checkout"
    private String childName;
    private String childGrade;
    private String parentEmail;
    private String parentName;
    private String requestMessage;
    private String status; // "pending", "approved", "rejected"
    private String feedback;
    private String responseTime;
    private LocalDateTime timestamp;
    private LocalDateTime updatedAt;

    // Constructors
    public CheckinRequest() {
        this.timestamp = LocalDateTime.now();
        this.status = "pending";
    }

    public CheckinRequest(String type, String childName, String childGrade, 
                         String parentEmail, String parentName, String requestMessage) {
        this.id = generateId();
        this.type = type;
        this.childName = childName;
        this.childGrade = childGrade;
        this.parentEmail = parentEmail;
        this.parentName = parentName;
        this.requestMessage = requestMessage;
        this.status = "pending";
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public String getChildGrade() {
        return childGrade;
    }

    public void setChildGrade(String childGrade) {
        this.childGrade = childGrade;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getRequestMessage() {
        return requestMessage;
    }

    public void setRequestMessage(String requestMessage) {
        this.requestMessage = requestMessage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(String responseTime) {
        this.responseTime = responseTime;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility method to generate ID
    private String generateId() {
        return String.valueOf(System.currentTimeMillis()) + 
               String.valueOf((int)(Math.random() * 1000));
    }
}
