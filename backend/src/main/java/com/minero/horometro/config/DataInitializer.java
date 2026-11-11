package com.minero.horometro.config;

import com.minero.horometro.entity.TipoEquipo;
import com.minero.horometro.repository.TipoEquipoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final TipoEquipoRepository tipoEquipoRepository;

    public DataInitializer(TipoEquipoRepository tipoEquipoRepository) {
        this.tipoEquipoRepository = tipoEquipoRepository;
    }

    @Override
    public void run(String... args) {
        if (tipoEquipoRepository.count() == 0) {
            log.info("Inicializando datos semilla para tipos de equipo...");
            tipoEquipoRepository.saveAll(List.of(
                    new TipoEquipo("CAMION", new BigDecimal("500.00"), "Camión de extracción minera"),
                    new TipoEquipo("EXCAVADORA", new BigDecimal("250.00"), "Excavadora hidráulica"),
                    new TipoEquipo("PERFORADORA", new BigDecimal("400.00"), "Perforadora rotativa")
            ));
            log.info("Tipos de equipo inicializados exitosamente.");
        }
    }
}
