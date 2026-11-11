package com.minero.horometro.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record EquipoCreateRequest(
    @NotBlank(message = "El código es obligatorio")
    String codigo,

    @NotNull(message = "El tipo de equipo es obligatorio")
    Integer tipoId,

    @NotNull(message = "El horómetro inicial es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El horómetro inicial no puede ser negativo")
    BigDecimal horometroInicial
) {}
