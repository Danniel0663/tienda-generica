package com.tiendagenerica.usuarios;

import com.tiendagenerica.api.config.DataInitializer;
import com.tiendagenerica.api.config.SecurityConfig;
import com.tiendagenerica.api.controller.AuthController;
import com.tiendagenerica.api.controller.UsuarioController;
import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.exception.GlobalExceptionHandler;
import com.tiendagenerica.api.repository.UsuarioRepository;
import com.tiendagenerica.api.security.AuthTokenService;
import com.tiendagenerica.api.security.JsonAuthenticationEntryPoint;
import com.tiendagenerica.api.security.TokenAuthenticationFilter;
import com.tiendagenerica.api.service.AuthService;
import com.tiendagenerica.api.service.UsuarioService;
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
@EntityScan(basePackageClasses = Usuario.class)
@EnableJpaRepositories(basePackageClasses = UsuarioRepository.class)
@ComponentScan(
        basePackages = "com.tiendagenerica.api",
        useDefaultFilters = false,
        includeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                    UsuarioController.class,
                    AuthController.class,
                    UsuarioService.class,
                    AuthService.class,
                    DataInitializer.class,
                    GlobalExceptionHandler.class,
                    JsonAuthenticationEntryPoint.class,
                    TokenAuthenticationFilter.class,
                    AuthTokenService.class
                }))
@Import(SecurityConfig.class)
public class UsuariosServiceApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(UsuariosServiceApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(UsuariosServiceApplication.class);
    }
}
