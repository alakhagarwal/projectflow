package com.projectmanagement.project_management_system.Controller;

import com.projectmanagement.project_management_system.DTO.AddProjectMemberRequestDTO;
import com.projectmanagement.project_management_system.DTO.ProjectMemberResponseDTO;
import com.projectmanagement.project_management_system.DTO.CreateProjDTO;
import com.projectmanagement.project_management_system.DTO.ProjResponse;
import com.projectmanagement.project_management_system.DTO.UpdateProjDTO;
import com.projectmanagement.project_management_system.Service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<?> getAllProjects(@PathVariable Long organizationId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.OK).body(projectService.getAllProjects(organizationId, userDetails.getUsername()));

    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberResponseDTO> addMemberToProject(
            @PathVariable Long projectId,
            @RequestBody @Valid AddProjectMemberRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ProjectMemberResponseDTO response = projectService.addMemberToProject(projectId, requestDTO, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjResponse> updateProject(
            @PathVariable Long projectId,
            @RequestBody @Valid UpdateProjDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ProjResponse response = projectService.updateProject(projectId, requestDTO, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<?> getProjectMembers(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.OK).body(projectService.getProjectMembers(projectId, userDetails));
    }

}
