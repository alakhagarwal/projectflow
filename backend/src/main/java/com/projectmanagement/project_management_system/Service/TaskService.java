package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.CreateProjDTO;
import com.projectmanagement.project_management_system.DTO.ProjResponse;
import com.projectmanagement.project_management_system.DTO.TaskCreateDTO;
import com.projectmanagement.project_management_system.DTO.TaskResponseDTO;
import com.projectmanagement.project_management_system.Entity.Project;
import com.projectmanagement.project_management_system.Entity.Task;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Exception.InvalidRequestException;
import com.projectmanagement.project_management_system.Exception.ResourceNotFoundException;
import com.projectmanagement.project_management_system.Exception.UnauthorizedException;
import com.projectmanagement.project_management_system.Repository.ProjectMemberRepository;
import com.projectmanagement.project_management_system.Repository.ProjectRepository;
import com.projectmanagement.project_management_system.Repository.TaskRepository;
import com.projectmanagement.project_management_system.Repository.UserRepository;
import jakarta.transaction.TransactionScoped;
import jakarta.transaction.Transactional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectService projectService;

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
        responseDTO.setAssignedToName(assignedTo.getFirstName() + " " + assignedTo.getLastName());
        responseDTO.setCreatedByName(createdBy.getFirstName() + " " + createdBy.getLastName());
        responseDTO.setCreatedAt(task.getCreatedAt());

        return responseDTO;
    }


    public List<TaskResponseDTO> getTaskById(Long orgID, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

       List <ProjResponse> projects = projectService.getAllProjects(orgID);

        List<TaskResponseDTO> taskResponseDTOS = taskRepository.findBy(orgID).stream().map(task -> {
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

        return taskResponseDTOS;


    }
}
