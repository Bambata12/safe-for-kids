package com.kidcheck.service;

import com.kidcheck.model.CheckinRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CheckinRequestService {
    private final List<CheckinRequest> requests = new ArrayList<>();

    public CheckinRequest createRequest(String type, String childName, String childGrade,
                                      String parentEmail, String parentName, String requestMessage) {
        CheckinRequest request = new CheckinRequest(type, childName, childGrade, 
                                                   parentEmail, parentName, requestMessage);
        requests.add(request);
        return request;
    }

    public List<CheckinRequest> getAllRequests() {
        return requests.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<CheckinRequest> getRequestsByParentEmail(String parentEmail) {
        return requests.stream()
                .filter(request -> request.getParentEmail().equals(parentEmail))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    public Optional<CheckinRequest> findRequestById(String id) {
        return requests.stream()
                .filter(request -> request.getId().equals(id))
                .findFirst();
    }

    public CheckinRequest updateRequest(String id, String status, String feedback) {
        Optional<CheckinRequest> requestOpt = findRequestById(id);
        if (requestOpt.isPresent()) {
            CheckinRequest request = requestOpt.get();
            request.setStatus(status);
            request.setFeedback(feedback);
            request.setResponseTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            request.setUpdatedAt(LocalDateTime.now());
            return request;
        }
        throw new RuntimeException("Request not found");
    }

    public boolean deleteRequest(String id) {
        return requests.removeIf(request -> request.getId().equals(id));
    }

    public long getPendingRequestsCount() {
        return requests.stream()
                .filter(request -> "pending".equals(request.getStatus()))
                .count();
    }

    public long getProcessedRequestsCount() {
        return requests.stream()
                .filter(request -> !"pending".equals(request.getStatus()))
                .count();
    }
}
