package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.TaskPriority;
import com.projectmanagement.project_management_system.Enums.TaskStatus;
import com.projectmanagement.project_management_system.Enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Long projectId;
    private String projectName;
    private String assignedToEmail;
    private String assignedToName;
    private String createdByEmail;
    private String createdByName;
    private TaskType taskType;
    private TaskPriority taskPriority;
    private TaskStatus taskStatus;
    private LocalDate dueDate;
    private Instant createdAt;
}
