package com.minero.horometro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EquipoResponse(
    Long idEquipo,
    String codigo,
    TipoEquipoResponse tipoEquipo,
    BigDecimal horometro,
    BigDecimal horasUltimoMantenimiento,
    BigDecimal horasDesdeUltimoMantenimiento,
    boolean requiereMantenimiento,
    LocalDateTime fechaActualizacion
) {}
