package com.projectmanagement.project_management_system.Service;

import com.projectmanagement.project_management_system.Exception.InvalidRequestException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendInvitationEmail(String toEmail, String inviterName,
                                    String orgName, String token, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(inviterName + " invited you to join " + orgName);

            String htmlContent = buildInvitationEmailHtml(inviterName, orgName, token, role);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            System.out.println("✅ Invitation email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send email to: " + toEmail);
            e.printStackTrace();
            throw new InvalidRequestException("Failed to send invitation email");
        } catch (Exception e) {
            System.err.println("❌ Unexpected error sending email to: " + toEmail);
            e.printStackTrace();
            throw new InvalidRequestException("Failed to send invitation email: " + e.getMessage());
        }
    }

    private String buildInvitationEmailHtml(String inviterName, String orgName,
                                            String token, String role) {
        String inviteLink = frontendUrl + "/accept-invite?token=" + token;

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <style>\n" +
                "        body {\n" +
                "            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n" +
                "            background-color: #f5f7fa;\n" +
                "            margin: 0;\n" +
                "            padding: 0;\n" +
                "        }\n" +
                "        .email-container {\n" +
                "            max-width: 600px;\n" +
                "            margin: 40px auto;\n" +
                "            background-color: #ffffff;\n" +
                "            border-radius: 12px;\n" +
                "            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n" +
                "            overflow: hidden;\n" +
                "        }\n" +
                "        .header {\n" +
                "            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n" +
                "            padding: 40px;\n" +
                "            text-align: center;\n" +
                "            color: white;\n" +
                "        }\n" +
                "        .header h1 {\n" +
                "            margin: 10px 0 0 0;\n" +
                "            font-size: 28px;\n" +
                "        }\n" +
                "        .content {\n" +
                "            padding: 40px 30px;\n" +
                "            color: #333;\n" +
                "        }\n" +
                "        .invite-box {\n" +
                "            background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);\n" +
                "            border-left: 4px solid #667eea;\n" +
                "            padding: 20px;\n" +
                "            margin: 25px 0;\n" +
                "            border-radius: 8px;\n" +
                "        }\n" +
                "        .invite-box p {\n" +
                "            margin: 8px 0;\n" +
                "        }\n" +
                "        .button {\n" +
                "            display: inline-block;\n" +
                "            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n" +
                "            color: #ffffff !important;\n" +
                "            padding: 16px 40px;\n" +
                "            text-decoration: none;\n" +
                "            border-radius: 8px;\n" +
                "            font-weight: 600;\n" +
                "            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n" +
                "        }\n" +
                "        .button-container {\n" +
                "            text-align: center;\n" +
                "            margin: 30px 0;\n" +
                "        }\n" +
                "        .footer {\n" +
                "            background-color: #f8f9fa;\n" +
                "            padding: 25px;\n" +
                "            text-align: center;\n" +
                "            font-size: 13px;\n" +
                "            color: #6c757d;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"email-container\">\n" +
                "        <div class=\"header\">\n" +
                "            <div style=\"font-size: 48px;\">🎉</div>\n" +
                "            <h1>You're Invited!</h1>\n" +
                "        </div>\n" +
                "        \n" +
                "        <div class=\"content\">\n" +
                "            <p>Hi there,</p>\n" +
                "            <p><strong>" + inviterName + "</strong> has invited you to join their team.</p>\n" +
                "            \n" +
                "            <div class=\"invite-box\">\n" +
                "                <p><strong>Organization:</strong> " + orgName + "</p>\n" +
                "                <p><strong>Your Role:</strong> " + role + "</p>\n" +
                "            </div>\n" +
                "\n" +
                "            <p>Click the button below to accept the invitation:</p>\n" +
                "\n" +
                "            <div class=\"button-container\">\n" +
                "                <a href=\"" + inviteLink + "\" class=\"button\">Accept Invitation</a>\n" +
                "            </div>\n" +
                "\n" +
                "            <p style=\"color: #6c757d; text-align: center;\">\n" +
                "                ⏰ This invitation expires in 7 days\n" +
                "            </p>\n" +
                "        </div>\n" +
                "        \n" +
                "        <div class=\"footer\">\n" +
                "            <p>If you didn't expect this invitation, you can ignore this email.</p>\n" +
                "            <p>© 2026 Project Management System</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
