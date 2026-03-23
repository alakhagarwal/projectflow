package com.projectmanagement.project_management_system.Repository;

import com.projectmanagement.project_management_system.Entity.Task;
import com.projectmanagement.project_management_system.Enums.TaskPriority;
import com.projectmanagement.project_management_system.Enums.TaskStatus;
import com.projectmanagement.project_management_system.Enums.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByCreatedById(Long userId);
    List<Task> findByProjectIdAndTaskStatus(Long projectId, TaskStatus taskStatus);
    List<Task> findByProjectIdAndTaskPriority(Long projectId, TaskPriority taskPriority);
    List<Task> findByProjectIdAndTaskType(Long projectId, TaskType taskType);
    List<Task> findByProjectIdAndAssignedToId(Long projectId, Long userId);
    List<Task> findByAssignedToIdAndTaskStatus(Long userId, TaskStatus taskStatus);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :currentDate AND t.taskStatus != 'COMPLETED'")
    List<Task> findOverdueTasks(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findTasksByDueDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
            "AND (:status IS NULL OR t.taskStatus = :status) " +
            "AND (:priority IS NULL OR t.taskPriority = :priority) " +
            "AND (:type IS NULL OR t.taskType = :type) " +
            "AND (:assignedToId IS NULL OR t.assignedTo.id = :assignedToId)")
    List<Task> findTasksByFilters(@Param("projectId") Long projectId,
                                   @Param("status") TaskStatus status,
                                   @Param("priority") TaskPriority priority,
                                   @Param("type") TaskType type,
                                   @Param("assignedToId") Long assignedToId);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId " +
            "AND t.dueDate BETWEEN :startDate AND :endDate " +
            "AND t.taskStatus != 'COMPLETED' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasksForUser(@Param("userId") Long userId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.taskStatus = :status")
    Long countTasksByProjectAndStatus(@Param("projectId") Long projectId, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
            "AND t.taskPriority = 'HIGH' " +
            "AND t.taskStatus != 'COMPLETED' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findHighPriorityTasksByProject(@Param("projectId") Long projectId);

    boolean existsByIdAndProjectId(Long taskId, Long projectId);
}
