package com.minero.horometro.service;

import com.minero.horometro.dto.request.MantenimientoCreateRequest;
import com.minero.horometro.dto.response.HistorialResponse;

import java.util.List;

public interface MantenimientoService {
    HistorialResponse registrarMantenimiento(Long equipoId, MantenimientoCreateRequest request);
    List<HistorialResponse> obtenerHistorialPorEquipo(Long equipoId);
}
