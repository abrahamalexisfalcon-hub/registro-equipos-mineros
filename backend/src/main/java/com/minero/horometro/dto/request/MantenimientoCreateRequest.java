package com.minero.horometro.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MantenimientoCreateRequest(
    @NotBlank(message = "El nombre del técnico es obligatorio")
    String nombreTecnico,

    String observaciones
) {}
