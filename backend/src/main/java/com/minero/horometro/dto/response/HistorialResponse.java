package com.minero.horometro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistorialResponse(
    Long idHistorial,
    Long idEquipo,
    BigDecimal horometroServicio,
    LocalDateTime fechaServicio,
    String nombreTecnico,
    String observaciones
) {}
