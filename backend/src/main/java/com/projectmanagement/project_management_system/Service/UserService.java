package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.RegisterRequestDTO;
import com.projectmanagement.project_management_system.DTO.UserResponseDTO;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Exception.DuplicateEmailException;
import com.projectmanagement.project_management_system.Repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("user not found with email: " + email));
    }

    public UserResponseDTO saveUser(RegisterRequestDTO requestDTO) {

        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new DuplicateEmailException(requestDTO.getEmail());
        }

        User user = new User();
        user.setEmail(requestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        user.setFirstName(requestDTO.getFirstName());
        user.setLastName(requestDTO.getLastName());
        User user1 = userRepository.save(user);
        return new UserResponseDTO(user1.getId(), user1.getEmail(), user1.getFirstName(), user1.getLastName());

    }


}
