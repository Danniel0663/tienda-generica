package com.tiendagenerica.portfolio;

import com.tiendagenerica.api.DemoApplication;
import com.tiendagenerica.report.controller.ReportController;
import com.tiendagenerica.report.service.ReportQueryService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import javax.sql.DataSource;

@Configuration
@Import({DemoApplication.class, ReportController.class, ReportQueryService.class})
public class PortfolioApplication {
    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }

    @org.springframework.context.annotation.Profile("!postgres")
    @Bean
    ApplicationRunner seedDemo(DataSource dataSource) {
        return args -> {
            var seed = new ResourceDatabasePopulator(new ClassPathResource("demo/demo-portafolio.sql"));
            seed.setSqlScriptEncoding("UTF-8");
            seed.execute(dataSource);
        };
    }
}
