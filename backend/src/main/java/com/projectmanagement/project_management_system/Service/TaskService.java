package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.TaskCreateDTO;
import com.projectmanagement.project_management_system.DTO.TaskResponseDTO;
import com.projectmanagement.project_management_system.Entity.Project;
import com.projectmanagement.project_management_system.Entity.Task;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Enums.MemberStatus;
import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import com.projectmanagement.project_management_system.Exception.InvalidRequestException;
import com.projectmanagement.project_management_system.Exception.ResourceNotFoundException;
import com.projectmanagement.project_management_system.Exception.UnauthorizedException;
import com.projectmanagement.project_management_system.Repository.OrganizationMemberRepository;
import com.projectmanagement.project_management_system.Repository.OrganizationRepository;
import com.projectmanagement.project_management_system.Repository.ProjectMemberRepository;
import com.projectmanagement.project_management_system.Repository.ProjectRepository;
import com.projectmanagement.project_management_system.Repository.TaskRepository;
import com.projectmanagement.project_management_system.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final EmailService emailService;

    @Transactional
    public TaskResponseDTO createTask(TaskCreateDTO taskCreateDTO, String createdByEmail, Long projectId) {
        Task task = new Task();

        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        User assignedTo = userRepository.findByEmail(taskCreateDTO.getAssignedToEmail())
                .orElseThrow(() -> new InvalidRequestException("Assigned user not found"));

        Project project = projectRepository.findById(projectId).
                orElseThrow(() -> new InvalidRequestException("Project not found"));

        if (!projectMemberRepository.existsByUserIdAndProjectId(createdBy.getId(), projectId)) {
            throw new UnauthorizedException("You are not a member of this project");
        }

        task.setTitle(taskCreateDTO.getTitle());
        task.setDescription(taskCreateDTO.getDescription());
        task.setCreatedBy(createdBy);
        task.setAssignedTo(assignedTo);
        task.setDueDate(taskCreateDTO.getDueDate());
        task.setTaskType(taskCreateDTO.getTaskType());
        task.setTaskPriority(taskCreateDTO.getTaskPriority());
        task.setTaskStatus(taskCreateDTO.getTaskStatus());
        task.setProject(project);

        task = taskRepository.save(task);

        String assignedToName = assignedTo.getFirstName() + " " + assignedTo.getLastName();
        String createdByName = createdBy.getFirstName() + " " + createdBy.getLastName();
        Long savedTaskId = task.getId();
        String savedTaskTitle = task.getTitle();
        String savedTaskDescription = task.getDescription();
        java.time.LocalDate savedTaskDueDate = task.getDueDate();

        // Best-effort notification: send email in background so SMTP latency does not block API response.
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendTaskAssignedEmail(
                        assignedTo.getEmail(),
                        assignedToName.trim(),
                        createdByName.trim(),
                        project.getName(),
                        project.getId(),
                        savedTaskId,
                        savedTaskTitle,
                        savedTaskDescription,
                        savedTaskDueDate
                );
            } catch (Exception ex) {
                System.err.println("Task created but assignment email could not be sent to: " + assignedTo.getEmail());
            }
        });

        TaskResponseDTO responseDTO = new TaskResponseDTO();
        responseDTO.setId(task.getId());
        responseDTO.setTitle(task.getTitle());
        responseDTO.setDescription(task.getDescription());
        responseDTO.setProjectId(task.getProject().getId());
        responseDTO.setAssignedToEmail(task.getAssignedTo().getEmail());
        responseDTO.setCreatedByEmail(task.getCreatedBy().getEmail());
        responseDTO.setDueDate(task.getDueDate());
        responseDTO.setTaskType(task.getTaskType());
        responseDTO.setTaskPriority(task.getTaskPriority());
        responseDTO.setTaskStatus(task.getTaskStatus());

        responseDTO.setProjectName(project.getName());
        responseDTO.setAssignedToName(assignedToName.trim());
        responseDTO.setCreatedByName(createdByName.trim());
        responseDTO.setCreatedAt(task.getCreatedAt());

        return responseDTO;
    }

    public List<TaskResponseDTO> getTasksByProject(Long projID, String username) {

        Project project = projectRepository.findById(projID)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isProjectMember = projectMemberRepository.existsByUserIdAndProjectId(user.getId(), projID);

        boolean isActiveOrgAdmin = organizationMemberRepository
                .findByUserIdAndOrganizationIdAndMemberStatus(
                        user.getId(),
                        project.getOrganization().getId(),
                        MemberStatus.ACTIVE
                )
                .map(orgMember -> orgMember.getOrganizationRole() == OrganizationRole.ADMIN)
                .orElse(false);

        if (!isProjectMember && !isActiveOrgAdmin) {
            throw new UnauthorizedException("You are not a member of this project");
        }

        List<Task> tasks = taskRepository.findByProjectId(projID);

        return tasks.stream().map(task -> {
            TaskResponseDTO responseDTO = new TaskResponseDTO();
            responseDTO.setId(task.getId());
            responseDTO.setTitle(task.getTitle());
            responseDTO.setDescription(task.getDescription());
            responseDTO.setProjectId(task.getProject().getId());
            responseDTO.setAssignedToEmail(task.getAssignedTo().getEmail());
            responseDTO.setCreatedByEmail(task.getCreatedBy().getEmail());
            responseDTO.setDueDate(task.getDueDate());
            responseDTO.setTaskType(task.getTaskType());
            responseDTO.setTaskPriority(task.getTaskPriority());
            responseDTO.setTaskStatus(task.getTaskStatus());

            responseDTO.setProjectName(task.getProject().getName());
            responseDTO.setAssignedToName(task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName());
            responseDTO.setCreatedByName(task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName());
            responseDTO.setCreatedAt(task.getCreatedAt());

            return responseDTO;
        }).toList();

    }

    public List<TaskResponseDTO> getAssignedTasksInOrganization(Long orgID, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        organizationRepository.findById(orgID)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        organizationMemberRepository
                .findByUserIdAndOrganizationIdAndMemberStatus(user.getId(), orgID, MemberStatus.ACTIVE)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this organization"));

        List<Project> projectsInOrg = projectRepository.findByOrganizationId(orgID);

        List<TaskResponseDTO> tasks = projectsInOrg.stream()
                .flatMap(project -> taskRepository.findByProjectIdAndAssignedToId(project.getId(), user.getId()).stream())
                .map(task -> {
                    TaskResponseDTO responseDTO = new TaskResponseDTO();
                    responseDTO.setId(task.getId());
                    responseDTO.setTitle(task.getTitle());
                    responseDTO.setDescription(task.getDescription());
                    responseDTO.setProjectId(task.getProject().getId());
                    responseDTO.setProjectName(task.getProject().getName());
                    responseDTO.setAssignedToEmail(task.getAssignedTo().getEmail());
                    responseDTO.setAssignedToName(task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName());
                    responseDTO.setCreatedByEmail(task.getCreatedBy().getEmail());
                    responseDTO.setCreatedByName(task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName());
                    responseDTO.setDueDate(task.getDueDate());
                    responseDTO.setTaskType(task.getTaskType());
                    responseDTO.setTaskPriority(task.getTaskPriority());
                    responseDTO.setTaskStatus(task.getTaskStatus());
                    responseDTO.setCreatedAt(task.getCreatedAt());
                    return responseDTO;
                })
                .toList();

        return tasks;
    }
}
