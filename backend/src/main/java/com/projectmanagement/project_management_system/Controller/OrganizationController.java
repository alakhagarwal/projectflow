package com.projectmanagement.project_management_system.Controller;

import com.projectmanagement.project_management_system.DTO.InviteRequestDTO;
import com.projectmanagement.project_management_system.DTO.OrganizationMemberDTO;
import com.projectmanagement.project_management_system.DTO.OrgResponse;
import com.projectmanagement.project_management_system.Service.OrganizationMemberService;
import com.projectmanagement.project_management_system.Service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/org")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationMemberService organizationMemberService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestParam("name") String name,
            @RequestParam("slug") String slug,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        OrgResponse orgResponse = organizationService.createOrganization(name, slug, logo, userDetails.getUsername());
        return ResponseEntity.ok(orgResponse);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllByEmail(@AuthenticationPrincipal UserDetails userDetails)  {
        return ResponseEntity.ok(organizationService.getAllOrganizationsbyEmail(userDetails.getUsername()));
    }

    @PostMapping("/{orgId}/invite")
    public ResponseEntity<?> inviteMember(
            @PathVariable Long orgId,
            @RequestBody InviteRequestDTO memberAddDTO,
            @AuthenticationPrincipal UserDetails userDetails){
        organizationService.inviteMember(userDetails.getUsername(),orgId, memberAddDTO);
        return ResponseEntity.ok("Invitation sent successfully");
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<?> acceptInvitation(
            @RequestParam String token
    ) {
        String userEmail = organizationService.acceptInvitation(token);

        Map<String, String> response = new HashMap<>();
        response.put("email", userEmail);
        response.put("message", "Invitation accepted successfully");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<List<OrganizationMemberDTO>> getAllMembers(
            @PathVariable Long orgId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<OrganizationMemberDTO> members = organizationMemberService.getAllMembersByOrganizationId(orgId, userDetails.getUsername());
        return ResponseEntity.ok(members);
    }

}
