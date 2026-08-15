import { v4 as uuidv4 } from 'uuid';

// ============================================================
// In-memory database (replaceable with PostgreSQL/SQLite later)
// Structured to mirror a relational schema
// ============================================================

export interface User { id: string; name: string; email: string; password: string; role: string; created_at: string; }
export interface Institution { id: string; name: string; aishe_code: string; type: string; affiliation: string; location: string; established: number; students: number; faculty: number; programs: number; accreditation_status: string; created_at: string; }
export interface Inspection { id: string; inspection_id: string; institution_id: string; inspector_id: string; inspection_date: string; status: string; risk_score: number; risk_level: string; categories: string; notes?: string; created_at: string; }
export interface Document { id: string; inspection_id: string; filename: string; type: string; size: number; status: string; analyzed_at?: string; created_at: string; }
export interface ImageRecord { id: string; inspection_id: string; filename: string; category: string; status: string; analyzed_at?: string; created_at: string; }
export interface Claim { id: string; inspection_id: string; document_id?: string; category: string; claim_name: string; value: string; source_document: string; page_number: number; confidence: number; created_at: string; }
export interface Detection { id: string; inspection_id: string; image_id: string; object_type: string; confidence: number; class_id?: number; bbox?: any; created_at: string; }
export interface Finding { id: string; inspection_id: string; finding_number: string; category: string; title: string; description: string; evidence: string; risk: string; status: string; ai_confidence: number; inspector_decision?: string; inspector_comment?: string; inspector_id?: string; decided_at?: string; created_at: string; }
export interface Regulation { id: string; source: string; document: string; section: string; title: string; excerpt: string; tags: string; created_at: string; }
export interface ExternalData { id: string; institution_id: string; source: string; metric: string; value: string; year: number; created_at: string; }
export interface Report { id: string; inspection_id: string; content: string; generated_at: string; generated_by: string; }

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
};

