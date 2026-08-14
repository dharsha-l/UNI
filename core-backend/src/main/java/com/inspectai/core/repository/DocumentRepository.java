package com.inspectai.core.repository;

import com.inspectai.core.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByInstitutionId(Long institutionId);
    List<Document> findByInspectionId(Long inspectionId);
}
