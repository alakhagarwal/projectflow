package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.AddProjectMemberRequestDTO;
import com.projectmanagement.project_management_system.DTO.CreateProjDTO;
import com.projectmanagement.project_management_system.DTO.ProjectMemberResponseDTO;
import com.projectmanagement.project_management_system.DTO.ProjResponse;
import com.projectmanagement.project_management_system.DTO.UpdateProjDTO;
import com.projectmanagement.project_management_system.Entity.*;
import com.projectmanagement.project_management_system.Enums.MemberStatus;
import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import com.projectmanagement.project_management_system.Enums.ProjectRole;
import com.projectmanagement.project_management_system.Exception.InvalidRequestException;
import com.projectmanagement.project_management_system.Exception.ResourceNotFoundException;
import com.projectmanagement.project_management_system.Exception.UnauthorizedException;
import com.projectmanagement.project_management_system.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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


        return new ProjResponse(
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

    }

    public List<ProjResponse> getAllProjects(Long organizationId, String requestedByEmail) {
        User requestedBy = userRepository.findByEmail(requestedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", requestedByEmail));

        OrganizationMember orgMembership = organizationMemberRepository
                .findByUserIdAndOrganizationIdAndMemberStatus(
                        requestedBy.getId(),
                        organizationId,
                        MemberStatus.ACTIVE
                )
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this organization"));

        if(orgMembership.getOrganizationRole() == OrganizationRole.ADMIN) {
            // If user is an admin, return all projects in the organization
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

       List <ProjectMember> projectMemberships = projectMemberRepository.findByUserId(requestedBy.getId());

        // fetch the projects using projID fetched in projectMemberships
        Set<Long> seenProjectIds = new HashSet<>();
        return projectMemberships.stream()
                .filter(pm -> pm.getProject().getOrganization().getId().equals(organizationId))
                .filter(pm -> seenProjectIds.add(pm.getProject().getId()))
                .map(pm -> {
                    Project project = pm.getProject();
                    return new ProjResponse(
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
                    );
                }).toList();
    }

    @Transactional
    public ProjectMemberResponseDTO addMemberToProject(Long projectId, AddProjectMemberRequestDTO requestDTO, String requestedByEmail) {
        User requestedBy = userRepository.findByEmail(requestedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", requestedByEmail));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        boolean isOrgAdmin = organizationMemberRepository
                .findByUserIdAndOrganizationIdAndOrganizationRole(
                        requestedBy.getId(),
                        project.getOrganization().getId(),
                        OrganizationRole.ADMIN
                )
                .isPresent();

        boolean isProjectLead = projectMemberRepository
                .existsByUserIdAndProjectIdAndProjectRole(requestedBy.getId(), projectId, ProjectRole.LEAD);

        if (!isOrgAdmin && !isProjectLead) {
            throw new UnauthorizedException("Only organization admins or project leads can add members to a project");
        }

        User userToAdd = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", requestDTO.getEmail()));

        OrganizationMember orgMembership = organizationMemberRepository
                .findByUserIdAndOrganizationId(userToAdd.getId(), project.getOrganization().getId())
                .orElseThrow(() -> new InvalidRequestException("User is not a member of this organization"));

        if (orgMembership.getMemberStatus() != MemberStatus.ACTIVE) {
            throw new InvalidRequestException("User must be an active member of the organization");
        }

        if (projectMemberRepository.existsByUserIdAndProjectId(userToAdd.getId(), projectId)) {
            throw new InvalidRequestException("User is already a member of this project");
        }

        ProjectRole roleToAssign = requestDTO.getProjectRole() != null ? requestDTO.getProjectRole() : ProjectRole.MEMBER;

        // Prevent privilege escalation by restricting LEAD assignment to org admins.
        if (roleToAssign == ProjectRole.LEAD && !isOrgAdmin) {
            throw new UnauthorizedException("Only organization admins can assign LEAD role");
        }

        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(project);
        projectMember.setUser(userToAdd);
        projectMember.setProjectRole(roleToAssign);

        ProjectMember savedMember = projectMemberRepository.save(projectMember);

        String memberName = userToAdd.getFirstName() + " " + userToAdd.getLastName();
        return new ProjectMemberResponseDTO(
                project.getId(),
                project.getName(),
                savedMember.getUser().getId(),
                savedMember.getUser().getEmail(),
                memberName.trim(),
                savedMember.getProjectRole()
        );
    }

    public List<ProjectMemberResponseDTO> getProjectMembers(Long projectId, UserDetails requstedByUser) {
        User requestedBy = userRepository.findByEmail(requstedByUser.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", requstedByUser.getUsername()));

        // 1. Verify project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        boolean isProjectMember = projectMemberRepository
                .existsByUserIdAndProjectId(requestedBy.getId(), projectId);

        if (!isProjectMember) {
            throw new UnauthorizedException("You are not a member of this project");
        }

        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return members.stream().map(member -> {
            User user = member.getUser();
            String memberName = user.getFirstName() + " " + user.getLastName();
            return new ProjectMemberResponseDTO(
                    project.getId(),
                    project.getName(),
                    user.getId(),
                    user.getEmail(),
                    memberName.trim(),
                    member.getProjectRole()
            );
        }).toList();
    }

    @Transactional
    public ProjResponse updateProject(Long projectId, UpdateProjDTO requestDTO, String requestedByEmail) {
        User requestedBy = userRepository.findByEmail(requestedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", requestedByEmail));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        boolean isActiveOrgAdmin = organizationMemberRepository
                .findByUserIdAndOrganizationIdAndMemberStatus(
                        requestedBy.getId(),
                        project.getOrganization().getId(),
                        MemberStatus.ACTIVE
                )
                .map(orgMembership -> orgMembership.getOrganizationRole() == OrganizationRole.ADMIN)
                .orElse(false);

        boolean isProjectLead = projectMemberRepository
                .existsByUserIdAndProjectIdAndProjectRole(requestedBy.getId(), projectId, ProjectRole.LEAD);

        if (!isActiveOrgAdmin && !isProjectLead) {
            throw new UnauthorizedException("Only organization admins or project leads can update this project");
        }

        if (requestDTO.getEndDate().isBefore(requestDTO.getStartDate())) {
            throw new InvalidRequestException("End date must be after start date");
        }

        project.setName(requestDTO.getName());
        project.setDescription(requestDTO.getDescription());
        project.setProjectStatus(requestDTO.getProjectStatus());
        project.setProjectPriority(requestDTO.getProjectPriority());
        project.setStartDate(requestDTO.getStartDate());
        project.setEndDate(requestDTO.getEndDate());

        Project updatedProject = projectRepository.save(project);

        return new ProjResponse(
                updatedProject.getId(),
                updatedProject.getName(),
                updatedProject.getDescription(),
                updatedProject.getOrganization().getId(),
                updatedProject.getCreatedBy().getEmail(),
                updatedProject.getTeamLead().getEmail(),
                updatedProject.getProjectStatus(),
                updatedProject.getProjectPriority(),
                updatedProject.getStartDate(),
                updatedProject.getEndDate()
        );
    }
}
