package com.minero.horometro.service;

import com.minero.horometro.dto.request.TipoEquipoCreateRequest;
import com.minero.horometro.dto.response.TipoEquipoResponse;

import java.util.List;

public interface TipoEquipoService {
    List<TipoEquipoResponse> listarTodos();
    TipoEquipoResponse crear(TipoEquipoCreateRequest request);
}
