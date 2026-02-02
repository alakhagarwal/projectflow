package com.projectmanagement.project_management_system.Configuration;

import com.projectmanagement.project_management_system.Filter.JWTAuthenticationFilter;
import com.projectmanagement.project_management_system.Filter.JwtValidationFilter;
import com.projectmanagement.project_management_system.Module.JWTAuthenticationProvider;
import com.projectmanagement.project_management_system.Module.JWTUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private JWTUtil jwtUtil;
    private UserDetailsService userDetailsService;
    private PasswordEncoder passwordEncoder;

    public SecurityConfig(JWTUtil jwtUtil, UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public JWTAuthenticationProvider jwtAuthenticationProvider() {
        return new JWTAuthenticationProvider(jwtUtil, userDetailsService);
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean

    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationManager authenticationManager,
            JWTUtil jwtUtil
    ) throws Exception {

        // Authentication filter responsible for login
        JWTAuthenticationFilter jwtAuthFilter =
                new JWTAuthenticationFilter(authenticationManager, jwtUtil);

        JwtValidationFilter jwtValidationFilter =
                new JwtValidationFilter(authenticationManager);


        http
                .cors(cors -> cors.configure(http)) // Enable CORS with the CorsConfig
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/register", "/generate-token","/upload","/download/**","/org/accept-invite").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(
                        jwtAuthFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class
                )
                .addFilterAfter(
                        jwtValidationFilter,
                        JWTAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(
                Arrays.asList(daoAuthenticationProvider(),
                        jwtAuthenticationProvider())
        );
    }
}
