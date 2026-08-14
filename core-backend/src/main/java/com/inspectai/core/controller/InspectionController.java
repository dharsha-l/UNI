package com.inspectai.core.controller;

import com.inspectai.core.model.Inspection;
import com.inspectai.core.model.Institution;
import com.inspectai.core.repository.InspectionRepository;
import com.inspectai.core.repository.InstitutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionRepository inspectionRepository;
    private final InstitutionRepository institutionRepository;

    public InspectionController(InspectionRepository inspectionRepository, InstitutionRepository institutionRepository) {
        this.inspectionRepository = inspectionRepository;
        this.institutionRepository = institutionRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAllInspections() {
        List<Inspection> list = inspectionRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Inspection i : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", i.getId());
            map.put("inspection_id", i.getInspectionId());
            map.put("institution_id", i.getInstitutionId());
            map.put("inspector_id", i.getInspectorId());
            map.put("status", i.getStatus());
            map.put("risk_score", i.getRiskScore());
            map.put("risk_level", i.getRiskLevel());
            map.put("created_at", i.getCreatedAt());

            institutionRepository.findById(i.getInstitutionId()).ifPresent(inst -> {
                map.put("institution_name", inst.getName());
            });
            map.put("inspector_name", "Dr. Rajesh Sharma");
            result.add(map);
        }
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInspectionById(@PathVariable String id) {
        Optional<Inspection> inspOpt = inspectionRepository.findById(id);
        if (inspOpt.isEmpty()) return ResponseEntity.notFound().build();

        Inspection i = inspOpt.get();
        Map<String, Object> map = new HashMap<>();
        map.put("id", i.getId());
        map.put("inspection_id", i.getInspectionId());
        map.put("institution_id", i.getInstitutionId());
        map.put("inspector_id", i.getInspectorId());
        map.put("status", i.getStatus());
        map.put("risk_score", i.getRiskScore());
        map.put("risk_level", i.getRiskLevel());
        map.put("created_at", i.getCreatedAt());

        institutionRepository.findById(i.getInstitutionId()).ifPresent(inst -> {
            map.put("institution_name", inst.getName());
        });
        map.put("inspector_name", "Dr. Rajesh Sharma");
        return ResponseEntity.ok(map);
    }

    @PostMapping
    public Inspection createInspection(@RequestBody Inspection inspection) {
        inspection.setId(UUID.randomUUID().toString());
        inspection.setInspectionId("INS-2026-" + (new Random().nextInt(800) + 100));
        inspection.setStatus("In Progress");
        inspection.setRiskScore(0.0);
        inspection.setRiskLevel("Low");
        inspection.setCreatedAt(Instant.now().toString());
        return inspectionRepository.save(inspection);
    }
}
