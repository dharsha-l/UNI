package com.inspectai.core.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inspections")
public class Inspection {
    @Id
    private String id;
    private String inspectionId;
    private String institutionId;
    private String inspectorId;
    private String status;
    private Double riskScore;
    private String riskLevel;
    private String createdAt;

    public Inspection() {}

    public Inspection(String id, String inspectionId, String institutionId, String inspectorId, String status, Double riskScore, String riskLevel, String createdAt) {
        this.id = id;
        this.inspectionId = inspectionId;
        this.institutionId = institutionId;
        this.inspectorId = inspectorId;
        this.status = status;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getInspectionId() { return inspectionId; }
    public void setInspectionId(String inspectionId) { this.inspectionId = inspectionId; }
    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }
    public String getInspectorId() { return inspectorId; }
    public void setInspectorId(String inspectorId) { this.inspectorId = inspectorId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
