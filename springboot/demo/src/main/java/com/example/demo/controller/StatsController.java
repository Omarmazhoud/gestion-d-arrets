package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.StatsService;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("")
    public Map<String, Object> getGlobalStats() {
        return statsService.getGlobalStats();
    }

    @GetMapping("/postes")
    public List<Map<String, Object>> statsPostes() {
        return statsService.statsPostes();
    }
}
