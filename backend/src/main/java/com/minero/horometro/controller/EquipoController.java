package com.minero.horometro.controller;

import com.minero.horometro.dto.request.EquipoCreateRequest;
import com.minero.horometro.dto.request.EquipoUpdateRequest;
import com.minero.horometro.dto.response.EquipoResponse;
import com.minero.horometro.service.EquipoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @GetMapping
    public ResponseEntity<List<EquipoResponse>> listarTodos() {
        return ResponseEntity.ok(equipoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<EquipoResponse> crear(@Valid @RequestBody EquipoCreateRequest request) {
        EquipoResponse creado = equipoService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}/horometro")
    public ResponseEntity<EquipoResponse> actualizarHorometro(
            @PathVariable Long id,
            @Valid @RequestBody EquipoUpdateRequest request) {
        return ResponseEntity.ok(equipoService.actualizarHorometro(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        equipoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
