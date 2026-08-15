// Mock AI Services
// These interfaces are designed to be replaced by real Python/FastAPI AI services
// Real implementations would use: Tesseract OCR, YOLOv8, sentence-transformers, vector DB

// ============================================================
// DOCUMENT AI SERVICE (Mock → Tesseract OCR + NLP pipeline)
// ============================================================
export const DocumentAIService = {
  async extractClaims(documentId: string, filename: string): Promise<any[]> {
    // Simulate processing time
    await delay(2000);

    const claimsMap: Record<string, any[]> = {
      'SSR_2026.pdf': [
        { claim_name: 'Fire Extinguishers', value: '10', page_number: 18, confidence: 0.96, category: 'Safety' },
        { claim_name: 'Total Students', value: '1250', page_number: 12, confidence: 0.98, category: 'Student Data' },
        { claim_name: 'Barrier-Free Access', value: 'Available', page_number: 22, confidence: 0.89, category: 'Accessibility' },
        { claim_name: 'Programs Offered', value: '14', page_number: 8, confidence: 0.97, category: 'Academic' },
        { claim_name: 'Classrooms', value: '42', page_number: 5, confidence: 0.95, category: 'Infrastructure' },
      ],
      'Fire_Safety_Certificate.pdf': [
        { claim_name: 'Fire Safety Certificate', value: 'Valid (2026)', page_number: 1, confidence: 0.99, category: 'Safety' },
        { claim_name: 'Certificate Issuing Authority', value: 'Coimbatore Fire & Rescue Services', page_number: 1, confidence: 0.97, category: 'Safety' },
        { claim_name: 'Certificate Valid Until', value: '31 March 2027', page_number: 1, confidence: 0.99, category: 'Safety' },
      ],
      'Faculty_Report.pdf': [
        { claim_name: 'Total Faculty', value: '82', page_number: 3, confidence: 0.97, category: 'Faculty Data' },
        { claim_name: 'PhD Holders', value: '34', page_number: 5, confidence: 0.94, category: 'Faculty Data' },
        { claim_name: 'Average Experience', value: '11.2 years', page_number: 6, confidence: 0.92, category: 'Faculty Data' },
      ],
      'Infrastructure_Report.pdf': [
        { claim_name: 'Laboratories', value: '10', page_number: 7, confidence: 0.94, category: 'Infrastructure' },
        { claim_name: 'Library Books', value: '42000', page_number: 9, confidence: 0.96, category: 'Infrastructure' },
        { claim_name: 'Total Built-up Area', value: '28500 sq.m.', page_number: 4, confidence: 0.91, category: 'Infrastructure' },
        { claim_name: 'Seminar Halls', value: '3', page_number: 6, confidence: 0.93, category: 'Infrastructure' },
      ],
    };

    return claimsMap[filename] || [
      { claim_name: 'Document Content', value: 'Extracted', page_number: 1, confidence: 0.75, category: 'General' }
    ];
  }
};

