// UNI-INSPECTION — Mock AI Services
// These interfaces are designed to be replaced by real Python/FastAPI AI services
// Real implementations would use: Tesseract OCR, YOLOv8, sentence-transformers, FAISS/ChromaDB

// ============================================================
// DOCUMENT AI SERVICE (Mock → Tesseract OCR + NLP pipeline)
// ============================================================
export const DocumentAIService = {
  async extractClaims(documentId: string, filename: string): Promise<any[]> {
    await delay(2000);

    const claimsMap: Record<string, any[]> = {
      'SSR_ABC_2026.pdf': [
        { claim_name: 'Total Students', value: '3000', page_number: 12, confidence: 0.97, category: 'Student Data' },
        { claim_name: 'Fire Extinguishers', value: '24', page_number: 18, confidence: 0.93, category: 'Safety' },
        { claim_name: 'Barrier-Free Access', value: 'Available', page_number: 22, confidence: 0.88, category: 'Accessibility' },
        { claim_name: 'Programs Offered', value: '8', page_number: 8, confidence: 0.97, category: 'Academic' },
        { claim_name: 'Classrooms', value: '60', page_number: 15, confidence: 0.95, category: 'Infrastructure' },
      ],
      'Fire_Safety_Certificate_2026.pdf': [
        { claim_name: 'Fire Safety Certificate', value: 'Valid (2026)', page_number: 1, confidence: 0.99, category: 'Safety' },
        { claim_name: 'Certificate Issuing Authority', value: 'Tamil Nadu Fire & Rescue Services', page_number: 1, confidence: 0.97, category: 'Safety' },
        { claim_name: 'Certificate Valid Until', value: '31 March 2027', page_number: 1, confidence: 0.99, category: 'Safety' },
      ],
      'Faculty_Records_2026.pdf': [
        { claim_name: 'Total Faculty', value: '150', page_number: 3, confidence: 0.96, category: 'Faculty Data' },
        { claim_name: 'PhD Holders', value: '62', page_number: 5, confidence: 0.94, category: 'Faculty Data' },
        { claim_name: 'Average Experience', value: '12.4 years', page_number: 6, confidence: 0.92, category: 'Faculty Data' },
      ],
      'Infrastructure_Report_2026.pdf': [
        { claim_name: 'Laboratories', value: '10', page_number: 42, confidence: 0.94, category: 'Infrastructure' },
        { claim_name: 'Library Books', value: '68000', page_number: 9, confidence: 0.96, category: 'Infrastructure' },
        { claim_name: 'Total Built-up Area', value: '45000 sq.m.', page_number: 4, confidence: 0.91, category: 'Infrastructure' },
        { claim_name: 'Seminar Halls', value: '5', page_number: 6, confidence: 0.93, category: 'Infrastructure' },
      ],
    };

    return claimsMap[filename] || [
      { claim_name: 'Document Content', value: 'Extracted', page_number: 1, confidence: 0.75, category: 'General' }
    ];
  }
};

