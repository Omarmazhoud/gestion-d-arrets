package com.example.demo.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "API Gestion d'arrets",
                version = "1.0",
                description = "API REST pour la gestion d'arrets, utilisateurs et tickets de panne"
        )
)
public class SwaggerConfig {
}