// ============================================================
// Helper query functions (mimic SQL operations)
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
// Seed data
// ============================================================
export function seedDatabase() {
  if (DB.users.length > 0) return; // already seeded

  // Users
  DB.users.push({ id: 'user-001', name: 'Demo Inspector', email: 'inspector@demo.com', password: 'inspector123', role: 'inspector', created_at: now() });

  // Institutions
  const institutions: Institution[] = [
    { id: 'inst-001', name: 'ABC Institute of Technology', aishe_code: 'C-12345', type: 'Engineering College', affiliation: 'XYZ Technical University', location: 'Coimbatore, Tamil Nadu', established: 2008, students: 1250, faculty: 82, programs: 14, accreditation_status: 'Under Assessment', created_at: now() },
    { id: 'inst-002', name: 'XYZ Engineering College', aishe_code: 'C-23456', type: 'Engineering College', affiliation: 'Anna University', location: 'Chennai, Tamil Nadu', established: 2005, students: 2100, faculty: 145, programs: 18, accreditation_status: 'NAAC Accredited (B++)', created_at: now() },
    { id: 'inst-003', name: 'National Institute of Computing', aishe_code: 'C-34567', type: 'Deemed University', affiliation: 'Autonomous', location: 'Bengaluru, Karnataka', established: 2001, students: 3200, faculty: 210, programs: 26, accreditation_status: 'NAAC Accredited (A)', created_at: now() },
    { id: 'inst-004', name: 'South India College of Engineering', aishe_code: 'C-45678', type: 'Engineering College', affiliation: 'Visvesvaraya Technological University', location: 'Mysuru, Karnataka', established: 2012, students: 980, faculty: 68, programs: 10, accreditation_status: 'Under Assessment', created_at: now() },
  ];
  DB.institutions.push(...institutions);

  // Inspections
  const inspections: Inspection[] = [
    { id: 'insp-001', inspection_id: 'INS-2026-001', institution_id: 'inst-001', inspector_id: 'user-001', inspection_date: '2026-08-12', status: 'In Progress', risk_score: 72, risk_level: 'High', categories: JSON.stringify(['Institutional Data', 'Infrastructure', 'Fire Safety', 'Accessibility', 'Academic Facilities', 'Student Data', 'Faculty Data']), created_at: now() },
    { id: 'insp-002', inspection_id: 'INS-2026-002', institution_id: 'inst-002', inspector_id: 'user-001', inspection_date: '2026-08-03', status: 'Completed', risk_score: 41, risk_level: 'Medium', categories: JSON.stringify(['Infrastructure', 'Faculty Data', 'Academic Facilities']), created_at: now() },
    { id: 'insp-003', inspection_id: 'INS-2026-003', institution_id: 'inst-003', inspector_id: 'user-001', inspection_date: '2026-07-20', status: 'Completed', risk_score: 28, risk_level: 'Low', categories: JSON.stringify(['Institutional Data', 'Infrastructure', 'Academic Facilities']), created_at: now() },
    { id: 'insp-004', inspection_id: 'INS-2026-004', institution_id: 'inst-004', inspector_id: 'user-001', inspection_date: '2026-07-15', status: 'Pending', risk_score: 0, risk_level: 'Low', categories: JSON.stringify(['Institutional Data', 'Infrastructure']), created_at: now() },
    { id: 'insp-005', inspection_id: 'INS-2025-018', institution_id: 'inst-001', inspector_id: 'user-001', inspection_date: '2025-12-10', status: 'Completed', risk_score: 64, risk_level: 'Medium', categories: JSON.stringify(['Institutional Data', 'Infrastructure', 'Fire Safety']), created_at: now() },
    { id: 'insp-006', inspection_id: 'INS-2025-012', institution_id: 'inst-002', inspector_id: 'user-001', inspection_date: '2025-11-05', status: 'Completed', risk_score: 55, risk_level: 'Medium', categories: JSON.stringify(['Academic Facilities', 'Student Data']), created_at: now() },
  ];
  DB.inspections.push(...inspections);

  // Documents
  const documents: Document[] = [
    { id: 'doc-001', inspection_id: 'insp-001', filename: 'SSR_2026.pdf', type: 'PDF', size: 2458000, status: 'Analyzed', created_at: now() },
    { id: 'doc-002', inspection_id: 'insp-001', filename: 'Fire_Safety_Certificate.pdf', type: 'PDF', size: 512000, status: 'Analyzed', created_at: now() },
    { id: 'doc-003', inspection_id: 'insp-001', filename: 'Faculty_Report.pdf', type: 'PDF', size: 1024000, status: 'Analyzed', created_at: now() },
    { id: 'doc-004', inspection_id: 'insp-001', filename: 'Infrastructure_Report.pdf', type: 'PDF', size: 3072000, status: 'Analyzed', created_at: now() },
    { id: 'doc-005', inspection_id: 'insp-002', filename: 'SSR_XYZ_2026.pdf', type: 'PDF', size: 1800000, status: 'Analyzed', created_at: now() },
  ];
  DB.documents.push(...documents);

  // Images
  const images: ImageRecord[] = [
    { id: 'img-001', inspection_id: 'insp-001', filename: 'lab_01.jpg', category: 'Laboratory', status: 'Analyzed', created_at: now() },
    { id: 'img-002', inspection_id: 'insp-001', filename: 'lab_02.jpg', category: 'Laboratory', status: 'Analyzed', created_at: now() },
    { id: 'img-003', inspection_id: 'insp-001', filename: 'lab_03.jpg', category: 'Fire Safety', status: 'Analyzed', created_at: now() },
    { id: 'img-004', inspection_id: 'insp-001', filename: 'classroom_01.jpg', category: 'Classroom', status: 'Analyzed', created_at: now() },
    { id: 'img-005', inspection_id: 'insp-001', filename: 'library_01.jpg', category: 'Library', status: 'Uploaded', created_at: now() },
    { id: 'img-006', inspection_id: 'insp-001', filename: 'campus_entrance.jpg', category: 'Campus', status: 'Analyzed', created_at: now() },
  ];
  DB.images.push(...images);

  // Claims
  const claims: Claim[] = [
    { id: 'claim-001', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Safety', claim_name: 'Fire Extinguishers', value: '10', source_document: 'SSR_2026.pdf', page_number: 18, confidence: 0.96, created_at: now() },
    { id: 'claim-002', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Student Data', claim_name: 'Total Students', value: '1250', source_document: 'SSR_2026.pdf', page_number: 12, confidence: 0.98, created_at: now() },
    { id: 'claim-003', inspection_id: 'insp-001', document_id: 'doc-003', category: 'Faculty Data', claim_name: 'Total Faculty', value: '82', source_document: 'Faculty_Report.pdf', page_number: 3, confidence: 0.97, created_at: now() },
    { id: 'claim-004', inspection_id: 'insp-001', document_id: 'doc-004', category: 'Infrastructure', claim_name: 'Laboratories', value: '10', source_document: 'Infrastructure_Report.pdf', page_number: 7, confidence: 0.94, created_at: now() },
    { id: 'claim-005', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Accessibility', claim_name: 'Barrier-Free Access', value: 'Available', source_document: 'SSR_2026.pdf', page_number: 22, confidence: 0.89, created_at: now() },
    { id: 'claim-006', inspection_id: 'insp-001', document_id: 'doc-002', category: 'Safety', claim_name: 'Fire Safety Certificate', value: 'Valid (2026)', source_document: 'Fire_Safety_Certificate.pdf', page_number: 1, confidence: 0.99, created_at: now() },
    { id: 'claim-007', inspection_id: 'insp-001', document_id: 'doc-004', category: 'Infrastructure', claim_name: 'Classrooms', value: '42', source_document: 'Infrastructure_Report.pdf', page_number: 5, confidence: 0.95, created_at: now() },
    { id: 'claim-008', inspection_id: 'insp-001', document_id: 'doc-001', category: 'Academic', claim_name: 'Programs Offered', value: '14', source_document: 'SSR_2026.pdf', page_number: 8, confidence: 0.97, created_at: now() },
  ];
  DB.claims.push(...claims);

  // Detections
  const detections: Detection[] = [
    { id: 'det-001', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Fire Extinguisher', confidence: 0.91, created_at: now() },
    { id: 'det-002', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Fire Extinguisher', confidence: 0.88, created_at: now() },
    { id: 'det-003', inspection_id: 'insp-001', image_id: 'img-003', object_type: 'Emergency Exit Sign', confidence: 0.84, created_at: now() },
    { id: 'det-004', inspection_id: 'insp-001', image_id: 'img-001', object_type: 'Lab Bench', confidence: 0.94, created_at: now() },
    { id: 'det-005', inspection_id: 'insp-001', image_id: 'img-001', object_type: 'Lab Bench', confidence: 0.92, created_at: now() },
    { id: 'det-006', inspection_id: 'insp-001', image_id: 'img-001', object_type: 'Lab Equipment', confidence: 0.87, created_at: now() },
    { id: 'det-007', inspection_id: 'insp-001', image_id: 'img-002', object_type: 'Lab Bench', confidence: 0.96, created_at: now() },
    { id: 'det-008', inspection_id: 'insp-001', image_id: 'img-004', object_type: 'Whiteboard', confidence: 0.93, created_at: now() },
    { id: 'det-009', inspection_id: 'insp-001', image_id: 'img-004', object_type: 'Student Desk', confidence: 0.95, created_at: now() },
    { id: 'det-010', inspection_id: 'insp-001', image_id: 'img-004', object_type: 'Projector', confidence: 0.89, created_at: now() },
  ];
  DB.detections.push(...detections);

  // Findings
  const findings: Finding[] = [
    { id: 'find-001', inspection_id: 'insp-001', finding_number: 'F-001', category: 'Fire Safety', title: 'Fire Extinguisher Count Verification', description: 'Institution claims 10 fire extinguishers. Uploaded visual evidence shows 2 extinguishers detected across 1 area image. Uploaded visual evidence does not cover enough areas to independently verify the full claim. Additional site inspection recommended.', evidence: JSON.stringify(['SSR_2026.pdf (Page 18)', 'lab_03.jpg (YOLO detection)']), risk: 'Medium', status: 'INSUFFICIENT_EVIDENCE', ai_confidence: 0.87, created_at: now() },
    { id: 'find-002', inspection_id: 'insp-001', finding_number: 'F-002', category: 'Student Data', title: 'Student Count Mismatch', description: 'Institution reports 1,250 students. AISHE data (2025) shows 1,080; NIRF data (2024) shows 1,100. Discrepancy of 150–170 students detected across multiple external sources. Potential over-reporting or enrollment data lag.', evidence: JSON.stringify(['SSR_2026.pdf (Page 12)', 'AISHE 2025 Data', 'NIRF 2024 Data']), risk: 'High', status: 'MISMATCH', ai_confidence: 0.94, created_at: now() },
    { id: 'find-003', inspection_id: 'insp-001', finding_number: 'F-003', category: 'Faculty Data', title: 'Faculty Count — Minor Mismatch', description: 'Institution reports 82 faculty. AISHE shows 80; NIRF shows 81. Minor discrepancy of 1–2 may be due to reporting cycle differences or adjunct faculty inclusion policies.', evidence: JSON.stringify(['Faculty_Report.pdf (Page 3)', 'AISHE 2025 Data', 'NIRF 2024 Data']), risk: 'Low', status: 'MINOR_MISMATCH', ai_confidence: 0.91, inspector_decision: 'ACCEPTED', inspector_comment: 'Minor difference attributable to part-time adjunct faculty included in institutional count but not external databases.', inspector_id: 'user-001', decided_at: '2026-08-12T10:30:00Z', created_at: now() },
    { id: 'find-004', inspection_id: 'insp-001', finding_number: 'F-004', category: 'Accessibility', title: 'Barrier-Free Access Verification', description: 'Institution claims barrier-free access is available. Uploaded campus images do not clearly show ramps, tactile paths, or accessible infrastructure. Insufficient visual evidence to verify claim. Physical inspection required.', evidence: JSON.stringify(['SSR_2026.pdf (Page 22)', 'campus_entrance.jpg']), risk: 'Medium', status: 'REQUIRES_VERIFICATION', ai_confidence: 0.78, created_at: now() },
    { id: 'find-005', inspection_id: 'insp-001', finding_number: 'F-005', category: 'Infrastructure', title: 'Laboratory Count — Partial Visual Verification', description: 'Institution claims 10 laboratories. 3 laboratory images uploaded covering 2 distinct lab environments. Visual evidence confirms presence of lab infrastructure. Insufficient visual coverage to independently verify the full claim of 10 labs.', evidence: JSON.stringify(['Infrastructure_Report.pdf (Page 7)', 'lab_01.jpg', 'lab_02.jpg', 'lab_03.jpg']), risk: 'Medium', status: 'INSUFFICIENT_EVIDENCE', ai_confidence: 0.82, created_at: now() },
    { id: 'find-006', inspection_id: 'insp-001', finding_number: 'F-006', category: 'Safety', title: 'Fire Safety Certificate — Verified', description: 'Fire safety certificate uploaded and cross-verified. Document is valid for 2026, issued by Coimbatore Fire & Rescue Services. Certificate validity consistent with documentary evidence.', evidence: JSON.stringify(['Fire_Safety_Certificate.pdf (Page 1)', 'SSR_2026.pdf (Page 18)']), risk: 'Low', status: 'CONSISTENT', ai_confidence: 0.99, inspector_decision: 'ACCEPTED', inspector_comment: 'Certificate verified. Document appears authentic with proper authority seal.', inspector_id: 'user-001', decided_at: '2026-08-12T10:45:00Z', created_at: now() },
  ];
  DB.findings.push(...findings);

  // Regulations
  const regulations: Regulation[] = [
    { id: 'reg-001', source: 'NAAC', document: 'NAAC Accreditation Manual 2022', section: 'Criterion II — Teaching-Learning and Evaluation', title: 'Student-Faculty Ratio Requirements', excerpt: 'The institution shall maintain a student-to-faculty ratio not exceeding 20:1 for UG programs. Faculty strength shall be calculated based on full-time regular faculty as per UGC norms. Data submitted in SSR shall be consistent with AISHE returns. Discrepancies between SSR data and AISHE returns shall be explained with documentary evidence.', tags: JSON.stringify(['faculty', 'students', 'ratio', 'AISHE', 'SSR']), created_at: now() },
    { id: 'reg-002', source: 'AICTE', document: 'AICTE Approval Process Handbook 2024-25', section: 'Chapter 4 — Infrastructure Requirements', title: 'Laboratory Infrastructure Standards', excerpt: 'Each technical institution shall maintain laboratories equipped with adequate instruments, equipment, and safety apparatus. Minimum laboratory area requirements shall be met as per AICTE norms. The institution shall ensure availability of fire safety equipment in all laboratory areas as per local fire safety regulations. Laboratory registers shall be maintained and available for inspection.', tags: JSON.stringify(['laboratory', 'infrastructure', 'fire safety', 'equipment']), created_at: now() },
    { id: 'reg-003', source: 'AICTE', document: 'AICTE Approval Process Handbook 2024-25', section: 'Chapter 5 — Fire Safety and Emergency Preparedness', title: 'Fire Safety Compliance Requirements', excerpt: 'The institution shall obtain a valid Fire Safety Certificate from the competent authority (Fire Officer/Chief Fire Officer). Fire extinguishers shall be installed at all required locations — typically one per 200 sq.m. or as directed by the fire authority. The certificate must be renewed annually. Records of fire drills shall be maintained. Emergency exit routes shall be clearly marked and unobstructed.', tags: JSON.stringify(['fire safety', 'fire extinguisher', 'certificate', 'emergency exit']), created_at: now() },
    { id: 'reg-004', source: 'UGC', document: 'UGC Guidelines on Barrier-Free Access 2021', section: 'Section 3 — Physical Accessibility Standards', title: 'Barrier-Free Access for Persons with Disabilities', excerpt: 'All higher educational institutions shall ensure that campus infrastructure is accessible to persons with disabilities as per the Rights of Persons with Disabilities Act 2016 (RPWD Act). This includes: (i) ramps at all building entrances, (ii) accessible toilets on each floor, (iii) tactile paths from main entrance to key facilities, (iv) Braille signage, (v) accessible classrooms. Compliance shall be documented and reported in the AISHE returns annually.', tags: JSON.stringify(['accessibility', 'barrier-free', 'disability', 'ramp', 'RPWD', 'UGC']), created_at: now() },
    { id: 'reg-005', source: 'NIRF', document: 'NIRF Ranking Framework 2024', section: 'Parameter 1 — Teaching, Learning & Resources', title: 'Student and Faculty Data Verification', excerpt: 'NIRF rankings require submission of student and faculty data consistent with AISHE returns. Institutions must ensure that data submitted for ranking reflects actual enrolled students and full-time faculty as of the reference date (31 December of the preceding academic year). Data discrepancies between NIRF submissions and AISHE returns may attract scrutiny and shall be explained with supporting documentation.', tags: JSON.stringify(['NIRF', 'students', 'faculty', 'data', 'AISHE', 'enrollment']), created_at: now() },
    { id: 'reg-006', source: 'NAAC', document: 'NAAC Accreditation Manual 2022', section: 'Criterion IV — Infrastructure and Learning Resources', title: 'Physical Infrastructure and Maintenance', excerpt: 'The institution shall maintain adequate physical infrastructure including classrooms, laboratories, library, and common facilities commensurate with the number of programs and students enrolled. Infrastructure data submitted in SSR shall be verifiable through physical inspection and photographic evidence. The institution shall maintain an asset register for all infrastructure.', tags: JSON.stringify(['infrastructure', 'classrooms', 'library', 'SSR', 'asset register']), created_at: now() },
  ];
  DB.regulations.push(...regulations);

  // External Data
  const externalData: ExternalData[] = [
    { id: 'ext-001', institution_id: 'inst-001', source: 'AISHE', metric: 'Total Students', value: '1080', year: 2025, created_at: now() },
    { id: 'ext-002', institution_id: 'inst-001', source: 'AISHE', metric: 'Total Faculty', value: '80', year: 2025, created_at: now() },
    { id: 'ext-003', institution_id: 'inst-001', source: 'AISHE', metric: 'Programs', value: '14', year: 2025, created_at: now() },
    { id: 'ext-004', institution_id: 'inst-001', source: 'NIRF', metric: 'Total Students', value: '1100', year: 2024, created_at: now() },
    { id: 'ext-005', institution_id: 'inst-001', source: 'NIRF', metric: 'Total Faculty', value: '81', year: 2024, created_at: now() },
    { id: 'ext-006', institution_id: 'inst-001', source: 'NIRF', metric: 'Programs', value: '13', year: 2024, created_at: now() },
    { id: 'ext-007', institution_id: 'inst-002', source: 'AISHE', metric: 'Total Students', value: '2050', year: 2025, created_at: now() },
    { id: 'ext-008', institution_id: 'inst-002', source: 'AISHE', metric: 'Total Faculty', value: '142', year: 2025, created_at: now() },
  ];
  DB.externalData.push(...externalData);
}
