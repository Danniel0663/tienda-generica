package com.tiendagenerica.clientes;

import com.tiendagenerica.api.config.SecurityConfig;
import com.tiendagenerica.api.controller.ClienteController;
import com.tiendagenerica.api.entity.Cliente;
import com.tiendagenerica.api.exception.GlobalExceptionHandler;
import com.tiendagenerica.api.repository.ClienteRepository;
import com.tiendagenerica.api.security.AuthTokenService;
import com.tiendagenerica.api.security.JsonAuthenticationEntryPoint;
import com.tiendagenerica.api.security.TokenAuthenticationFilter;
import com.tiendagenerica.api.service.ClienteService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootConfiguration
@EnableAutoConfiguration
@EntityScan(basePackageClasses = Cliente.class)
@EnableJpaRepositories(basePackageClasses = ClienteRepository.class)
@ComponentScan(
        basePackages = "com.tiendagenerica.api",
        useDefaultFilters = false,
        includeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                    ClienteController.class,
                    ClienteService.class,
                    GlobalExceptionHandler.class,
                    JsonAuthenticationEntryPoint.class,
                    TokenAuthenticationFilter.class,
                    AuthTokenService.class
                }))
@Import(SecurityConfig.class)
public class ClientesServiceApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(ClientesServiceApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(ClientesServiceApplication.class);
    }
}
