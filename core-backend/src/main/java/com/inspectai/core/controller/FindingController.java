package com.inspectai.core.controller;

import com.inspectai.core.model.Finding;
import com.inspectai.core.repository.FindingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/findings")
public class FindingController {

    private final FindingRepository findingRepository;

    public FindingController(FindingRepository findingRepository) {
        this.findingRepository = findingRepository;
    }

    @GetMapping("/{inspectionId}")
    public List<Finding> getFindingsForInspection(@PathVariable String inspectionId) {
        return findingRepository.findByInspectionId(inspectionId);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<?> getFindingDetail(@PathVariable String id) {
        return findingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptFinding(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Finding> findingOpt = findingRepository.findById(id);
        if (findingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Finding finding = findingOpt.get();
        finding.setInspectorDecision("ACCEPTED");
        finding.setInspectorComment(body.getOrDefault("comment", "Finding verified and accepted by inspector"));
        finding.setInspectorId(body.getOrDefault("inspector_id", "usr-1"));
        finding.setDecidedAt(Instant.now().toString());

        findingRepository.save(finding);
        return ResponseEntity.ok(finding);
    }

    @PostMapping("/{id}/override")
    public ResponseEntity<?> overrideFinding(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Finding> findingOpt = findingRepository.findById(id);
        if (findingOpt.isEmpty()) return ResponseEntity.notFound().build();

        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Override reason is required"));
        }

        Finding finding = findingOpt.get();
        finding.setInspectorDecision("OVERRIDDEN");
        finding.setInspectorComment("[OVERRIDE REASON] " + reason + (body.containsKey("comment") ? " | " + body.get("comment") : ""));
        finding.setInspectorId(body.getOrDefault("inspector_id", "usr-1"));
        finding.setDecidedAt(Instant.now().toString());

        findingRepository.save(finding);
        return ResponseEntity.ok(finding);
    }
}
