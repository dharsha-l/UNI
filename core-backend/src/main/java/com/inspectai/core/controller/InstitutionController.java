package com.inspectai.core.controller;

import com.inspectai.core.model.Institution;
import com.inspectai.core.repository.InstitutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    public InstitutionController(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInstitutionById(@PathVariable String id) {
        return institutionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Institution createInstitution(@RequestBody Institution institution) {
        if (institution.getId() == null || institution.getId().isEmpty()) {
            institution.setId(UUID.randomUUID().toString());
        }
        return institutionRepository.save(institution);
    }
}
