package com.inspectai.core.config;

import com.inspectai.core.model.Finding;
import com.inspectai.core.model.Inspection;
import com.inspectai.core.model.Institution;
import com.inspectai.core.model.User;
import com.inspectai.core.repository.FindingRepository;
import com.inspectai.core.repository.InspectionRepository;
import com.inspectai.core.repository.InstitutionRepository;
import com.inspectai.core.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final InspectionRepository inspectionRepository;
    private final FindingRepository findingRepository;

    public DataSeeder(UserRepository userRepository,
                      InstitutionRepository institutionRepository,
                      InspectionRepository inspectionRepository,
                      FindingRepository findingRepository) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.inspectionRepository = inspectionRepository;
        this.findingRepository = findingRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User inspector = new User("usr-1", "Dr. Rajesh Sharma", "inspector@demo.com", "inspector123", "INSPECTOR");
            userRepository.save(inspector);
        }

        if (institutionRepository.count() == 0) {
            Institution inst1 = new Institution("inst-1", "ABC Institute of Technology", "ABC-TECH-01", "C-24151", "Engineering & Tech", "Karnataka", "Bengaluru", "123 Innovation Campus, Whitefield", "contact@abctech.edu", "+91 80 2345 6789");
            Institution inst2 = new Institution("inst-2", "XYZ National University", "XYZ-UNIV-02", "U-08922", "Central University", "Maharashtra", "Pune", "University Road, Ganeshkhind", "registrar@xyzuniv.edu.in", "+91 20 9876 5432");
            Institution inst3 = new Institution("inst-3", "Global Institute of Medical Sciences", "GIMS-MED-03", "M-14022", "Medical & Sciences", "Tamil Nadu", "Chennai", "45 Healthcare Enclave, Guindy", "admin@gimsmed.edu.in", "+91 44 2234 8899");
            Institution inst4 = new Institution("inst-4", "National School of Management & Research", "NSMR-MGMT-04", "S-05891", "Management Institute", "Haryana", "Gurugram", "88 Executive Boulevard, Cyber City", "admissions@nsmr.ac.in", "+91 124 456 7890");

            institutionRepository.save(inst1);
            institutionRepository.save(inst2);
            institutionRepository.save(inst3);
            institutionRepository.save(inst4);
        }

        if (inspectionRepository.count() == 0) {
            Inspection insp1 = new Inspection("insp-1", "INS-2026-001", "inst-1", "usr-1", "In Progress", 65.0, "High", Instant.now().toString());
            Inspection insp2 = new Inspection("insp-2", "INS-2026-002", "inst-2", "usr-1", "In Progress", 22.0, "Low", Instant.now().toString());
            Inspection insp3 = new Inspection("insp-3", "INS-2026-003", "inst-3", "usr-1", "Action Required", 88.0, "Critical", Instant.now().toString());
            Inspection insp4 = new Inspection("insp-4", "INS-2026-004", "inst-4", "usr-1", "Completed", 15.0, "Low", Instant.now().toString());

            inspectionRepository.save(insp1);
            inspectionRepository.save(insp2);
            inspectionRepository.save(insp3);
            inspectionRepository.save(insp4);
        }

        if (findingRepository.count() == 0) {
            Finding f1 = new Finding();
            f1.setId("fnd-1");
            f1.setInspectionId("insp-1");
            f1.setFindingNumber("FND-001");
            f1.setCategory("Infrastructure & Accessibility");
            f1.setTitle("Discrepancy in Barrier-Free Accessibility Compliance");
            f1.setDescription("SSR document claims ramp availability at Block B, but visual AI analysis detected standard stairs without accessible ramp.");
            f1.setEvidence("[\"SSR_2026.pdf (Page 14)\", \"IMG_BlockB_Entrance.jpg\"]");
            f1.setRisk("HIGH");
            f1.setStatus("OPEN");
            f1.setAiConfidence(0.92);
            f1.setCreatedAt(Instant.now().toString());
            findingRepository.save(f1);

            Finding f2 = new Finding();
            f2.setId("fnd-2");
            f2.setInspectionId("insp-1");
            f2.setFindingNumber("FND-002");
            f2.setCategory("Safety & Compliance");
            f2.setTitle("Expired Fire Safety NOC Certificate");
            f2.setDescription("Uploaded NOC certificate expired on Nov 15, 2025. Fire extinguisher maintenance tag status unverified.");
            f2.setEvidence("[\"Fire_Safety_NOC.pdf\"]");
            f2.setRisk("CRITICAL");
            f2.setStatus("OPEN");
            f2.setAiConfidence(0.97);
            f2.setCreatedAt(Instant.now().toString());
            findingRepository.save(f2);
        }

        System.out.println("✅ Spring Boot Database Seeded Successfully (4 Institutions, 4 Inspections)!");
    }
}
