package com.ai.recruitment.controller;

import com.ai.recruitment.model.ERole;
import com.ai.recruitment.model.Role;
import com.ai.recruitment.model.User;
import com.ai.recruitment.payload.request.LoginRequest;
import com.ai.recruitment.payload.request.SignupRequest;
import com.ai.recruitment.payload.response.JwtResponse;
import com.ai.recruitment.payload.response.MessageResponse;
import com.ai.recruitment.repository.RoleRepository;
import com.ai.recruitment.repository.UserRepository;
import com.ai.recruitment.security.jwt.JwtUtils;
import com.ai.recruitment.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .active(true)
                .build();

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role candidateRole = roleRepository.findByName(ERole.ROLE_CANDIDATE)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_CANDIDATE).build()));
            roles.add(candidateRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).build()));
                        roles.add(adminRole);
                        break;
                    case "recruiter":
                        Role recruiterRole = roleRepository.findByName(ERole.ROLE_RECRUITER)
                                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_RECRUITER).build()));
                        roles.add(recruiterRole);
                        break;
                    default:
                        Role candidateRole = roleRepository.findByName(ERole.ROLE_CANDIDATE)
                                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_CANDIDATE).build()));
                        roles.add(candidateRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
