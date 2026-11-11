package com.minero.horometro.repository;

import com.minero.horometro.entity.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Long> {
    Optional<Equipo> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
}
