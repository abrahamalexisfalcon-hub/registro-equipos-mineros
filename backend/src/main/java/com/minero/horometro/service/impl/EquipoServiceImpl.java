package com.minero.horometro.service.impl;

import com.minero.horometro.dto.request.EquipoCreateRequest;
import com.minero.horometro.dto.request.EquipoUpdateRequest;
import com.minero.horometro.dto.response.EquipoResponse;
import com.minero.horometro.dto.response.TipoEquipoResponse;
import com.minero.horometro.entity.Equipo;
import com.minero.horometro.entity.TipoEquipo;
import com.minero.horometro.exception.BusinessRuleException;
import com.minero.horometro.exception.ResourceNotFoundException;
import com.minero.horometro.repository.EquipoRepository;
import com.minero.horometro.repository.HistorialMantenimientoRepository;
import com.minero.horometro.repository.TipoEquipoRepository;
import com.minero.horometro.service.EquipoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EquipoServiceImpl implements EquipoService {

    private final EquipoRepository equipoRepository;
    private final TipoEquipoRepository tipoEquipoRepository;
    private final HistorialMantenimientoRepository historialMantenimientoRepository;

    public EquipoServiceImpl(EquipoRepository equipoRepository,
                             TipoEquipoRepository tipoEquipoRepository,
                             HistorialMantenimientoRepository historialMantenimientoRepository) {
        this.equipoRepository = equipoRepository;
        this.tipoEquipoRepository = tipoEquipoRepository;
        this.historialMantenimientoRepository = historialMantenimientoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipoResponse> listarTodos() {
        return equipoRepository.findAll()
                .stream()
                .map(this::mapToEquipoResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EquipoResponse obtenerPorId(Long id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));
        return mapToEquipoResponse(equipo);
    }

    @Override
    @Transactional
    public EquipoResponse crear(EquipoCreateRequest request) {
        String codigoNormalizado = request.codigo().trim().toUpperCase();
        if (equipoRepository.existsByCodigo(codigoNormalizado)) {
            throw new BusinessRuleException("Ya existe un equipo registrado con el código: " + codigoNormalizado);
        }

        TipoEquipo tipoEquipo = tipoEquipoRepository.findById(request.tipoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado con ID: " + request.tipoId()));

        Equipo nuevoEquipo = new Equipo();
        nuevoEquipo.setCodigo(codigoNormalizado);
        nuevoEquipo.setTipoEquipo(tipoEquipo);
        nuevoEquipo.setHorometro(request.horometroInicial());
        nuevoEquipo.setHorasUltimoMantenimiento(BigDecimal.ZERO);

        Equipo guardado = equipoRepository.save(nuevoEquipo);
        return mapToEquipoResponse(guardado);
    }

    @Override
    @Transactional
    public EquipoResponse actualizarHorometro(Long id, EquipoUpdateRequest request) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));

        if (request.horometro().compareTo(equipo.getHorometro()) < 0) {
            throw new BusinessRuleException(
                    String.format("El nuevo horómetro (%s) no puede ser menor al horómetro actual (%s).",
                            request.horometro(), equipo.getHorometro())
            );
        }

        equipo.setHorometro(request.horometro());
        Equipo actualizado = equipoRepository.save(equipo);
        return mapToEquipoResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + id));
        // Eliminar primero el historial asociado para no violar la FK id_equipo
        historialMantenimientoRepository.deleteAll(
                historialMantenimientoRepository.findByEquipoIdEquipoOrderByFechaServicioDesc(id));
        equipoRepository.delete(equipo);
    }

    private EquipoResponse mapToEquipoResponse(Equipo equipo) {
        TipoEquipo tipo = equipo.getTipoEquipo();
        TipoEquipoResponse tipoResponse = new TipoEquipoResponse(
                tipo.getIdTipo(),
                tipo.getNombre(),
                tipo.getIntervaloHorasMantenimiento(),
                tipo.getDescripcion()
        );

        BigDecimal horometro = equipo.getHorometro() != null ? equipo.getHorometro() : BigDecimal.ZERO;
        BigDecimal horasUltimo = equipo.getHorasUltimoMantenimiento() != null ? equipo.getHorasUltimoMantenimiento() : BigDecimal.ZERO;
        BigDecimal horasDesdeUltimo = horometro.subtract(horasUltimo);

        BigDecimal intervalo = tipo.getIntervaloHorasMantenimiento() != null
                ? tipo.getIntervaloHorasMantenimiento()
                : BigDecimal.ZERO;

        boolean requiereMantenimiento = horasDesdeUltimo.compareTo(intervalo) >= 0;

        return new EquipoResponse(
                equipo.getIdEquipo(),
                equipo.getCodigo(),
                tipoResponse,
                horometro,
                horasUltimo,
                horasDesdeUltimo,
                requiereMantenimiento,
                equipo.getFechaActualizacion() != null ? equipo.getFechaActualizacion() : equipo.getFechaCreacion()
        );
    }
}
