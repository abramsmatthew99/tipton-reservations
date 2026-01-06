package com.group1.tipton_reservations.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.group1.tipton_reservations.security.AuthEntryPointJwt;
import com.group1.tipton_reservations.security.AuthTokenFilter;
import com.group1.tipton_reservations.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userService;
    private final AuthEntryPointJwt unauthorizedHandler; 
    private final AuthTokenFilter authTokenFilter;       
    public SecurityConfig(CustomUserDetailsService userService, 
                          AuthEntryPointJwt unauthorizedHandler,      
                          AuthTokenFilter authTokenFilter) {
        this.userService = userService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public AuthenticationManager authManager(HttpSecurity http, PasswordEncoder encoder) throws Exception {
        AuthenticationManagerBuilder auth = http.getSharedObject(AuthenticationManagerBuilder.class);
        auth.userDetailsService(userService).passwordEncoder(encoder);
        return auth.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler)) 
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/payments/**").permitAll() // TODO: Restrict to authenticated users
                .requestMatchers("/bookings/**").permitAll() // TODO: Restrict to authenticated users
                .anyRequest().authenticated()
            );

        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // TODO: Update for s3 bucket
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://tipton-frontend-app.s3-website-us-east-1.amazonaws.com")); 
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}