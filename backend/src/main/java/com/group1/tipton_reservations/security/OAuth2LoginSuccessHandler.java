package com.group1.tipton_reservations.security;

import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}") 
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        // String name = oAuth2User.getAttribute("name"); // In case we end up adding names from here

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            //random password since it won't be used here
            User newUser = new User(email, UUID.randomUUID().toString());
            
            return userRepository.save(newUser);
        });

        String token = jwtUtils.generateTokenFromUser(user);


        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth-success")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}