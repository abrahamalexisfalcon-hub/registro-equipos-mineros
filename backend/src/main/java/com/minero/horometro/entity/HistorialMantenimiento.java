package com.minero.horometro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_mantenimiento")
public class HistorialMantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_equipo", nullable = false)
    private Equipo equipo;

    @Column(name = "horometro_servicio", nullable = false, precision = 10, scale = 2)
    private BigDecimal horometroServicio;

    @Column(name = "fecha_servicio", nullable = false)
    private LocalDateTime fechaServicio;

    @Column(name = "nombre_tecnico", nullable = false, length = 150)
    private String nombreTecnico;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @PrePersist
    public void prePersist() {
        if (this.fechaServicio == null) {
            this.fechaServicio = LocalDateTime.now();
        }
    }

    public HistorialMantenimiento() {
    }

    public HistorialMantenimiento(Equipo equipo, BigDecimal horometroServicio, LocalDateTime fechaServicio, String nombreTecnico, String observaciones) {
        this.equipo = equipo;
        this.horometroServicio = horometroServicio;
        this.fechaServicio = fechaServicio;
        this.nombreTecnico = nombreTecnico;
        this.observaciones = observaciones;
    }

    public Long getIdHistorial() {
        return idHistorial;
    }

    public void setIdHistorial(Long idHistorial) {
        this.idHistorial = idHistorial;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    public BigDecimal getHorometroServicio() {
        return horometroServicio;
    }

    public void setHorometroServicio(BigDecimal horometroServicio) {
        this.horometroServicio = horometroServicio;
    }

    public LocalDateTime getFechaServicio() {
        return fechaServicio;
    }

    public void setFechaServicio(LocalDateTime fechaServicio) {
        this.fechaServicio = fechaServicio;
    }

    public String getNombreTecnico() {
        return nombreTecnico;
    }

    public void setNombreTecnico(String nombreTecnico) {
        this.nombreTecnico = nombreTecnico;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
