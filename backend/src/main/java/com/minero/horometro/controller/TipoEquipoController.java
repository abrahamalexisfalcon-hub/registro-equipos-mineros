package com.minero.horometro.controller;

import com.minero.horometro.dto.request.TipoEquipoCreateRequest;
import com.minero.horometro.dto.response.TipoEquipoResponse;
import com.minero.horometro.service.TipoEquipoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tipos-equipo")
public class TipoEquipoController {

    private final TipoEquipoService tipoEquipoService;

    public TipoEquipoController(TipoEquipoService tipoEquipoService) {
        this.tipoEquipoService = tipoEquipoService;
    }

    @GetMapping
    public ResponseEntity<List<TipoEquipoResponse>> listarTodos() {
        return ResponseEntity.ok(tipoEquipoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<TipoEquipoResponse> crear(@Valid @RequestBody TipoEquipoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoEquipoService.crear(request));
    }
}
