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
    Optional<ProjectMember> findByUserIdAndProjectId(Long userId, Long projectId);

    List<ProjectMember> findByProjectId(Long projectId);

    List<ProjectMember> findByUserId(Long userId);

    boolean existsByUserIdAndProjectId(Long userId, Long projectId);

    Optional<ProjectMember> findByUserIdAndProjectIdAndProjectRole(Long userId, Long projectId, ProjectRole projectRole);

    boolean existsByUserIdAndProjectIdAndProjectRole(Long userId, Long projectId, ProjectRole projectRole);
}


