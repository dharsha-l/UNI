package com.inspectai.core.repository;

import com.inspectai.core.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InspectionRepository extends JpaRepository<Inspection, String> {
    List<Inspection> findByInstitutionId(String institutionId);
}
