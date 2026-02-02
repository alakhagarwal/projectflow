package com.projectmanagement.project_management_system.Controller;

import com.projectmanagement.project_management_system.DTO.CreateProjDTO;
import com.projectmanagement.project_management_system.DTO.ProjResponse;
import com.projectmanagement.project_management_system.Service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/proj")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/create")
    public ResponseEntity<ProjResponse> createProject(@RequestBody @Valid CreateProjDTO createProjDTO,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        ProjResponse projResponse = projectService.save(createProjDTO, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(projResponse);
    }

    @GetMapping("/getAll/{organizationId}")
    public ResponseEntity<?> getAllProjects(@PathVariable Long organizationId) {
        return ResponseEntity.status(HttpStatus.OK).body(projectService.getAllProjects(organizationId));

    }
}
