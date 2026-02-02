package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.DTO.InviteRequestDTO;
import com.projectmanagement.project_management_system.DTO.OrgResponse;
import com.projectmanagement.project_management_system.Entity.Organization;
import com.projectmanagement.project_management_system.Entity.OrganizationMember;
import com.projectmanagement.project_management_system.Entity.User;
import com.projectmanagement.project_management_system.Enums.MemberStatus;
import com.projectmanagement.project_management_system.Enums.OrganizationRole;
import com.projectmanagement.project_management_system.Exception.InvalidRequestException;
import com.projectmanagement.project_management_system.Repository.OrganizationMemberRepository;
import com.projectmanagement.project_management_system.Repository.OrganizationRepository;
import com.projectmanagement.project_management_system.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrganizationService {


    private final OrganizationRepository organizationRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final EmailService emailService;

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Value("${aws.region}")
    private String awsRegion;

    public OrganizationService(OrganizationRepository organizationRepository, S3Client s3Client, S3Presigner s3Presigner, UserRepository userRepository, OrganizationMemberRepository organizationMemberRepository, EmailService emailService) {
        this.organizationRepository = organizationRepository;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.userRepository = userRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.emailService = emailService;
    }

    @Transactional // ensures if S3 upload fails, database rollback happens
    public OrgResponse createOrganization(String name, String slug, MultipartFile logo, String userEmail) throws IOException {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (organizationRepository.existsBySlug(slug)) {
            throw new RuntimeException("Organization with this slug already exists");
        }


        String s3Key = null;
        if (logo != null && !logo.isEmpty()) {
            s3Key = uploadToS3(logo, slug);
        }


        Organization organization = new Organization();
        organization.setName(name);
        organization.setSlug(slug);
        organization.setLogoUrl(s3Key);  // Store S3 key, not presigned URL
        organization.setCreatedBy(creator);



        Organization savedOrg = organizationRepository.save(organization);


        OrganizationMember organizationMember = new OrganizationMember();
        organizationMember.setUser(creator);
        organizationMember.setOrganization(savedOrg);
        organizationMember.setOrganizationRole(OrganizationRole.ADMIN);
        organizationMember.setMemberStatus(MemberStatus.ACTIVE);
        organizationMember.setInviteToken(null); // No invite token for creator
        organizationMember.setInviteExpiresAt(null); // No expiration for creator
        organizationMemberRepository.save(organizationMember);


        String presignedUrl = s3Key != null ? generatePresignedUrl(s3Key) : null;


        return new OrgResponse(
                savedOrg.getId(),
                savedOrg.getName(),
                savedOrg.getSlug(),
                presignedUrl,
                OrganizationRole.ADMIN
        );


    }

    private String uploadToS3(MultipartFile file, String slug) throws IOException {
        String fileName = String.format("organizations/%s/%s-%s",
                slug,
                UUID.randomUUID().toString(),
                file.getOriginalFilename()
        );

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );


        return fileName;
    }


    public String generatePresignedUrl(String key) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofDays(7))  // URL expires in 7 days
                .getObjectRequest(req -> req.bucket(bucketName).key(key))
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }

    public List<OrgResponse> getAllOrganizationsbyEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        // Get organizations created by user
        List<Organization> createdOrgs = organizationRepository.findByCreatorEmail(email);

        // Get organizations where user is an ACTIVE member (not INVITED)
        List<OrganizationMember> memberOrgs = organizationMemberRepository.findByUser(user);

        // Convert to OrgResponse - avoid duplicates
        List<OrgResponse> orgResponses = new java.util.ArrayList<>();

        // Add created organizations
        for (Organization org : createdOrgs) {
            OrgResponse response = new OrgResponse(
                    org.getId(),
                    org.getName(),
                    org.getSlug(),
                    org.getLogoUrl() != null ? generatePresignedUrl(org.getLogoUrl()) : null,
                    organizationMemberRepository.findRoleByOrganizationAndUser(org, user).orElse(null)
            );
            orgResponses.add(response);
        }

        // Add member organizations (avoid duplicates if user created and is also a member)
        // Only include ACTIVE members, exclude INVITED status
        for (OrganizationMember member : memberOrgs) {
            Organization org = member.getOrganization();
            // Only add if:
            // 1. Not already added (user didn't create it)
            // 2. Member status is ACTIVE (not INVITED)
            if (!createdOrgs.contains(org) && member.getMemberStatus() == MemberStatus.ACTIVE) {
                OrgResponse response = new OrgResponse(
                        org.getId(),
                        org.getName(),
                        org.getSlug(),
                        org.getLogoUrl() != null ? generatePresignedUrl(org.getLogoUrl()) : null,
                        member.getOrganizationRole()
                );
                orgResponses.add(response);
            }
        }

        return orgResponses;
    }

    public Organization findByCreater(Long id) {

        return organizationRepository.findByCreatedById(id);
    }

    public void inviteMember(String invitedByEmail, Long orgId, InviteRequestDTO memberAddDTO) {

        User inviter = userRepository.findByEmail(invitedByEmail)
                .orElseThrow(() -> new InvalidRequestException("Inviter not found"));

        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new InvalidRequestException("Organization not found"));


        OrganizationRole organizationRole = organizationMemberRepository
                .findRoleByOrganizationAndUser(organization, inviter)
                .orElseThrow(() -> new InvalidRequestException("Inviter is not a member of the organization"));

        if (organizationRole != OrganizationRole.ADMIN) {
            throw new InvalidRequestException("Only ADMIN members can invite new members");
        }


        User invitedUser = userRepository.findByEmail(memberAddDTO.getEmail())
                .orElseThrow(() -> new InvalidRequestException("Invited user not found"));

        // ✅ FIX: Check if user already has ANY membership (INVITED or ACTIVE)
        Optional<OrganizationMember> existingMembership = organizationMemberRepository
                .findByUserAndOrganization(invitedUser, organization);

        if (existingMembership.isPresent()) {
            OrganizationMember member = existingMembership.get();
            if (member.getMemberStatus() == MemberStatus.ACTIVE) {
                throw new InvalidRequestException("User is already an active member of the organization");
            } else if (member.getMemberStatus() == MemberStatus.INVITED) {
                throw new InvalidRequestException("User already has a pending invitation to this organization");
            }
        }

        OrganizationMember invitation = new OrganizationMember();
        invitation.setOrganization(organization);
        invitation.setUser(invitedUser);
        invitation.setOrganizationRole(memberAddDTO.getRole());
        invitation.setMemberStatus(MemberStatus.INVITED);
        invitation.setInviteToken(UUID.randomUUID().toString());
        invitation.setInviteExpiresAt(java.time.Instant.now().plus(Duration.ofDays(7))); // Invitation valid for 7 days

        OrganizationMember savedInvitation = organizationMemberRepository.save(invitation);

        emailService.sendInvitationEmail(
                memberAddDTO.getEmail(),
                inviter.getFirstName() + " " + inviter.getLastName(),
                organization.getName(),
                savedInvitation.getInviteToken(),
                memberAddDTO.getRole().name()
        );
    }

    @Transactional
    public String acceptInvitation(String token) {
        OrganizationMember invitation = organizationMemberRepository
                .findByInviteToken(token)
                .orElseThrow(() -> new InvalidRequestException("Invalid invitation token"));


        if (invitation.getInviteExpiresAt().isBefore(java.time.Instant.now())) {
            throw new InvalidRequestException("Invitation token has expired");
        }

        User user = invitation.getUser();

        // Check if already active
        if (invitation.getMemberStatus() == MemberStatus.ACTIVE) {
            throw new InvalidRequestException("Invitation already accepted");
        }

        // Activate membership
        invitation.setMemberStatus(MemberStatus.ACTIVE);
        invitation.setInviteToken(null);  // Clear token after use
        invitation.setInviteExpiresAt(null);

        organizationMemberRepository.save(invitation);

        return user.getEmail();
    }
}