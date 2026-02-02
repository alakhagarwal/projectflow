package com.projectmanagement.project_management_system.DTO;

import com.projectmanagement.project_management_system.Enums.MemberStatus;
import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMemberDTO {

    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Long organizationId;
    private String organizationName;
    private OrganizationRole organizationRole;
    private MemberStatus memberStatus;
    private Instant inviteExpiresAt;

}
