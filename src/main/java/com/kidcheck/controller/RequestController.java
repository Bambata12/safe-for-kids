package com.kidcheck.controller;

import com.kidcheck.dto.ApiResponse;
import com.kidcheck.model.CheckinRequest;
import com.kidcheck.service.CheckinRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    @Autowired
    private CheckinRequestService requestService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CheckinRequest>>> getAllRequests() {
        try {
            List<CheckinRequest> requests = requestService.getAllRequests();
            return ResponseEntity.ok(ApiResponse.success(requests));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to get requests"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CheckinRequest>> createRequest(@RequestBody Map<String, String> requestData) {
        try {
            CheckinRequest request = requestService.createRequest(
                requestData.get("type"),
                requestData.get("childName"),
                requestData.get("childGrade"),
                requestData.get("parentEmail"),
                requestData.get("parentName"),
                requestData.get("requestMessage")
            );
            
            return ResponseEntity.ok(ApiResponse.success(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to create request"));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<CheckinRequest>> updateRequest(@RequestBody Map<String, String> updateData) {
        try {
            CheckinRequest request = requestService.updateRequest(
                updateData.get("id"),
                updateData.get("status"),
                updateData.get("feedback")
            );
            
            return ResponseEntity.ok(ApiResponse.success(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to update request"));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<String>> deleteRequest(@RequestBody Map<String, String> deleteData) {
        try {
            boolean deleted = requestService.deleteRequest(deleteData.get("id"));
            
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Request deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Request not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to delete request"));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        try {
            Map<String, Long> stats = Map.of(
                "pending", requestService.getPendingRequestsCount(),
                "processed", requestService.getProcessedRequestsCount(),
                "total", (long) requestService.getAllRequests().size()
            );
            
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to get stats"));
        }
    }
}
