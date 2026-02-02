package com.projectmanagement.project_management_system.Repository;

import com.projectmanagement.project_management_system.Entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    boolean existsBySlug(String slug);

    // Find organizations created by a user with the given email
    @Query("SELECT o FROM Organization o WHERE o.createdBy.email = :email")
    List<Organization> findByCreatorEmail(@Param("email") String email);

    @Query("SELECT o FROM Organization o WHERE o.createdBy.id = :userId")
    Organization findByCreatedById(@Param("userId") Long id);



}
