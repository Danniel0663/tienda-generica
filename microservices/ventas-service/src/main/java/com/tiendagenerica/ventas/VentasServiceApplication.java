package com.tiendagenerica.ventas;

import com.tiendagenerica.api.config.SecurityConfig;
import com.tiendagenerica.api.controller.VentaController;
import com.tiendagenerica.api.entity.Cliente;
import com.tiendagenerica.api.entity.DetalleVenta;
import com.tiendagenerica.api.entity.Producto;
import com.tiendagenerica.api.entity.Proveedor;
import com.tiendagenerica.api.entity.Usuario;
import com.tiendagenerica.api.entity.Venta;
import com.tiendagenerica.api.exception.GlobalExceptionHandler;
import com.tiendagenerica.api.repository.ClienteRepository;
import com.tiendagenerica.api.repository.DetalleVentaRepository;
import com.tiendagenerica.api.repository.ProductoRepository;
import com.tiendagenerica.api.repository.ProveedorRepository;
import com.tiendagenerica.api.repository.UsuarioRepository;
import com.tiendagenerica.api.repository.VentaRepository;
import com.tiendagenerica.api.security.AuthTokenService;
import com.tiendagenerica.api.security.JsonAuthenticationEntryPoint;
import com.tiendagenerica.api.security.TokenAuthenticationFilter;
import com.tiendagenerica.api.service.ClienteService;
import com.tiendagenerica.api.service.ProductoService;
import com.tiendagenerica.api.service.UsuarioService;
import com.tiendagenerica.api.service.VentaService;
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
@EntityScan(basePackageClasses = {
    Venta.class,
    DetalleVenta.class,
    Cliente.class,
    Usuario.class,
    Producto.class,
    Proveedor.class
})
@EnableJpaRepositories(basePackageClasses = {
    VentaRepository.class,
    DetalleVentaRepository.class,
    ClienteRepository.class,
    UsuarioRepository.class,
    ProductoRepository.class,
    ProveedorRepository.class
})
@ComponentScan(
        basePackages = "com.tiendagenerica.api",
        useDefaultFilters = false,
        includeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                    VentaController.class,
                    VentaService.class,
                    ClienteService.class,
                    UsuarioService.class,
                    ProductoService.class,
                    GlobalExceptionHandler.class,
                    JsonAuthenticationEntryPoint.class,
                    TokenAuthenticationFilter.class,
                    AuthTokenService.class
                }))
@Import(SecurityConfig.class)
public class VentasServiceApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(VentasServiceApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(VentasServiceApplication.class);
    }
}
