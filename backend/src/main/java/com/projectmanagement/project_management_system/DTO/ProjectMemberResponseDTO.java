package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.ProjectRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProjectMemberResponseDTO {

    private Long projectId;
    private String projectName;
    private Long userId;
    private String userEmail;
    private String memberName;
    private ProjectRole projectRole;
}

