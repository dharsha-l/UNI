package com.inspectai.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
        System.out.println("🌐 InspectAI Spring Cloud Gateway running on http://localhost:8080");
        System.out.println("   Routing /api/** -> Spring Boot Core (8081) & FastAPI AI (8000)");
    }
}
