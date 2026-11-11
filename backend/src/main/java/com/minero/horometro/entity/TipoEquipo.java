package com.minero.horometro.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tipos_equipo")
public class TipoEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Integer idTipo;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "intervalo_horas_mantenimiento", nullable = false, precision = 10, scale = 2)
    private BigDecimal intervaloHorasMantenimiento;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    public TipoEquipo() {
    }

    public TipoEquipo(Integer idTipo, String nombre, BigDecimal intervaloHorasMantenimiento, String descripcion) {
        this.idTipo = idTipo;
        this.nombre = nombre;
        this.intervaloHorasMantenimiento = intervaloHorasMantenimiento;
        this.descripcion = descripcion;
    }

    public TipoEquipo(String nombre, BigDecimal intervaloHorasMantenimiento, String descripcion) {
        this.nombre = nombre;
        this.intervaloHorasMantenimiento = intervaloHorasMantenimiento;
        this.descripcion = descripcion;
    }

    public Integer getIdTipo() {
        return idTipo;
    }

    public void setIdTipo(Integer idTipo) {
        this.idTipo = idTipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getIntervaloHorasMantenimiento() {
        return intervaloHorasMantenimiento;
    }

    public void setIntervaloHorasMantenimiento(BigDecimal intervaloHorasMantenimiento) {
        this.intervaloHorasMantenimiento = intervaloHorasMantenimiento;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
