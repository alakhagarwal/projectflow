package com.projectmanagement.project_management_system.Repository;

import com.projectmanagement.project_management_system.Entity.Organization;
import com.projectmanagement.project_management_system.Entity.OrganizationMember;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember,Long> {

    // Check if user is a member of organization
    Optional<OrganizationMember> findByUserIdAndOrganizationId(Long userId, Long organizationId);

    // Check if user has specific role in organization
    Optional<OrganizationMember> findByUserIdAndOrganizationIdAndOrganizationRole(
            Long userId,
            Long organizationId,
            OrganizationRole organizationRole
    );

    boolean existsByOrganizationAndUser(Organization organization, User user);

    @Query("SELECT om.organizationRole FROM OrganizationMember om WHERE om.organization = :organization AND om.user = :user")
    Optional<OrganizationRole> findRoleByOrganizationAndUser(@Param("organization") Organization organization, @Param("user") User user);

    Optional<OrganizationMember> findByInviteToken(String inviteToken);

    Optional<OrganizationMember> findByUserAndOrganization(User invitedUser, Organization organization);

    // Find all organizations where user is a member (both INVITED and ACTIVE)
    @Query("SELECT om FROM OrganizationMember om WHERE om.user = :user")
    List<OrganizationMember> findByUser(@Param("user") User user);

    // Find all members of an organization
    List<OrganizationMember> findByOrganizationId(Long organizationId);

}
