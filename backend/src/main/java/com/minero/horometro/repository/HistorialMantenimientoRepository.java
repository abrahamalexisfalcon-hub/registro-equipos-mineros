package com.minero.horometro.repository;

import com.minero.horometro.entity.HistorialMantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialMantenimientoRepository extends JpaRepository<HistorialMantenimiento, Long> {
    List<HistorialMantenimiento> findByEquipoIdEquipoOrderByFechaServicioDesc(Long idEquipo);
}
