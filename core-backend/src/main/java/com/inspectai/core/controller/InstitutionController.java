package com.inspectai.core.controller;

import com.inspectai.core.model.Institution;
import com.inspectai.core.repository.InstitutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "*")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    public InstitutionController(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAllInstitutions() {
        List<Institution> list = institutionRepository.findAll();
        return list.stream().map(this::formatInstitution).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInstitutionById(@PathVariable String id) {
        return institutionRepository.findById(id)
                .map(inst -> ResponseEntity.ok(formatInstitution(inst)))
                .orElseGet(() -> {
                    // Try looking up by code or fallback
                    List<Institution> all = institutionRepository.findAll();
                    for (Institution inst : all) {
                        if (id.equalsIgnoreCase(inst.getId()) || id.equalsIgnoreCase(inst.getCode())) {
                            return ResponseEntity.ok(formatInstitution(inst));
                        }
                    }
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<?> createInstitution(@RequestBody Institution institution) {
        if (institution.getId() == null || institution.getId().isEmpty()) {
            institution.setId("inst-" + (System.currentTimeMillis() % 10000));
        }
        Institution saved = institutionRepository.save(institution);
        return ResponseEntity.ok(formatInstitution(saved));
    }

    private Map<String, Object> formatInstitution(Institution inst) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", inst.getId());
        map.put("name", inst.getName() != null ? inst.getName() : "Institutional Campus");
        map.put("code", inst.getCode() != null ? inst.getCode() : "INST-001");
        
        String aishe = inst.getAisheCode() != null ? inst.getAisheCode() : "C-24151";
        map.put("aishe_code", aishe);
        map.put("aisheCode", aishe);

        String location = inst.getCity() != null && inst.getState() != null 
                ? inst.getCity() + ", " + inst.getState() 
                : "Bengaluru, Karnataka";
        map.put("location", location);
        map.put("city", inst.getCity() != null ? inst.getCity() : "Bengaluru");
        map.put("state", inst.getState() != null ? inst.getState() : "Karnataka");
        map.put("address", inst.getAddress() != null ? inst.getAddress() : "Innovation Campus");

        map.put("type", inst.getType() != null ? inst.getType() : "Technical Institution");
        map.put("accreditation_status", "NAAC A+");
        map.put("accreditationStatus", "NAAC A+");
        map.put("students", 4500);
        map.put("programs", 18);
        map.put("established", "2005");
        map.put("faculty", 280);
        map.put("contactEmail", inst.getContactEmail() != null ? inst.getContactEmail() : "contact@institution.edu");
        map.put("contactPhone", inst.getContactPhone() != null ? inst.getContactPhone() : "+91 80 2345 6789");

        return map;
    }
}
