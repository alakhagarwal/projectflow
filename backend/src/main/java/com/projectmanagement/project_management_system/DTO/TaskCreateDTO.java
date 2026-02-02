package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.TaskPriority;
import com.projectmanagement.project_management_system.Enums.TaskStatus;
import com.projectmanagement.project_management_system.Enums.TaskType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskCreateDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @Email(message = "Invalid email format")
    private String assignedToEmail;

    @NotNull(message = "Task type is required")
    private TaskType taskType;

    @NotNull(message = "Task priority is required")
    private TaskPriority taskPriority;

    @NotNull(message = "Task status is required")
    private TaskStatus taskStatus;

    @Future(message = "Due date must be in the future")
    private LocalDate dueDate;

}
