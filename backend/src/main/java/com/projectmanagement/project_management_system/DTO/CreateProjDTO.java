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
public class CreateProjDTO {

    @NotNull
    private Long organizationId;

    @NotBlank
    @NotNull
    private String name;

    private String description;

    private ProjectStatus projectStatus;

    private ProjectPriority projectPriority;


    @NotNull
    private LocalDate startDate;


    @NotNull
    private LocalDate endDate;


    @NotNull
    private String teamLeadEmail;
}
