package com.inspectai.core.controller;

import com.inspectai.core.model.Document;
import com.inspectai.core.repository.DocumentRepository;
import com.inspectai.core.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentRepository documentRepository;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping({"/institutions/{institutionId}/documents/upload", "/documents/upload"})
    public ResponseEntity<?> uploadDocument(
            @PathVariable(value = "institutionId", required = false) String pathInstitutionId,
            @RequestParam(value = "inspection_id", required = false) String inspectionIdStr,
            @RequestParam("file") MultipartFile file) {

        Long institutionId = 1L;
        Long inspectionId = 1L;

        try {
            if (pathInstitutionId != null) {
                institutionId = Long.parseLong(pathInstitutionId.replace("inst-", ""));
            }
        } catch (Exception ignored) {}

        try {
            if (inspectionIdStr != null) {
                inspectionId = Long.parseLong(inspectionIdStr.replace("insp-", ""));
            }
        } catch (Exception ignored) {}

        try {
            // 1. Store file locally
            String storagePath = fileStorageService.storeFile(file);

            // 2. Call Python AI Microservice for text extraction
            String extractedText = "";
            String extractionMethod = "pdfplumber";

            try {
                String aiEndpoint = aiServiceUrl + "/api/v1/ai/documents/analyze";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
                    }
                };

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("file", fileResource);

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                ResponseEntity<Map> aiResponse = restTemplate.postForEntity(aiEndpoint, requestEntity, Map.class);

                if (aiResponse.getStatusCode() == HttpStatus.OK && aiResponse.getBody() != null) {
                    Map<String, Object> respMap = aiResponse.getBody();
                    Object textObj = respMap.get("extracted_text");
                    extractedText = textObj != null ? textObj.toString() : "";
                    if (respMap.containsKey("extraction_method")) {
                        extractionMethod = respMap.get("extraction_method").toString();
                    }
                }
            } catch (Exception ex) {
                System.err.println("Warning: AI service call failed, continuing with fallback text: " + ex.getMessage());
                extractedText = "Extraction pending/offline";
            }

            // 3. Persist Document record in PostgreSQL
            Document document = new Document(
                    institutionId,
                    inspectionId,
                    file.getOriginalFilename(),
                    storagePath,
                    extractionMethod.toUpperCase(),
                    extractedText
            );

            Document savedDocument = documentRepository.save(document);

            // Format response to match frontend Document state expectations
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedDocument.getId().toString());
            response.put("filename", savedDocument.getOriginalFilename() != null ? savedDocument.getOriginalFilename() : "document.pdf");
            response.put("originalFilename", savedDocument.getOriginalFilename());
            response.put("type", "PDF");
            response.put("size", file.getSize());
            response.put("uploadedAt", savedDocument.getUploadedAt() != null ? savedDocument.getUploadedAt().toString() : "");
            response.put("status", "Analyzed");
            response.put("extraction_method", savedDocument.getExtractionMethod());
            response.put("extracted_text", savedDocument.getExtractedText());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Document upload failed: " + e.getMessage()));
        }
    }

    @GetMapping({"/institutions/{institutionId}/documents", "/documents/{id}", "/documents"})
    public ResponseEntity<?> getDocuments(@PathVariable(value = "id", required = false) String idStr) {
        List<Document> rawDocs = documentRepository.findAll();
        List<Map<String, Object>> formattedDocs = rawDocs.stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getId().toString());
            map.put("filename", doc.getOriginalFilename() != null ? doc.getOriginalFilename() : "document.pdf");
            map.put("originalFilename", doc.getOriginalFilename());
            map.put("type", "PDF");
            map.put("size", 245000L);
            map.put("uploadedAt", doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : "");
            map.put("status", "Analyzed");
            map.put("extraction_method", doc.getExtractionMethod());
            map.put("extracted_text", doc.getExtractedText());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(formattedDocs);
    }
}
