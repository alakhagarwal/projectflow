package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.ProjectPriority;
import com.projectmanagement.project_management_system.Enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotNull
    private ProjectStatus projectStatus;

    @NotNull
    private ProjectPriority projectPriority;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}

