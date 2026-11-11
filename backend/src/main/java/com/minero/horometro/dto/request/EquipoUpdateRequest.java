package com.minero.horometro.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record EquipoUpdateRequest(
    @NotNull(message = "El horómetro es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El horómetro no puede ser negativo")
    BigDecimal horometro
) {}
