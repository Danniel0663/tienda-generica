package com.tiendagenerica.productos;

import com.tiendagenerica.api.config.SecurityConfig;
import com.tiendagenerica.api.controller.ProductoController;
import com.tiendagenerica.api.entity.Producto;
import com.tiendagenerica.api.entity.Proveedor;
import com.tiendagenerica.api.exception.GlobalExceptionHandler;
import com.tiendagenerica.api.repository.ProductoRepository;
import com.tiendagenerica.api.repository.ProveedorRepository;
import com.tiendagenerica.api.security.AuthTokenService;
import com.tiendagenerica.api.security.JsonAuthenticationEntryPoint;
import com.tiendagenerica.api.security.TokenAuthenticationFilter;
import com.tiendagenerica.api.service.ProductoService;
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
@EntityScan(basePackageClasses = {Producto.class, Proveedor.class})
@EnableJpaRepositories(basePackageClasses = {ProductoRepository.class, ProveedorRepository.class})
@ComponentScan(
        basePackages = "com.tiendagenerica.api",
        useDefaultFilters = false,
        includeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                    ProductoController.class,
                    ProductoService.class,
                    GlobalExceptionHandler.class,
                    JsonAuthenticationEntryPoint.class,
                    TokenAuthenticationFilter.class,
                    AuthTokenService.class
                }))
@Import(SecurityConfig.class)
public class ProductosServiceApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(ProductosServiceApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(ProductosServiceApplication.class);
    }
}
