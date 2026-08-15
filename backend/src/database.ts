import { v4 as uuidv4 } from 'uuid';

// ============================================================
// UNI-INSPECTION — In-memory database
// AI-Assisted Evidence-Traceable Institutional Inspection Platform
// ============================================================

export interface User { id: string; name: string; email: string; password: string; role: string; institutionId?: string; created_at: string; }
export interface Institution { id: string; name: string; aishe_code: string; type: string; affiliation: string; location: string; established: number; students: number; faculty: number; programs: number; accreditation_status: string; created_at: string; }
export interface Inspection { id: string; inspection_id: string; institution_id: string; inspector_id: string; inspection_date: string; status: string; risk_score: number; risk_level: string; categories: string; notes?: string; created_at: string; }
export interface Document { id: string; inspection_id: string; filename: string; type: string; size: number; status: string; analyzed_at?: string; created_at: string; }
export interface ImageRecord { id: string; inspection_id: string; filename: string; category: string; status: string; analyzed_at?: string; created_at: string; }
export interface Claim { id: string; inspection_id: string; document_id?: string; category: string; claim_name: string; value: string; source_document: string; page_number: number; confidence: number; created_at: string; }
export interface Detection { id: string; inspection_id: string; image_id: string; object_type: string; confidence: number; class_id?: number; bbox?: any; created_at: string; }
export interface Finding { id: string; inspection_id: string; finding_number: string; category: string; title: string; description: string; evidence: string; risk: string; status: string; visibility?: string; ai_confidence: number; inspector_decision?: string; inspector_comment?: string; inspector_id?: string; decided_at?: string; created_at: string; }
export interface Regulation { id: string; source: string; document: string; section: string; title: string; excerpt: string; tags: string; created_at: string; }
export interface ExternalData { id: string; institution_id: string; source: string; metric: string; value: string; year: number; created_at: string; }
export interface Report { id: string; inspection_id: string; content: string; generated_at: string; generated_by: string; }
export interface AuditLog { id: string; userId: string; role: string; action: string; entity: string; entityId: string; timestamp: string; }

const now = () => new Date().toISOString();

// ============================================================
// Tables
// ============================================================
export const DB = {
  users: [] as User[],
  institutions: [] as Institution[],
  inspections: [] as Inspection[],
  documents: [] as Document[],
  images: [] as ImageRecord[],
  claims: [] as Claim[],
  detections: [] as Detection[],
  findings: [] as Finding[],
  regulations: [] as Regulation[],
  externalData: [] as ExternalData[],
  reports: [] as Report[],
  auditLogs: [] as AuditLog[],
};

// ============================================================
// Helper query functions
// ============================================================
export function findById<T extends { id: string }>(table: T[], id: string): T | undefined {
  return table.find(r => r.id === id);
}

export function findWhere<T>(table: T[], predicate: Partial<T>): T[] {
  return table.filter(row => Object.entries(predicate).every(([k, v]) => (row as any)[k] === v));
}

export function insertRecord<T extends { id: string }>(table: T[], record: T): T {
  const existing = table.find(r => r.id === record.id);
  if (!existing) table.push(record);
  return record;
}

export function updateRecord<T extends { id: string }>(table: T[], id: string, updates: Partial<T>): T | undefined {
  const idx = table.findIndex(r => r.id === id);
  if (idx === -1) return undefined;
  table[idx] = { ...table[idx], ...updates };
  return table[idx];
}

export function deleteWhere<T>(table: T[], predicate: Partial<T>): void {
  const keys = Object.keys(predicate) as (keyof T)[];
  const toRemove = table.filter(row => keys.every(k => row[k] === predicate[k]));
  for (const row of toRemove) {
    const idx = table.indexOf(row);
    if (idx !== -1) table.splice(idx, 1);
  }
}

