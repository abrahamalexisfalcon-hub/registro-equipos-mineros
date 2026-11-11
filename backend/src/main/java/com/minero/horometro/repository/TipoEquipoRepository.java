package com.minero.horometro.repository;

import com.minero.horometro.entity.TipoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Integer> {
    Optional<TipoEquipo> findByNombre(String nombre);
    boolean existsByNombreIgnoreCase(String nombre);
    List<TipoEquipo> findAllByOrderByIdTipoAsc();
}
