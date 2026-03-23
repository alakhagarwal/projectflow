package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.ProjectRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddProjectMemberRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    // If role is not provided, service will default it to MEMBER.
    private ProjectRole projectRole;
}

