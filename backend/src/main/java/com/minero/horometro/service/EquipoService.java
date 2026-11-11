package com.minero.horometro.service;

import com.minero.horometro.dto.request.EquipoCreateRequest;
import com.minero.horometro.dto.request.EquipoUpdateRequest;
import com.minero.horometro.dto.response.EquipoResponse;

import java.util.List;

public interface EquipoService {
    List<EquipoResponse> listarTodos();
    EquipoResponse obtenerPorId(Long id);
    EquipoResponse crear(EquipoCreateRequest request);
    EquipoResponse actualizarHorometro(Long id, EquipoUpdateRequest request);
    void eliminar(Long id);
}
