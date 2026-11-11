package com.minero.horometro.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TipoEquipoCreateRequest(
    @NotBlank(message = "El nombre del tipo de equipo es obligatorio")
    String nombre,

    @NotNull(message = "El intervalo de mantenimiento es obligatorio")
    @DecimalMin(value = "1.0", inclusive = true, message = "El intervalo de mantenimiento debe ser mayor a 0")
    @JsonAlias("intervaloMantenimiento")
    BigDecimal intervaloHorasMantenimiento,

    String descripcion
) {}
