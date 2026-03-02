package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.OrganizationMemberDTO;
import com.projectmanagement.project_management_system.Entity.Organization;
import com.projectmanagement.project_management_system.Entity.OrganizationMember;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Enums.MemberStatus;
import com.projectmanagement.project_management_system.Exception.ResourceNotFoundException;
import com.projectmanagement.project_management_system.Exception.UnauthorizedException;
import com.projectmanagement.project_management_system.Repository.OrganizationMemberRepository;
import com.projectmanagement.project_management_system.Repository.OrganizationRepository;
import com.projectmanagement.project_management_system.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationMemberService {

    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public List<OrganizationMemberDTO> getAllMembersByOrganizationId(Long organizationId, String userEmail) {

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", organizationId));


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));


        OrganizationMember requesterMembership = organizationMemberRepository
                .findByUserAndOrganization(user, organization)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this organization"));


        if (requesterMembership.getMemberStatus() != MemberStatus.ACTIVE) {
            throw new UnauthorizedException("Your membership is not active");
        }


        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(organizationId);


        return members.stream()
                .filter(member -> member.getMemberStatus() == MemberStatus.ACTIVE)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private OrganizationMemberDTO convertToDTO(OrganizationMember member) {
        OrganizationMemberDTO dto = new OrganizationMemberDTO();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setEmail(member.getUser().getEmail());
        dto.setFirstName(member.getUser().getFirstName());
        dto.setLastName(member.getUser().getLastName());
        dto.setOrganizationId(member.getOrganization().getId());
        dto.setOrganizationName(member.getOrganization().getName());
        dto.setOrganizationRole(member.getOrganizationRole());
        dto.setMemberStatus(member.getMemberStatus());
        dto.setInviteExpiresAt(member.getInviteExpiresAt());
        return dto;
    }

}
