package com.projectmanagement.project_management_system.Controller;

import com.projectmanagement.project_management_system.DTO.TaskCreateDTO;
import com.projectmanagement.project_management_system.DTO.TaskResponseDTO;
import com.projectmanagement.project_management_system.Service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/create/{projId}")
    public ResponseEntity<TaskResponseDTO> createTask(@RequestBody @Valid TaskCreateDTO taskCreateDTO, @PathVariable Long projId,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponseDTO taskResponseDTO = taskService.createTask(taskCreateDTO, userDetails.getUsername(), projId);
        return ResponseEntity.status(HttpStatus.CREATED).body(taskResponseDTO);
    }

//    @GetMapping("/fetch/{orgID}")
//    public ResponseEntity<?> getTasksByOrganization(@PathVariable Long orgID, @AuthenticationPrincipal UserDetails userDetails) {
//        List<TaskResponseDTO> taskResponseDTOS = taskService.getTasksByOrganization(orgID, userDetails.getUsername());
//        return ResponseEntity.ok(taskResponseDTOS);
//    }

    @GetMapping("/fetch/{projID}")
    public ResponseEntity<?> getTasksByProject(@PathVariable Long projID, @AuthenticationPrincipal UserDetails userDetails) {
        List<TaskResponseDTO> taskResponseDTOS = taskService.getTasksByProject(projID, userDetails.getUsername());
        return ResponseEntity.ok(taskResponseDTOS);
    }


}