// ============================================================
// Seed data — aligned with UNI-INSPECTION demo requirements
// ABC Engineering College — Primary demo institution
// ============================================================
export function seedDatabase() {
  if (DB.users.length > 0) return; // already seeded

  // Users
  DB.users.push(
    {
      id: 'user-000',
      name: 'Super Admin',
      email: 'admin@uninspection.demo',
      password: 'DemoAdmin@123',
      role: 'SUPER_ADMIN',
      created_at: now()
    },
    {
      id: 'user-001',
      name: 'Inspection Lead',
      email: 'lead@uninspection.demo',
      password: 'DemoLead@123',
      role: 'INSPECTION_ADMIN',
      created_at: now()
    },
    {
      id: 'user-002',
      name: 'Inspection Member',
      email: 'member@uninspection.demo',
      password: 'DemoMember@123',
      role: 'INSPECTION_MEMBER',
      created_at: now()
    },
    {
      id: 'user-003',
      name: 'Institution Admin',
      email: 'institution@uninspection.demo',
      password: 'DemoInstitution@123',
      role: 'INSTITUTION_ADMIN',
      institutionId: 'inst-001',
      created_at: now()
    },
    {
      id: 'user-004',
      name: 'Institution Staff',
      email: 'staff@uninspection.demo',
      password: 'DemoStaff@123',
      role: 'INSTITUTION_STAFF',
      institutionId: 'inst-001',
      created_at: now()
    }
  );

  // Institutions
  const institutions: Institution[] = [
    {
      id: 'inst-001',
      name: 'ABC Engineering College',
      aishe_code: 'CSE-UNI-001',
      type: 'Engineering College',
      affiliation: 'Anna University',
      location: 'Chennai, Tamil Nadu',
      established: 2005,
      students: 3000,
      faculty: 150,
      programs: 8,
      accreditation_status: 'Under Assessment',
      created_at: now()
    },
    {
      id: 'inst-002',
      name: 'XYZ Institute of Technology',
      aishe_code: 'CSE-UNI-002',
      type: 'Engineering College',
      affiliation: 'Anna University',
      location: 'Coimbatore, Tamil Nadu',
      established: 2008,
      students: 2100,
      faculty: 132,
      programs: 6,
      accreditation_status: 'NAAC Accredited (B++)',
      created_at: now()
    },
    {
      id: 'inst-003',
      name: 'National Institute of Computing',
      aishe_code: 'CSE-UNI-003',
      type: 'Deemed University',
      affiliation: 'Autonomous',
      location: 'Bengaluru, Karnataka',
      established: 2001,
      students: 3200,
      faculty: 210,
      programs: 12,
      accreditation_status: 'NAAC Accredited (A)',
      created_at: now()
    },
    {
      id: 'inst-004',
      name: 'South India College of Engineering',
      aishe_code: 'CSE-UNI-004',
      type: 'Engineering College',
      affiliation: 'Visvesvaraya Technological University',
      location: 'Mysuru, Karnataka',
      established: 2012,
      students: 980,
      faculty: 68,
      programs: 4,
      accreditation_status: 'Under Assessment',
      created_at: now()
    },
  ];
  DB.institutions.push(...institutions);

  // Inspections
  const inspections: Inspection[] = [
    {
      id: 'insp-001',
      inspection_id: 'INS-2026-001',
      institution_id: 'inst-001',
      inspector_id: 'user-001',
      inspection_date: '2026-08-13',
      status: 'In Progress',
      risk_score: 78,
      risk_level: 'High',
      categories: JSON.stringify(['Student Data', 'Faculty Data', 'Infrastructure', 'Fire Safety', 'Documents']),
      created_at: now()
    },
    {
      id: 'insp-002',
      inspection_id: 'INS-2026-002',
      institution_id: 'inst-002',
      inspector_id: 'user-001',
      inspection_date: '2026-08-03',
      status: 'Completed',
      risk_score: 41,
      risk_level: 'Medium',
      categories: JSON.stringify(['Infrastructure', 'Faculty Data', 'Academic Facilities']),
      created_at: now()
    },
    {
      id: 'insp-003',
      inspection_id: 'INS-2026-003',
      institution_id: 'inst-003',
      inspector_id: 'user-001',
      inspection_date: '2026-07-20',
      status: 'Completed',
      risk_score: 28,
      risk_level: 'Low',
      categories: JSON.stringify(['Student Data', 'Infrastructure', 'Academic Facilities']),
      created_at: now()
    },
    {
      id: 'insp-004',
      inspection_id: 'INS-2026-004',
      institution_id: 'inst-004',
      inspector_id: 'user-001',
      inspection_date: '2026-07-15',
      status: 'Pending',
      risk_score: 0,
      risk_level: 'Low',
      categories: JSON.stringify(['Student Data', 'Infrastructure']),
      created_at: now()
    },
    {
      id: 'insp-005',
      inspection_id: 'INS-2025-018',
      institution_id: 'inst-001',
      inspector_id: 'user-001',
      inspection_date: '2025-12-10',
      status: 'Completed',
      risk_score: 64,
      risk_level: 'Medium',
      categories: JSON.stringify(['Student Data', 'Infrastructure', 'Fire Safety']),
      created_at: now()
    },
  ];
  DB.inspections.push(...inspections);

  // Documents for INS-2026-001 (ABC Engineering College)
  const documents: Document[] = [
    { id: 'doc-001', inspection_id: 'insp-001', filename: 'SSR_ABC_2026.pdf', type: 'PDF', size: 4096000, status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'doc-002', inspection_id: 'insp-001', filename: 'Fire_Safety_Certificate_2026.pdf', type: 'PDF', size: 512000, status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'doc-003', inspection_id: 'insp-001', filename: 'Faculty_Records_2026.pdf', type: 'PDF', size: 2048000, status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'doc-004', inspection_id: 'insp-001', filename: 'Infrastructure_Report_2026.pdf', type: 'PDF', size: 3072000, status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'doc-005', inspection_id: 'insp-001', filename: 'Affiliation_Certificate.pdf', type: 'PDF', size: 256000, status: 'Missing', created_at: now() },
    { id: 'doc-006', inspection_id: 'insp-002', filename: 'SSR_XYZ_2026.pdf', type: 'PDF', size: 1800000, status: 'Analyzed', analyzed_at: now(), created_at: now() },
  ];
  DB.documents.push(...documents);

  // Images
  const images: ImageRecord[] = [
    { id: 'img-001', inspection_id: 'insp-001', filename: 'lab01.jpg', category: 'Laboratory', status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'img-002', inspection_id: 'insp-001', filename: 'lab02.jpg', category: 'Laboratory', status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'img-003', inspection_id: 'insp-001', filename: 'fire_safety.jpg', category: 'Fire Safety', status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'img-004', inspection_id: 'insp-001', filename: 'classroom01.jpg', category: 'Classroom', status: 'Analyzed', analyzed_at: now(), created_at: now() },
    { id: 'img-005', inspection_id: 'insp-001', filename: 'library01.jpg', category: 'Library', status: 'Uploaded', created_at: now() },
    { id: 'img-006', inspection_id: 'insp-001', filename: 'campus_entrance.jpg', category: 'Campus', status: 'Analyzed', analyzed_at: now(), created_at: now() },
  ];
  DB.images.push(...images);

  // Claims extracted from documents
  const claims: Claim[] = [
    { id: 'claim-001', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Student Data', claim_name: 'Total Students', value: '3000', source_document: 'SSR_ABC_2026.pdf', page_number: 12, confidence: 0.97, created_at: now() },
    { id: 'claim-002', inspection_id: 'insp-001', document_id: 'doc-003', category: 'Faculty Data', claim_name: 'Total Faculty', value: '150', source_document: 'Faculty_Records_2026.pdf', page_number: 3, confidence: 0.96, created_at: now() },
    { id: 'claim-003', inspection_id: 'insp-001', document_id: 'doc-004', category: 'Infrastructure', claim_name: 'Laboratories', value: '10', source_document: 'Infrastructure_Report_2026.pdf', page_number: 42, confidence: 0.94, created_at: now() },
    { id: 'claim-004', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Safety', claim_name: 'Fire Extinguishers', value: '24', source_document: 'SSR_ABC_2026.pdf', page_number: 18, confidence: 0.93, created_at: now() },
    { id: 'claim-005', inspection_id: 'insp-001', document_id: 'doc-002', category: 'Safety', claim_name: 'Fire Safety Certificate', value: 'Valid (2026)', source_document: 'Fire_Safety_Certificate_2026.pdf', page_number: 1, confidence: 0.99, created_at: now() },
    { id: 'claim-006', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Infrastructure', claim_name: 'Classrooms', value: '60', source_document: 'SSR_ABC_2026.pdf', page_number: 15, confidence: 0.95, created_at: now() },
    { id: 'claim-007', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Accessibility', claim_name: 'Barrier-Free Access', value: 'Available', source_document: 'SSR_ABC_2026.pdf', page_number: 22, confidence: 0.88, created_at: now() },
    { id: 'claim-008', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Academic', claim_name: 'Programs Offered', value: '8', source_document: 'SSR_ABC_2026.pdf', page_number: 8, confidence: 0.97, created_at: now() },
  ];
  DB.claims.push(...claims);

  // YOLO Detections from uploaded images
  const detections: Detection[] = [
    { id: 'det-001', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Fire Extinguisher', confidence: 0.91, created_at: now() },
    { id: 'det-002', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Fire Extinguisher', confidence: 0.88, created_at: now() },
    { id: 'det-003', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Fire Extinguisher', confidence: 0.86, created_at: now() },
    { id: 'det-004', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Emergency Exit Sign', confidence: 0.84, created_at: now() },
    { id: 'det-005', inspection_id: 'insp-001', image_id: 'img-001', object_type: 'Lab Bench', confidence: 0.94, created_at: now() },
    { id: 'det-006', inspection_id: 'insp-001', image_id: 'img-001', object_type: 'Lab Bench', confidence: 0.92, created_at: now() },
    { id: 'det-007', inspection_id: 'insp-001', image_id: 'img-001', object_type: 'Lab Equipment', confidence: 0.87, created_at: now() },
    { id: 'det-008', inspection_id: 'insp-001', image_id: 'img-002', object_type: 'Lab Bench', confidence: 0.96, created_at: now() },
    { id: 'det-009', inspection_id: 'insp-001', image_id: 'img-002', object_type: 'Lab Equipment', confidence: 0.89, created_at: now() },
    { id: 'det-010', inspection_id: 'insp-001', image_id: 'img-004', object_type: 'Whiteboard', confidence: 0.93, created_at: now() },
    { id: 'det-011', inspection_id: 'insp-001', image_id: 'img-004', object_type: 'Student Desk', confidence: 0.95, created_at: now() },
    { id: 'det-012', inspection_id: 'insp-001', image_id: 'img-004', object_type: 'Projector', confidence: 0.89, created_at: now() },
  ];
  DB.detections.push(...detections);

  // ============================================================
  // 5 SEEDED DEMO FINDINGS — as per UNI-INSPECTION specification
  // ============================================================
  const findings: Finding[] = [
    {
      id: 'find-001',
      inspection_id: 'insp-001',
      finding_number: 'F-001',
      category: 'Student Data',
      title: 'Student Enrollment Discrepancy',
      description: 'Institution claims 3,000 total enrolled students in SSR (Page 12). External data from AISHE (2025) records 2,750 students. Discrepancy of 250 students (8.3%) detected. This may indicate data reporting delays, seasonal enrollment fluctuations, or potential over-reporting. Manual verification of actual enrollment registers is required.',
      evidence: JSON.stringify(['SSR_ABC_2026.pdf (Page 12)', 'AISHE 2025 Dataset', 'NIRF 2024 Dataset']),
      risk: 'High',
      status: 'MISMATCH',
      ai_confidence: 0.89,
      created_at: now()
    },
    {
      id: 'find-002',
      inspection_id: 'insp-001',
      finding_number: 'F-002',
      category: 'Faculty Data',
      title: 'Faculty Data Mismatch',
      description: 'Institution reports 150 total faculty members in Faculty Records (Page 3). AISHE 2025 data records 148 faculty. Discrepancy of 2 faculty members (1.3%) detected. This minor difference may be attributable to adjunct faculty classification, contract positions, or reporting cycle differences between institutional data and AISHE returns.',
      evidence: JSON.stringify(['Faculty_Records_2026.pdf (Page 3)', 'AISHE 2025 Dataset']),
      risk: 'Medium',
      status: 'MINOR_MISMATCH',
      ai_confidence: 0.91,
      inspector_decision: 'ACCEPTED',
      inspector_comment: 'Minor discrepancy verified. 2 visiting faculty members included in institutional count are not captured in AISHE regular faculty returns. No compliance concern.',
      inspector_id: 'user-001',
      decided_at: '2026-08-13T08:30:00Z',
      created_at: now()
    },
    {
      id: 'find-003',
      inspection_id: 'insp-001',
      finding_number: 'F-003',
      category: 'Fire Safety',
      title: 'Fire Safety Evidence Requires Verification',
      description: 'Institution claims 24 fire extinguishers across the campus. Visual evidence from uploaded images (fire_safety.jpg) shows 3 fire extinguishers detected by AI (YOLO). The uploaded visual coverage represents only a partial area of the campus. Fire Safety Certificate (2026) has been verified as valid. However, physical verification of extinguisher count and placement is recommended during site visit.',
      evidence: JSON.stringify(['SSR_ABC_2026.pdf (Page 18)', 'fire_safety.jpg (AI Detection: 3 extinguishers)', 'Fire_Safety_Certificate_2026.pdf (Page 1)']),
      risk: 'High',
      status: 'INSUFFICIENT_EVIDENCE',
      ai_confidence: 0.88,
      created_at: now()
    },
    {
      id: 'find-004',
      inspection_id: 'insp-001',
      finding_number: 'F-004',
      category: 'Infrastructure',
      title: 'Laboratory Evidence Discrepancy',
      description: 'The institutional document (Infrastructure Report, Page 42) reports 10 laboratories. Available visual evidence from uploaded images (lab01.jpg, lab02.jpg) currently supports identification of 8 laboratory spaces based on AI detection. External reference data (AISHE 2025) reports 9 laboratories. This is a potential discrepancy and requires manual verification during the physical inspection visit.',
      evidence: JSON.stringify(['Infrastructure_Report_2026.pdf (Page 42)', 'lab01.jpg (AI: 8 identifiable lab spaces)', 'lab02.jpg (AI Detection)', 'AISHE 2025 Dataset (9 labs)']),
      risk: 'Medium',
      status: 'POTENTIAL_MISMATCH',
      ai_confidence: 0.82,
      created_at: now()
    },
    {
      id: 'find-005',
      inspection_id: 'insp-001',
      finding_number: 'F-005',
      category: 'Documents',
      title: 'Missing Supporting Document',
      description: 'Affiliation Certificate (Affiliation_Certificate.pdf) is listed in the required document checklist but has not been uploaded. This is a mandatory document for NAAC accreditation verification. Institution must submit the valid affiliation certificate from Anna University for the current academic year (2025-26).',
      evidence: JSON.stringify(['Required Documents Checklist', 'Document Upload Log (no upload detected)', 'NAAC Manual 2022 — Required Documentation']),
      risk: 'Medium',
      status: 'MISSING_EVIDENCE',
      ai_confidence: 0.95,
      created_at: now()
    },
  ];
  DB.findings.push(...findings);

  // Regulations — Demo regulatory knowledge base
  const regulations: Regulation[] = [
    {
      id: 'reg-001',
      source: 'NAAC',
      document: 'NAAC Accreditation Manual 2022',
      section: 'Criterion II — Teaching-Learning and Evaluation',
      title: 'Student-Faculty Ratio and Enrollment Data',
      excerpt: 'The institution shall maintain a student-to-faculty ratio not exceeding 20:1 for UG programs. Faculty strength shall be calculated based on full-time regular faculty as per UGC norms. Data submitted in SSR shall be consistent with AISHE returns. Discrepancies between SSR data and AISHE returns shall be explained with supporting documentary evidence.',
      tags: JSON.stringify(['faculty', 'students', 'ratio', 'AISHE', 'SSR', 'enrollment']),
      created_at: now()
    },
    {
      id: 'reg-002',
      source: 'AICTE',
      document: 'AICTE Approval Process Handbook 2024-25',
      section: 'Chapter 4 — Infrastructure Requirements',
      title: 'Laboratory Infrastructure Standards',
      excerpt: 'Each technical institution shall maintain laboratories equipped with adequate instruments, equipment, and safety apparatus. Minimum laboratory area requirements shall be met as per AICTE norms. The institution shall ensure availability of fire safety equipment in all laboratory areas as per local fire safety regulations. Laboratory registers shall be maintained and available for inspection.',
      tags: JSON.stringify(['laboratory', 'infrastructure', 'fire safety', 'equipment', 'AICTE']),
      created_at: now()
    },
    {
      id: 'reg-003',
      source: 'AICTE',
      document: 'AICTE Approval Process Handbook 2024-25',
      section: 'Chapter 5 — Fire Safety and Emergency Preparedness',
      title: 'Fire Safety Compliance Requirements',
      excerpt: 'The institution shall obtain a valid Fire Safety Certificate from the competent authority (Fire Officer/Chief Fire Officer). Fire extinguishers shall be installed at all required locations — typically one per 200 sq.m. or as directed by the fire authority. The certificate must be renewed annually. Records of fire drills shall be maintained. Emergency exit routes shall be clearly marked and unobstructed.',
      tags: JSON.stringify(['fire safety', 'fire extinguisher', 'certificate', 'emergency exit', 'AICTE']),
      created_at: now()
    },
    {
      id: 'reg-004',
      source: 'UGC',
      document: 'UGC Guidelines on Barrier-Free Access 2021',
      section: 'Section 3 — Physical Accessibility Standards',
      title: 'Barrier-Free Access for Persons with Disabilities',
      excerpt: 'All higher educational institutions shall ensure that campus infrastructure is accessible to persons with disabilities as per the Rights of Persons with Disabilities Act 2016 (RPWD Act). This includes: (i) ramps at all building entrances, (ii) accessible toilets on each floor, (iii) tactile paths from main entrance to key facilities, (iv) Braille signage, (v) accessible classrooms.',
      tags: JSON.stringify(['accessibility', 'barrier-free', 'disability', 'ramp', 'RPWD', 'UGC']),
      created_at: now()
    },
    {
      id: 'reg-005',
      source: 'NIRF',
      document: 'NIRF Ranking Framework 2024',
      section: 'Parameter 1 — Teaching, Learning & Resources',
      title: 'Student and Faculty Data Verification',
      excerpt: 'NIRF rankings require submission of student and faculty data consistent with AISHE returns. Institutions must ensure that data submitted for ranking reflects actual enrolled students and full-time faculty as of the reference date (31 December of the preceding academic year). Data discrepancies between NIRF submissions and AISHE returns may attract scrutiny.',
      tags: JSON.stringify(['NIRF', 'students', 'faculty', 'data', 'AISHE', 'enrollment', 'verification']),
      created_at: now()
    },
    {
      id: 'reg-006',
      source: 'NAAC',
      document: 'NAAC Accreditation Manual 2022',
      section: 'Criterion IV — Infrastructure and Learning Resources',
      title: 'Physical Infrastructure and Documentation',
      excerpt: 'The institution shall maintain adequate physical infrastructure including classrooms, laboratories, library, and common facilities commensurate with the number of programs and students enrolled. Infrastructure data submitted in SSR shall be verifiable through physical inspection and photographic evidence. The institution shall maintain an asset register for all infrastructure.',
      tags: JSON.stringify(['infrastructure', 'classrooms', 'library', 'SSR', 'asset register', 'NAAC', 'laboratory']),
      created_at: now()
    },
    {
      id: 'reg-007',
      source: 'UGC',
      document: 'UGC Affiliation and Recognition Guidelines 2020',
      section: 'Section 5 — Mandatory Documentation',
      title: 'Affiliation Certificate Requirements',
      excerpt: 'Every affiliated institution shall maintain a valid affiliation certificate from the parent university renewed annually. The certificate shall specify the programs approved, intake capacity, and validity period. Institutions seeking accreditation shall submit the current affiliation certificate along with the Self-Study Report. Absence of valid affiliation documents is a critical compliance gap.',
      tags: JSON.stringify(['affiliation', 'certificate', 'UGC', 'university', 'mandatory', 'document']),
      created_at: now()
    },
  ];
  DB.regulations.push(...regulations);

  // External Data — seeded AISHE/NIRF-style dataset
  const externalData: ExternalData[] = [
    // ABC Engineering College (inst-001) — demo primary institution
    { id: 'ext-001', institution_id: 'inst-001', source: 'AISHE', metric: 'Total Students', value: '2750', year: 2025, created_at: now() },
    { id: 'ext-002', institution_id: 'inst-001', source: 'AISHE', metric: 'Total Faculty', value: '148', year: 2025, created_at: now() },
    { id: 'ext-003', institution_id: 'inst-001', source: 'AISHE', metric: 'Laboratories', value: '9', year: 2025, created_at: now() },
    { id: 'ext-004', institution_id: 'inst-001', source: 'AISHE', metric: 'Programs', value: '8', year: 2025, created_at: now() },
    { id: 'ext-005', institution_id: 'inst-001', source: 'NIRF', metric: 'Total Students', value: '2780', year: 2024, created_at: now() },
    { id: 'ext-006', institution_id: 'inst-001', source: 'NIRF', metric: 'Total Faculty', value: '147', year: 2024, created_at: now() },
    { id: 'ext-007', institution_id: 'inst-001', source: 'NIRF', metric: 'Programs', value: '8', year: 2024, created_at: now() },
    // XYZ Institute (inst-002)
    { id: 'ext-008', institution_id: 'inst-002', source: 'AISHE', metric: 'Total Students', value: '2050', year: 2025, created_at: now() },
    { id: 'ext-009', institution_id: 'inst-002', source: 'AISHE', metric: 'Total Faculty', value: '130', year: 2025, created_at: now() },
  ];
  DB.externalData.push(...externalData);
}
