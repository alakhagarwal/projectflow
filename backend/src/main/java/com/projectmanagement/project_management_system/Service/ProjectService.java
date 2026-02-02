package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.CreateProjDTO;
import com.projectmanagement.project_management_system.DTO.ProjResponse;
import com.projectmanagement.project_management_system.Entity.Organization;
import com.projectmanagement.project_management_system.Entity.Project;
import com.projectmanagement.project_management_system.Entity.ProjectMember;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import com.projectmanagement.project_management_system.Enums.ProjectRole;
import com.projectmanagement.project_management_system.Exception.InvalidRequestException;
import com.projectmanagement.project_management_system.Exception.ResourceNotFoundException;
import com.projectmanagement.project_management_system.Exception.UnauthorizedException;
import com.projectmanagement.project_management_system.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    @Transactional
    public ProjResponse save(CreateProjDTO createProjDTO, String creatorEmail) {

        // 1. Date validation
        if (createProjDTO.getEndDate().isBefore(createProjDTO.getStartDate())) {
            throw new InvalidRequestException("End date must be after start date");
        }

        if (createProjDTO.getStartDate().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Start date cannot be in the past");
        }

        // 2. Fetch creator
        User createdBy = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", creatorEmail));

        // 3. Fetch organization
        Organization organization = organizationRepository.findById(createProjDTO.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", createProjDTO.getOrganizationId()));

        // 4. Check if creator is an ADMIN of the organization
        organizationMemberRepository
                .findByUserIdAndOrganizationIdAndOrganizationRole(
                        createdBy.getId(),
                        organization.getId(),
                        OrganizationRole.ADMIN
                )
                .orElseThrow(() -> new UnauthorizedException("Only organization admins can create projects"));

        // 5. Fetch team lead
        User teamLead = userRepository.findByEmail(createProjDTO.getTeamLeadEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", createProjDTO.getTeamLeadEmail()));

        // 6. Check if team lead is a member of the organization
        organizationMemberRepository
                .findByUserIdAndOrganizationId(teamLead.getId(), organization.getId())
                .orElseThrow(() -> new InvalidRequestException("Team lead must be a member of the organization"));

        // 7. Create and save project
        Project project = new Project();
        project.setName(createProjDTO.getName());
        project.setDescription(createProjDTO.getDescription());
        project.setCreatedBy(createdBy);
        project.setProjectStatus(createProjDTO.getProjectStatus());
        project.setProjectPriority(createProjDTO.getProjectPriority());
        project.setOrganization(organization);
        project.setStartDate(createProjDTO.getStartDate());
        project.setEndDate(createProjDTO.getEndDate());
        project.setTeamLead(teamLead);

        Project savedProject = projectRepository.save(project);

        // 8. Add team lead as project member
        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(savedProject);
        projectMember.setProjectRole(ProjectRole.LEAD);
        projectMember.setUser(teamLead);

        projectMemberRepository.save(projectMember);


        ProjResponse projResponse = new ProjResponse(
                savedProject.getId(),
                savedProject.getName(),
                savedProject.getDescription(),
                savedProject.getOrganization().getId(),
                savedProject.getCreatedBy().getEmail(),
                savedProject.getTeamLead().getEmail(),
                savedProject.getProjectStatus(),
                savedProject.getProjectPriority(),
                savedProject.getStartDate(),
                savedProject.getEndDate()
        );

        return projResponse;

    }

    public List<ProjResponse> getAllProjects(Long organizationId) {
        List<Project> projects = projectRepository.findByOrganizationId(organizationId);
        return projects.stream().map(project -> new ProjResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOrganization().getId(),
                project.getCreatedBy().getEmail(),
                project.getTeamLead().getEmail(),
                project.getProjectStatus(),
                project.getProjectPriority(),
                project.getStartDate(),
                project.getEndDate()
        )).toList();
    }
}
