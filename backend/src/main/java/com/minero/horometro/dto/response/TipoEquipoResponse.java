package com.minero.horometro.dto.response;

import java.math.BigDecimal;

public record TipoEquipoResponse(
    Integer idTipo,
    String nombre,
    BigDecimal intervaloHorasMantenimiento,
    String descripcion
) {}
