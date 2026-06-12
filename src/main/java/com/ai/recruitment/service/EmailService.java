package com.ai.recruitment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String bodyHtml) {
        System.out.println("==========================================================================");
        System.out.println("SIMULATED EMAIL LOG:");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body:\n" + bodyHtml);
        System.out.println("==========================================================================");

        if (mailSender == null) {
            System.out.println("INFO: SMTP mail config is not set. Email logged above.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);
            mailSender.send(message);
            System.out.println("SMTP email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("SMTP delivery failed for " + to + ": " + e.getMessage() + ". Log output above is fallback.");
        }
    }

    public void sendInterviewScheduledEmail(String to, String candidateName, String jobTitle, String title, String timeStr, String meetLink, String notes) {
        String subject = "Interview Scheduled: " + title + " - " + jobTitle;
        String html = "<html><body style='font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #16121e; border: 1px solid #2e1d4b; border-radius: 12px; padding: 30px;'>" +
                "<h2 style='color: #a855f7; margin-top: 0;'>Interview Scheduled</h2>" +
                "<p>Hi <strong>" + candidateName + "</strong>,</p>" +
                "<p>An interview has been scheduled for your application for the <strong>" + jobTitle + "</strong> position.</p>" +
                "<hr style='border: 0; border-top: 1px solid #2e1d4b; margin: 20px 0;'>" +
                "<table style='width: 100%; text-align: left; font-size: 14px;'>" +
                "<tr><th style='color: #9ca3af; padding-bottom: 8px;'>Round:</th><td style='color: #ffffff; padding-bottom: 8px;'>" + title + "</td></tr>" +
                "<tr><th style='color: #9ca3af; padding-bottom: 8px;'>Date & Time:</th><td style='color: #ffffff; padding-bottom: 8px;'>" + timeStr + "</td></tr>" +
                "<tr><th style='color: #9ca3af; padding-bottom: 8px;'>Duration:</th><td style='color: #ffffff; padding-bottom: 8px;'>45 minutes</td></tr>" +
                "</table>" +
                (notes != null && !notes.trim().isEmpty() ? "<div style='margin-top: 15px; padding: 10px; background-color: rgba(168, 85, 247, 0.1); border-left: 3px solid #a855f7; font-style: italic; font-size: 13px;'>Notes: " + notes + "</div>" : "") +
                "<div style='margin-top: 25px; text-align: center;'>" +
                (meetLink != null && !meetLink.trim().isEmpty() ? 
                "<a href='" + (meetLink.startsWith("http") ? meetLink : "https://" + meetLink) + "' style='background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;'>Join Interview</a>" : "") +
                "</div>" +
                "<hr style='border: 0; border-top: 1px solid #2e1d4b; margin: 20px 0;'>" +
                "<p style='font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 0;'>AI Recruitment Management System. Please do not reply to this email.</p>" +
                "</div>" +
                "</body></html>";
        
        sendEmail(to, subject, html);
    }

    public void sendApplicationStatusUpdateEmail(String to, String candidateName, String jobTitle, String newStatus) {
        String subject = "Application Status Update: " + jobTitle;
        String html = "<html><body style='font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #16121e; border: 1px solid #2e1d4b; border-radius: 12px; padding: 30px;'>" +
                "<h2 style='color: #3b82f6; margin-top: 0;'>Application Status Update</h2>" +
                "<p>Hi <strong>" + candidateName + "</strong>,</p>" +
                "<p>Your job application for the <strong>" + jobTitle + "</strong> position has been updated to:</p>" +
                "<div style='margin: 20px 0; padding: 15px; background-color: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; color: #60a5fa;'>" +
                newStatus +
                "</div>" +
                "<p>Please log in to your candidate dashboard to track your application details or scheduled interviews.</p>" +
                "<hr style='border: 0; border-top: 1px solid #2e1d4b; margin: 20px 0;'>" +
                "<p style='font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 0;'>AI Recruitment Management System. Please do not reply to this email.</p>" +
                "</div>" +
                "</body></html>";

        sendEmail(to, subject, html);
    }

    public void sendInterviewCancelledEmail(String to, String candidateName, String jobTitle, String title, String timeStr) {
        String subject = "Interview Cancelled: " + title + " - " + jobTitle;
        String html = "<html><body style='font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #16121e; border: 1px solid #2e1d4b; border-radius: 12px; padding: 30px;'>" +
                "<h2 style='color: #ef4444; margin-top: 0;'>Interview Cancelled</h2>" +
                "<p>Hi <strong>" + candidateName + "</strong>,</p>" +
                "<p>Please note that your scheduled interview <strong>" + title + "</strong> for the <strong>" + jobTitle + "</strong> position has been cancelled.</p>" +
                "<table style='width: 100%; text-align: left; font-size: 14px; margin-top: 15px;'>" +
                "<tr><th style='color: #9ca3af; padding-bottom: 8px;'>Original Time:</th><td style='color: #ffffff; padding-bottom: 8px;'>" + timeStr + "</td></tr>" +
                "</table>" +
                "<p>Our recruitment team will contact you shortly if rescheduling is needed.</p>" +
                "<hr style='border: 0; border-top: 1px solid #2e1d4b; margin: 20px 0;'>" +
                "<p style='font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 0;'>AI Recruitment Management System. Please do not reply to this email.</p>" +
                "</div>" +
                "</body></html>";

        sendEmail(to, subject, html);
    }
}