// ============================================================
// VISION AI SERVICE (YOLOv8 object detection via FastAPI with demo fallback)
// ============================================================
export const VisionAIService = {
  async detectObjects(imageId: string, filename: string, category: string, buffer?: Buffer): Promise<any[]> {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const endpoint = `${aiServiceUrl}/api/v1/ai/images/analyze`;

    if (buffer && buffer.length > 0) {
      try {
        const formData = new FormData();
        formData.append('image_id', imageId);
        formData.append('filename', filename);
        formData.append('category', category || 'General');

        const blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
        formData.append('file', blob, filename);
        formData.append('image', blob, filename);

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData as any,
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.detections)) {
            return resData.detections.map((d: any) => ({
              object_type: d.object_type || d.class || 'Detected Object',
              confidence: d.confidence || 0,
              bbox: d.bbox || null
            }));
          }
        } else {
          console.warn(`[VisionAIService] AI service returned status ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`[VisionAIService] AI service call failed: ${err.message}`);
      }
    }

    // Seeded detection results fallback for demo images
    const detectionMap: Record<string, any[]> = {
      'lab01.jpg': [
        { object_type: 'Lab Bench', confidence: 0.94, bbox: [10, 20, 400, 200] },
        { object_type: 'Lab Bench', confidence: 0.92, bbox: [420, 20, 800, 200] },
        { object_type: 'Lab Equipment', confidence: 0.87, bbox: [10, 210, 200, 350] },
        { object_type: 'Computer Workstation', confidence: 0.91, bbox: [210, 210, 400, 350] },
      ],
      'lab02.jpg': [
        { object_type: 'Lab Bench', confidence: 0.96, bbox: [10, 20, 400, 200] },
        { object_type: 'Lab Bench', confidence: 0.89, bbox: [420, 20, 800, 200] },
        { object_type: 'Lab Bench', confidence: 0.88, bbox: [10, 210, 400, 350] },
        { object_type: 'Lab Equipment', confidence: 0.85, bbox: [420, 210, 650, 350] },
        { object_type: 'Safety Cabinet', confidence: 0.83, bbox: [660, 210, 800, 350] },
      ],
      'fire_safety.jpg': [
        { object_type: 'Fire Extinguisher', confidence: 0.91, bbox: [50, 100, 150, 300] },
        { object_type: 'Fire Extinguisher', confidence: 0.88, bbox: [300, 100, 400, 300] },
        { object_type: 'Fire Extinguisher', confidence: 0.86, bbox: [550, 100, 650, 300] },
        { object_type: 'Emergency Exit Sign', confidence: 0.84, bbox: [200, 20, 500, 80] },
      ],
      'classroom01.jpg': [
        { object_type: 'Whiteboard', confidence: 0.93, bbox: [10, 10, 700, 200] },
        { object_type: 'Student Desk', confidence: 0.95, bbox: [50, 250, 200, 400] },
        { object_type: 'Student Desk', confidence: 0.94, bbox: [220, 250, 370, 400] },
        { object_type: 'Projector', confidence: 0.89, bbox: [300, 10, 500, 100] },
        { object_type: 'Student Chair', confidence: 0.96, bbox: [400, 250, 550, 400] },
      ],
      'library01.jpg': [
        { object_type: 'Bookshelf', confidence: 0.97, bbox: [10, 10, 200, 500] },
        { object_type: 'Bookshelf', confidence: 0.96, bbox: [220, 10, 410, 500] },
        { object_type: 'Reading Table', confidence: 0.91, bbox: [430, 200, 700, 400] },
        { object_type: 'Computer Terminal', confidence: 0.88, bbox: [430, 50, 600, 200] },
      ],
      'campus_entrance.jpg': [
        { object_type: 'Building Structure', confidence: 0.98, bbox: [0, 0, 800, 400] },
        { object_type: 'Signage', confidence: 0.92, bbox: [200, 50, 600, 150] },
        { object_type: 'Security Booth', confidence: 0.85, bbox: [600, 200, 780, 380] },
      ],
    };

    return detectionMap[filename] || [
      { object_type: 'Unidentified Object', confidence: 0.60, bbox: [0, 0, 100, 100] }
    ];
  }
};

// ============================================================
// EXTERNAL VERIFICATION SERVICE (Mock → AISHE/NIRF API)
// Uses local seeded JSON dataset for reliable demo operation
// ============================================================
export const ExternalVerificationService = {
  async getExternalData(institutionId: string): Promise<any> {
    await delay(1000);
    // Returns seeded data matching the UNI-INSPECTION demo scenario
    return {
      aishe: { students: 2750, faculty: 148, labs: 9, programs: 8, year: 2025 },
      nirf: { students: 2780, faculty: 147, programs: 8, year: 2024 }
    };
  }
};

// ============================================================
// CROSS VERIFICATION SERVICE — Core AI Engine (Rule-based)
// Compares: Document Claims vs Visual Evidence vs External Data
// ============================================================
export const CrossVerificationService = {
  async compare(inspectionId: string, claims: any[], detections: any[], externalData: any): Promise<any[]> {
    await delay(3000);

    // Pre-built findings for the ABC Engineering College demo
    // These match the exact UNI-INSPECTION specification:
    // Students: claimed=3000, external=2750 → HIGH risk
    // Faculty: claimed=150, external=148 → MEDIUM risk
    // Labs: claimed=10, visual=8, external=9 → MEDIUM risk (THE KEY FINDING)
    // Fire Safety: certificate valid but visual count insufficient → HIGH risk
    // Missing Document: Affiliation Certificate → MEDIUM risk
    return [
      {
        finding_number: 'F-001',
        category: 'Student Data',
        title: 'Student Enrollment Discrepancy',
        description: 'Institution claims 3,000 total enrolled students in SSR (Page 12). External data from AISHE (2025) records 2,750 students. Discrepancy of 250 students (8.3%) detected. This may indicate data reporting delays, seasonal enrollment fluctuations, or potential over-reporting. Manual verification of actual enrollment registers is required.',
        risk: 'High',
        status: 'MISMATCH',
        ai_confidence: 0.89,
        evidence_sources: ['SSR_ABC_2026.pdf (Page 12)', 'AISHE 2025 Dataset', 'NIRF 2024 Dataset']
      },
      {
        finding_number: 'F-002',
        category: 'Faculty Data',
        title: 'Faculty Data Mismatch',
        description: 'Institution reports 150 total faculty members in Faculty Records (Page 3). AISHE 2025 data records 148 faculty. Discrepancy of 2 faculty members (1.3%) detected. This minor difference may be attributable to adjunct faculty classification or reporting cycle differences.',
        risk: 'Medium',
        status: 'MINOR_MISMATCH',
        ai_confidence: 0.91,
        evidence_sources: ['Faculty_Records_2026.pdf (Page 3)', 'AISHE 2025 Dataset']
      },
      {
        finding_number: 'F-003',
        category: 'Fire Safety',
        title: 'Fire Safety Evidence Requires Verification',
        description: 'Institution claims 24 fire extinguishers across campus. Visual AI (YOLO) detected 3 fire extinguishers in uploaded images covering partial campus area. Fire Safety Certificate (2026) verified as valid. However, uploaded visual coverage is insufficient to verify full extinguisher deployment. Physical site verification recommended.',
        risk: 'High',
        status: 'INSUFFICIENT_EVIDENCE',
        ai_confidence: 0.88,
        evidence_sources: ['SSR_ABC_2026.pdf (Page 18)', 'fire_safety.jpg (AI Detection: 3 extinguishers)', 'Fire_Safety_Certificate_2026.pdf (Page 1)']
      },
      {
        finding_number: 'F-004',
        category: 'Infrastructure',
        title: 'Laboratory Evidence Discrepancy',
        description: 'The institutional document (Infrastructure Report, Page 42) reports 10 laboratories. Available visual evidence from uploaded images (lab01.jpg, lab02.jpg) currently supports identification of 8 laboratory spaces based on AI detection. External reference data (AISHE 2025) reports 9 laboratories. This is a potential discrepancy and requires manual verification during the physical inspection visit.',
        risk: 'Medium',
        status: 'POTENTIAL_MISMATCH',
        ai_confidence: 0.82,
        evidence_sources: ['Infrastructure_Report_2026.pdf (Page 42)', 'lab01.jpg (AI: 8 identifiable lab spaces)', 'lab02.jpg (AI Detection)', 'AISHE 2025 Dataset (9 labs)']
      },
      {
        finding_number: 'F-005',
        category: 'Documents',
        title: 'Missing Supporting Document',
        description: 'Affiliation Certificate is listed in the required document checklist but has not been uploaded. This is a mandatory document for NAAC accreditation verification. Institution must submit the valid affiliation certificate from Anna University for the current academic year (2025-26).',
        risk: 'Medium',
        status: 'MISSING_EVIDENCE',
        ai_confidence: 0.95,
        evidence_sources: ['Required Documents Checklist', 'Document Upload Log (no upload detected)', 'NAAC Manual 2022 — Required Documentation']
      },
    ];
  }
};

// ============================================================
// RISK SCORING SERVICE — Explainable rule-based scoring
// HIGH: Safety concern / Critical mismatch / Missing mandatory
// MEDIUM: Moderate mismatch / Incomplete evidence
// LOW: Minor discrepancy
// ============================================================
export const RiskScoringService = {
  calculate(findings: any[]): { score: number; level: string; breakdown: any[] } {
    const breakdown: any[] = [];
    let total = 0;

    for (const f of findings) {
      let points = 0;
      let reason = '';

      // Rule-based risk contribution
      if (f.status === 'MISMATCH' && f.risk === 'High') { points = 25; reason = 'Major data mismatch — High priority'; }
      else if (f.status === 'MISMATCH' && f.risk === 'Medium') { points = 15; reason = 'Data mismatch detected'; }
      else if (f.status === 'MINOR_MISMATCH') { points = 8; reason = 'Minor mismatch detected'; }
      else if (f.status === 'INSUFFICIENT_EVIDENCE' && f.risk === 'High') { points = 18; reason = 'High-risk area: insufficient evidence'; }
      else if (f.status === 'INSUFFICIENT_EVIDENCE' && f.risk === 'Medium') { points = 10; reason = 'Insufficient visual evidence'; }
      else if (f.status === 'POTENTIAL_MISMATCH') { points = 12; reason = 'Potential discrepancy — verification required'; }
      else if (f.status === 'MISSING_EVIDENCE') { points = 10; reason = 'Missing mandatory document'; }
      else if (f.status === 'REQUIRES_VERIFICATION') { points = 8; reason = 'Requires physical verification'; }
      else if (f.status === 'CONSISTENT') { points = 0; reason = 'Consistent — no risk contribution'; }

      // Inspector-overridden findings don't contribute full risk
      if (f.inspector_decision === 'OVERRIDDEN') {
        points = Math.floor(points * 0.2);
        reason += ' (overridden by inspector)';
      }

      breakdown.push({ finding: f.finding_number || f.title, reason, points });
      total += points;
    }

    // Add baseline institutional risk
    const score = Math.min(total + 5, 100);
    const level = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';

    return { score, level, breakdown };
  }
};

// ============================================================
// REGULATION RAG SERVICE (Mock → sentence-transformers + FAISS)
// Retrieves relevant regulation excerpts for each finding
// ============================================================
export const RegulationRAGService = {
  async search(query: string, regulations: any[]): Promise<any[]> {
    await delay(800);

    const q = query.toLowerCase();
    const keywords = q.split(' ').filter(w => w.length > 3);

    return regulations.filter(reg => {
      const text = `${reg.title} ${reg.excerpt} ${reg.tags}`.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    }).map(reg => ({
      ...reg,
      relevance_score: 0.75 + Math.random() * 0.2,
      applicability: 'Directly applicable to current finding',
      retrieval_note: 'Demo Regulatory Reference — verify against official current manual'
    }));
  }
};

// ============================================================
// REPORT SERVICE
// ============================================================
export const ReportService = {
  generate(inspection: any, institution: any, findings: any[], inspector: any): string {
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const accepted = findings.filter((f: any) => f.inspector_decision === 'ACCEPTED');
    const overridden = findings.filter((f: any) => f.inspector_decision === 'OVERRIDDEN');
    const pending = findings.filter((f: any) => !f.inspector_decision);

    return JSON.stringify({
      generated_at: new Date().toISOString(),
      inspection_id: inspection.inspection_id,
      institution: institution?.name || 'Unknown',
      aishe_code: institution?.aishe_code || '',
      affiliation: institution?.affiliation || '',
      location: institution?.location || '',
      inspector: inspector?.name || 'Unknown',
      date,
      risk_score: inspection.risk_score,
      risk_level: inspection.risk_level,
      findings_count: findings.length,
      high_risk: findings.filter((f: any) => f.risk === 'High').length,
      medium_risk: findings.filter((f: any) => f.risk === 'Medium').length,
      low_risk: findings.filter((f: any) => f.risk === 'Low').length,
      accepted: accepted.length,
      overridden: overridden.length,
      pending: pending.length,
      findings,
      accepted_findings: accepted,
      overridden_findings: overridden,
      pending_findings: pending,
      summary: `Inspection of ${institution?.name || 'institution'} (${inspection.inspection_id}) completed on ${date}. ${findings.length} AI findings generated. Risk level: ${inspection.risk_level} (${inspection.risk_score}/100). Inspector reviewed ${accepted.length + overridden.length} of ${findings.length} findings.`,
      recommendations: [
        'Complete physical site verification for laboratory count discrepancy (F-004)',
        'Verify fire extinguisher deployment during on-site visit (F-003)',
        'Request updated enrollment data with AISHE reconciliation (F-001)',
        'Obtain and upload current Affiliation Certificate from Anna University (F-005)',
      ],
      disclaimer: 'UNI-INSPECTION provides AI-assisted inspection recommendations. Final inspection decisions remain with the authorized human inspector. This report does not constitute an accreditation decision or approval/rejection of the institution.'
    });
  }
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
