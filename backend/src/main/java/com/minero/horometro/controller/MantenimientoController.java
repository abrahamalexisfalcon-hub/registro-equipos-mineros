package com.minero.horometro.controller;

import com.minero.horometro.dto.request.MantenimientoCreateRequest;
import com.minero.horometro.dto.response.HistorialResponse;
import com.minero.horometro.service.MantenimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipos")
public class MantenimientoController {

    private final MantenimientoService mantenimientoService;

    public MantenimientoController(MantenimientoService mantenimientoService) {
        this.mantenimientoService = mantenimientoService;
    }

    @PostMapping({"/{equipoId}/mantenimiento", "/{equipoId}/mantenimientos"})
    public ResponseEntity<HistorialResponse> registrarMantenimiento(
            @PathVariable Long equipoId,
            @Valid @RequestBody MantenimientoCreateRequest request) {
        HistorialResponse response = mantenimientoService.registrarMantenimiento(equipoId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"/{equipoId}/historial", "/{equipoId}/mantenimientos"})
    public ResponseEntity<List<HistorialResponse>> obtenerHistorialPorEquipo(@PathVariable Long equipoId) {
        return ResponseEntity.ok(mantenimientoService.obtenerHistorialPorEquipo(equipoId));
    }
}
