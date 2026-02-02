package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.ProjectPriority;
import com.projectmanagement.project_management_system.Enums.ProjectStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ProjResponse {

    private Long id;

    private String name;

    private String description;

    private Long organizationId;

    private String createdByEmail;

    private String teamLeadEmail;

    private ProjectStatus projectStatus;

    private ProjectPriority projectPriority;

    private LocalDate startDate;

    private LocalDate endDate;
}
