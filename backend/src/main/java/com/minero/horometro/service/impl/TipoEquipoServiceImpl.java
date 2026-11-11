package com.minero.horometro.service.impl;

import com.minero.horometro.dto.request.TipoEquipoCreateRequest;
import com.minero.horometro.dto.response.TipoEquipoResponse;
import com.minero.horometro.entity.TipoEquipo;
import com.minero.horometro.exception.BusinessRuleException;
import com.minero.horometro.repository.TipoEquipoRepository;
import com.minero.horometro.service.TipoEquipoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TipoEquipoServiceImpl implements TipoEquipoService {

    private final TipoEquipoRepository tipoEquipoRepository;

    public TipoEquipoServiceImpl(TipoEquipoRepository tipoEquipoRepository) {
        this.tipoEquipoRepository = tipoEquipoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoEquipoResponse> listarTodos() {
        return tipoEquipoRepository.findAllByOrderByIdTipoAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public TipoEquipoResponse crear(TipoEquipoCreateRequest request) {
        String nombreNormalizado = request.nombre().trim().toUpperCase();
        if (tipoEquipoRepository.existsByNombreIgnoreCase(nombreNormalizado)) {
            throw new BusinessRuleException("Ya existe un tipo de equipo con el nombre: " + nombreNormalizado);
        }

        String descripcion = (request.descripcion() != null && !request.descripcion().isBlank())
                ? request.descripcion().trim()
                : "Maquinaria tipo " + nombreNormalizado;

        TipoEquipo nuevo = new TipoEquipo(nombreNormalizado, request.intervaloHorasMantenimiento(), descripcion);
        return mapToResponse(tipoEquipoRepository.save(nuevo));
    }

    private TipoEquipoResponse mapToResponse(TipoEquipo tipo) {
        return new TipoEquipoResponse(
                tipo.getIdTipo(),
                tipo.getNombre(),
                tipo.getIntervaloHorasMantenimiento(),
                tipo.getDescripcion()
        );
    }
}
