package com.inspectai.core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "findings")
public class Finding {
    @Id
    private String id;
    private String inspectionId;
    private String findingNumber;
    private String category;
    private String title;
    @Column(length = 2000)
    private String description;
    @Column(length = 1000)
    private String evidence;
    private String risk;
    private String status;
    private Double aiConfidence;
    private String inspectorDecision;
    @Column(length = 1000)
    private String inspectorComment;
    private String inspectorId;
    private String decidedAt;
    private String createdAt;

    public Finding() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getInspectionId() { return inspectionId; }
    public void setInspectionId(String inspectionId) { this.inspectionId = inspectionId; }
    public String getFindingNumber() { return findingNumber; }
    public void setFindingNumber(String findingNumber) { this.findingNumber = findingNumber; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }
    public String getRisk() { return risk; }
    public void setRisk(String risk) { this.risk = risk; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }
    public String getInspectorDecision() { return inspectorDecision; }
    public void setInspectorDecision(String inspectorDecision) { this.inspectorDecision = inspectorDecision; }
    public String getInspectorComment() { return inspectorComment; }
    public void setInspectorComment(String inspectorComment) { this.inspectorComment = inspectorComment; }
    public String getInspectorId() { return inspectorId; }
    public void setInspectorId(String inspectorId) { this.inspectorId = inspectorId; }
    public String getDecidedAt() { return decidedAt; }
    public void setDecidedAt(String decidedAt) { this.decidedAt = decidedAt; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
