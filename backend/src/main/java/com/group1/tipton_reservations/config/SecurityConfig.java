package com.group1.tipton_reservations.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.group1.tipton_reservations.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userService;

    public SecurityConfig(CustomUserDetailsService service) {
        userService = service;
    }

    //Password Encoder -- goes here for some reason that I am unsure of exactly
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authManager(HttpSecurity http, PasswordEncoder encoder) throws Exception {
        AuthenticationManagerBuilder auth = http.getSharedObject(AuthenticationManagerBuilder.class);
        //Chain all the services we need to authenticate (UserDetailsService and PasswordEncoder)
        auth.userDetailsService(userService).passwordEncoder(encoder);
        return auth.build();
    }

    @Bean 
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() //PERMIT HTTP FROM ANYWHERE
            );
        return http.build();
    }
 

}