package com.inspectai.core.repository;

import com.inspectai.core.model.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<Institution, String> {
}
