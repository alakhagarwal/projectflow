package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InviteRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;


    @NotNull(message = "Role is required")
    private OrganizationRole role;
}