// ============================================================
// VISION AI SERVICE (YOLOv8 object detection via FastAPI)
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

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData as any,
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.detections)) {
            return resData.detections;
          }
        } else {
          console.warn(`[VisionAIService] AI service returned status ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`[VisionAIService] AI service call failed: ${err.message}`);
      }
    } else {
      console.warn(`[VisionAIService] No image buffer available for image ${imageId} (${filename}).`);
    }

    return [];
  }
};

// ============================================================
// EXTERNAL VERIFICATION SERVICE (Mock → AISHE/NIRF API)
// ============================================================
export const ExternalVerificationService = {
  async getExternalData(institutionId: string): Promise<any> {
    await delay(1000);
    return {
      aishe: { students: 1080, faculty: 80, programs: 14, year: 2025 },
      nirf: { students: 1100, faculty: 81, programs: 13, year: 2024 }
    };
  }
};

// ============================================================
// CROSS VERIFICATION SERVICE (Core AI engine mock)
// ============================================================
export const CrossVerificationService = {
  async compare(inspectionId: string, claims: any[], detections: any[], externalData: any): Promise<any[]> {
    await delay(3000);

    // Pre-built findings for demo
    return [
      {
        finding_number: 'F-001',
        category: 'Fire Safety',
        title: 'Fire Extinguisher Count Verification',
        description: 'Institution claims 10 fire extinguishers. Visual evidence shows 2 detected in 1 uploaded image. Uploaded visual evidence does not cover enough areas to independently verify the full claim. Additional site inspection required.',
        risk: 'Medium',
        status: 'INSUFFICIENT_EVIDENCE',
        ai_confidence: 0.87,
        evidence_sources: ['SSR_2026.pdf (Page 18)', 'lab_03.jpg (YOLO detection)']
      },
      {
        finding_number: 'F-002',
        category: 'Student Data',
        title: 'Student Count Mismatch',
        description: 'Institution reports 1,250 students. AISHE data (2025) shows 1,080; NIRF data (2024) shows 1,100. Discrepancy of 150-170 students detected. Potential over-reporting or enrollment data lag.',
        risk: 'High',
        status: 'MISMATCH',
        ai_confidence: 0.94,
        evidence_sources: ['SSR_2026.pdf (Page 12)', 'AISHE 2025 Data', 'NIRF 2024 Data']
      },
      {
        finding_number: 'F-003',
        category: 'Faculty Data',
        title: 'Faculty Count Minor Mismatch',
        description: 'Institution reports 82 faculty. AISHE shows 80; NIRF shows 81. Minor discrepancy of 1-2 may be due to reporting cycle differences or adjunct faculty inclusion.',
        risk: 'Low',
        status: 'MINOR_MISMATCH',
        ai_confidence: 0.91,
        evidence_sources: ['Faculty_Report.pdf (Page 3)', 'AISHE 2025 Data', 'NIRF 2024 Data']
      },
      {
        finding_number: 'F-004',
        category: 'Accessibility',
        title: 'Barrier-Free Access Verification',
        description: 'Institution claims barrier-free access is available. Uploaded campus images do not clearly show ramps, tactile paths, or accessible infrastructure. Insufficient visual evidence. Requires physical verification.',
        risk: 'Medium',
        status: 'REQUIRES_VERIFICATION',
        ai_confidence: 0.78,
        evidence_sources: ['SSR_2026.pdf (Page 22)', 'campus_entrance.jpg']
      },
      {
        finding_number: 'F-005',
        category: 'Infrastructure',
        title: 'Laboratory Count — Partial Visual Verification',
        description: 'Institution claims 10 laboratories. 3 laboratory images uploaded covering 2 distinct lab environments. Visual evidence confirms 2 labs. Insufficient coverage to verify full claim of 10.',
        risk: 'Medium',
        status: 'INSUFFICIENT_EVIDENCE',
        ai_confidence: 0.82,
        evidence_sources: ['Infrastructure_Report.pdf (Page 7)', 'lab_01.jpg', 'lab_02.jpg', 'lab_03.jpg']
      },
      {
        finding_number: 'F-006',
        category: 'Safety',
        title: 'Fire Safety Certificate — Verified',
        description: 'Fire safety certificate uploaded and cross-verified. Document is valid for 2026, issued by Coimbatore Fire & Rescue Services. Certificate validity consistent with documentary evidence.',
        risk: 'Low',
        status: 'CONSISTENT',
        ai_confidence: 0.99,
        evidence_sources: ['Fire_Safety_Certificate.pdf (Page 1)', 'SSR_2026.pdf (Page 18)']
      },
    ];
  }
};

// ============================================================
// RISK SCORING SERVICE
// ============================================================
export const RiskScoringService = {
  calculate(findings: any[]): { score: number; level: string; breakdown: any[] } {
    const breakdown: any[] = [];
    let total = 0;

    for (const f of findings) {
      let points = 0;
      let reason = '';

      if (f.status === 'MISMATCH' && f.risk === 'High') { points = 25; reason = 'Major data mismatch'; }
      else if (f.status === 'MISMATCH' && f.risk === 'Medium') { points = 15; reason = 'Data mismatch'; }
      else if (f.status === 'MINOR_MISMATCH') { points = 10; reason = 'Minor mismatch'; }
      else if (f.status === 'INSUFFICIENT_EVIDENCE' && f.risk === 'Medium') { points = 10; reason = 'Insufficient evidence'; }
      else if (f.status === 'REQUIRES_VERIFICATION') { points = 10; reason = 'Requires verification'; }
      else if (f.status === 'CONSISTENT') { points = 0; reason = 'Consistent — no risk contribution'; }

      breakdown.push({ finding: f.finding_number || f.title, reason, points });
      total += points;
    }

    // Cap at 100
    const score = Math.min(total + 12, 100); // 12 base for baseline risk
    const level = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';

    return { score, level, breakdown };
  }
};

// ============================================================
// REGULATION RAG SERVICE (Mock → sentence-transformers + vector DB)
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
      applicability: 'Directly applicable to current finding'
    }));
  }
};

// ============================================================
// REPORT SERVICE
// ============================================================
export const ReportService = {
  generate(inspection: any, institution: any, findings: any[], inspector: any): string {
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    return JSON.stringify({
      generated_at: new Date().toISOString(),
      inspection_id: inspection.inspection_id,
      institution: institution.name,
      inspector: inspector.name,
      date,
      risk_score: inspection.risk_score,
      risk_level: inspection.risk_level,
      findings_count: findings.length,
      high_risk: findings.filter((f: any) => f.risk === 'High').length,
      medium_risk: findings.filter((f: any) => f.risk === 'Medium').length,
      low_risk: findings.filter((f: any) => f.risk === 'Low').length,
      accepted: findings.filter((f: any) => f.inspector_decision === 'ACCEPTED').length,
      overridden: findings.filter((f: any) => f.inspector_decision === 'OVERRIDDEN').length,
      pending: findings.filter((f: any) => !f.inspector_decision).length,
      findings,
      disclaimer: 'This report is generated by the InspectAI system to assist human inspectors. AI findings are indicative and require inspector validation. This report does not constitute an accreditation decision.'
    });
  }
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
