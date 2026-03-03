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

    // Find tasks by project
    List<Task> findByProjectId(Long projectId);

    // Find tasks by assigned user
    List<Task> findByAssignedToId(Long userId);

    // Find tasks by creator
    List<Task> findByCreatedById(Long userId);

    // Find tasks by project and status
    List<Task> findByProjectIdAndTaskStatus(Long projectId, TaskStatus taskStatus);

    // Find tasks by project and priority
    List<Task> findByProjectIdAndTaskPriority(Long projectId, TaskPriority taskPriority);

    // Find tasks by project and type
    List<Task> findByProjectIdAndTaskType(Long projectId, TaskType taskType);

    // Find tasks assigned to a user in a specific project
    List<Task> findByProjectIdAndAssignedToId(Long projectId, Long userId);

    // Find tasks by status and assigned user
    List<Task> findByAssignedToIdAndTaskStatus(Long userId, TaskStatus taskStatus);

    // Find overdue tasks
    @Query("SELECT t FROM Task t WHERE t.dueDate < :currentDate AND t.taskStatus != 'COMPLETED'")
    List<Task> findOverdueTasks(@Param("currentDate") LocalDate currentDate);

    // Find tasks due within a date range
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findTasksByDueDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find tasks by project and multiple filters
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

    // Find tasks assigned to user with upcoming due dates
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId " +
            "AND t.dueDate BETWEEN :startDate AND :endDate " +
            "AND t.taskStatus != 'COMPLETED' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasksForUser(@Param("userId") Long userId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    // Count tasks by project and status
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.taskStatus = :status")
    Long countTasksByProjectAndStatus(@Param("projectId") Long projectId, @Param("status") TaskStatus status);

    // Find high priority tasks in a project
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
            "AND t.taskPriority = 'HIGH' " +
            "AND t.taskStatus != 'COMPLETED' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findHighPriorityTasksByProject(@Param("projectId") Long projectId);

    // Check if task exists by id and project id
    boolean existsByIdAndProjectId(Long taskId, Long projectId);

    List<Task> findBy(Long orgID);
}
