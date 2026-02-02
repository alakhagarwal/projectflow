package com.projectmanagement.project_management_system.Repository;

import com.projectmanagement.project_management_system.Entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project,Long> {

    List<Project> findByOrganizationId(Long organizationId);
}
