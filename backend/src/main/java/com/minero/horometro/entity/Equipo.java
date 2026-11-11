package com.minero.horometro.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipos")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Long idEquipo;

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_id", nullable = false)
    private TipoEquipo tipoEquipo;

    @Column(name = "horometro", nullable = false, precision = 10, scale = 2)
    private BigDecimal horometro = BigDecimal.ZERO;

    @Column(name = "horas_ultimo_mantenimiento", nullable = false, precision = 10, scale = 2)
    private BigDecimal horasUltimoMantenimiento = BigDecimal.ZERO;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.fechaActualizacion == null) {
            this.fechaActualizacion = LocalDateTime.now();
        }
        if (this.horometro == null) {
            this.horometro = BigDecimal.ZERO;
        }
        if (this.horasUltimoMantenimiento == null) {
            this.horasUltimoMantenimiento = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public Equipo() {
    }

    public Equipo(String codigo, TipoEquipo tipoEquipo, BigDecimal horometro, BigDecimal horasUltimoMantenimiento) {
        this.codigo = codigo;
        this.tipoEquipo = tipoEquipo;
        this.horometro = horometro != null ? horometro : BigDecimal.ZERO;
        this.horasUltimoMantenimiento = horasUltimoMantenimiento != null ? horasUltimoMantenimiento : BigDecimal.ZERO;
    }

    public Long getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(Long idEquipo) {
        this.idEquipo = idEquipo;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public TipoEquipo getTipoEquipo() {
        return tipoEquipo;
    }

    public void setTipoEquipo(TipoEquipo tipoEquipo) {
        this.tipoEquipo = tipoEquipo;
    }

    public BigDecimal getHorometro() {
        return horometro;
    }

    public void setHorometro(BigDecimal horometro) {
        this.horometro = horometro;
    }

    public BigDecimal getHorasUltimoMantenimiento() {
        return horasUltimoMantenimiento;
    }

    public void setHorasUltimoMantenimiento(BigDecimal horasUltimoMantenimiento) {
        this.horasUltimoMantenimiento = horasUltimoMantenimiento;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
