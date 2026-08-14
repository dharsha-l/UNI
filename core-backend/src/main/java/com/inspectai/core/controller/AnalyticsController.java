package com.inspectai.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @GetMapping("/claims/{inspectionId}")
    public ResponseEntity<?> getClaims(@PathVariable String inspectionId) {
        List<Map<String, Object>> claims = List.of(
            Map.of(
                "id", "clm-1",
                "category", "Infrastructure",
                "claim_name", "Barrier-free Ramps",
                "value", "Available at all 4 main building blocks",
                "source_document", "SSR_2026.pdf",
                "page_number", 14,
                "confidence", 0.94
            ),
            Map.of(
                "id", "clm-2",
                "category", "Safety",
                "claim_name", "Fire Safety NOC",
                "value", "Valid till Dec 2026",
                "source_document", "Fire_NOC.pdf",
                "page_number", 22,
                "confidence", 0.98
            ),
            Map.of(
                "id", "clm-3",
                "category", "Academic",
                "claim_name", "Computer Labs",
                "value", "12 functional labs with 600 total PCs",
                "source_document", "SSR_2026.pdf",
                "page_number", 45,
                "confidence", 0.91
            )
        );
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> stats = Map.of(
            "totalInspections", 12,
            "pendingInspections", 4,
            "completedInspections", 8,
            "highRiskInstitutions", 3
        );
        return ResponseEntity.ok(stats);
    }
}
