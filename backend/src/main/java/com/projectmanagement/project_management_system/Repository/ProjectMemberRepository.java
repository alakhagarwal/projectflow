package com.projectmanagement.project_management_system.Repository;

import com.projectmanagement.project_management_system.Entity.OrganizationMember;
import com.projectmanagement.project_management_system.Entity.ProjectMember;
import com.projectmanagement.project_management_system.Enums.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    // Find project member by user and project
    Optional<ProjectMember> findByUserIdAndProjectId(Long userId, Long projectId);

    // Find all members of a project
    List<ProjectMember> findByProjectId(Long projectId);

    // Find all projects a user is a member of
    List<ProjectMember> findByUserId(Long userId);

    // Check if user is a member of a project
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);

    // Find project member by user, project, and role
    Optional<ProjectMember> findByUserIdAndProjectIdAndProjectRole(Long userId, Long projectId, ProjectRole projectRole);

    // Check if user has a specific role in a project
    boolean existsByUserIdAndProjectIdAndProjectRole(Long userId, Long projectId, ProjectRole projectRole);
}


