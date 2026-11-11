package com.minero.horometro.service.impl;

import com.minero.horometro.dto.request.MantenimientoCreateRequest;
import com.minero.horometro.dto.response.HistorialResponse;
import com.minero.horometro.entity.Equipo;
import com.minero.horometro.entity.HistorialMantenimiento;
import com.minero.horometro.exception.ResourceNotFoundException;
import com.minero.horometro.repository.EquipoRepository;
import com.minero.horometro.repository.HistorialMantenimientoRepository;
import com.minero.horometro.service.MantenimientoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MantenimientoServiceImpl implements MantenimientoService {

    private final EquipoRepository equipoRepository;
    private final HistorialMantenimientoRepository historialMantenimientoRepository;

    public MantenimientoServiceImpl(EquipoRepository equipoRepository,
                                    HistorialMantenimientoRepository historialMantenimientoRepository) {
        this.equipoRepository = equipoRepository;
        this.historialMantenimientoRepository = historialMantenimientoRepository;
    }

    @Override
    @Transactional
    public HistorialResponse registrarMantenimiento(Long equipoId, MantenimientoCreateRequest request) {
        Equipo equipo = equipoRepository.findById(equipoId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con ID: " + equipoId));

        HistorialMantenimiento historial = new HistorialMantenimiento();
        historial.setEquipo(equipo);
        historial.setHorometroServicio(equipo.getHorometro());
        historial.setFechaServicio(LocalDateTime.now());
        historial.setNombreTecnico(request.nombreTecnico().trim());
        historial.setObservaciones(request.observaciones());

        // Actualizar horas_ultimo_mantenimiento = horometro en la entidad Equipo
        equipo.setHorasUltimoMantenimiento(equipo.getHorometro());
        equipoRepository.save(equipo);

        HistorialMantenimiento guardado = historialMantenimientoRepository.save(historial);
        return mapToHistorialResponse(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialResponse> obtenerHistorialPorEquipo(Long equipoId) {
        if (!equipoRepository.existsById(equipoId)) {
            throw new ResourceNotFoundException("Equipo no encontrado con ID: " + equipoId);
        }
        return historialMantenimientoRepository.findByEquipoIdEquipoOrderByFechaServicioDesc(equipoId)
                .stream()
                .map(this::mapToHistorialResponse)
                .toList();
    }

    private HistorialResponse mapToHistorialResponse(HistorialMantenimiento historial) {
        return new HistorialResponse(
                historial.getIdHistorial(),
                historial.getEquipo().getIdEquipo(),
                historial.getHorometroServicio(),
                historial.getFechaServicio(),
                historial.getNombreTecnico(),
                historial.getObservaciones()
        );
    }
}
