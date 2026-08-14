package com.inspectai.core.repository;

import com.inspectai.core.model.Finding;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FindingRepository extends JpaRepository<Finding, String> {
    List<Finding> findByInspectionId(String inspectionId);
}
