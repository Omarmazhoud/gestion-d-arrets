package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        System.err.println("RuntimeException: " + ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex.getMessage().contains("incorrect")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (ex.getMessage().contains("non validé")) {
            status = HttpStatus.FORBIDDEN;
        } else if (ex.getMessage().contains("introuvable")) {
            status = HttpStatus.NOT_FOUND;
        }

        return new ResponseEntity<>(response, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        // Walk to root cause to get the real DB/JPA error
        Throwable root = ex;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        String message = root.getMessage() != null ? root.getMessage() : ex.getMessage();
        System.err.println("=== SERVER ERROR ===");
        System.err.println("Type   : " + ex.getClass().getName());
        System.err.println("Message: " + ex.getMessage());
        System.err.println("Root   : " + message);
        ex.printStackTrace();
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        response.put("type", ex.getClass().getSimpleName());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
