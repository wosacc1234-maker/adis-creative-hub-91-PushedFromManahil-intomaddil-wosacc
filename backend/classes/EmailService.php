<?php
/**
 * Email Service Class
 * Handles email notifications and auto-replies
 */

class EmailService {
    private $smtp_host;
    private $smtp_port;
    private $smtp_username;
    private $smtp_password;
    private $from_email;
    private $from_name;

    public function __construct() {
        $this->smtp_host = SMTP_HOST;
        $this->smtp_port = SMTP_PORT;
        $this->smtp_username = SMTP_USERNAME;
        $this->smtp_password = SMTP_PASSWORD;
        $this->from_email = FROM_EMAIL;
        $this->from_name = FROM_NAME;
    }

    /**
     * Send contact form notification to admin
     */
    public function sendContactNotification($data) {
        $subject = "New Contact Form Submission - {$data['service']}";
        
        $message = "
        <h2>New Contact Form Submission</h2>
        <p><strong>Submission ID:</strong> {$data['id']}</p>
        <p><strong>Name:</strong> {$data['name']}</p>
        <p><strong>Email:</strong> {$data['email']}</p>
        <p><strong>Phone:</strong> {$data['phone']}</p>
        <p><strong>Service:</strong> {$data['service']}</p>
        <p><strong>Budget:</strong> {$data['budget']}</p>
        <p><strong>Timeline:</strong> {$data['timeline']}</p>
        <p><strong>Message:</strong></p>
        <p>{$data['message']}</p>
        <hr>
        <p><em>Submitted at: " . date('Y-m-d H:i:s') . "</em></p>
        ";

        return $this->sendEmail($this->from_email, $subject, $message);
    }

    /**
     * Send auto-reply to contact form submitter
     */
    public function sendContactAutoReply($email, $name) {
        $subject = "Thank you for contacting Adil GFX!";
        
        $message = "
        <h2>Hi {$name},</h2>
        <p>Thank you for reaching out! I've received your message and will get back to you within 2 hours during business hours.</p>
        
        <h3>What happens next?</h3>
        <ul>
            <li>I'll review your project details</li>
            <li>Prepare a custom proposal</li>
            <li>Schedule a free consultation call if needed</li>
            <li>Send you a detailed quote and timeline</li>
        </ul>
        
        <p>In the meantime, feel free to:</p>
        <ul>
            <li><a href='https://adilgfx.com/portfolio'>Browse my portfolio</a></li>
            <li><a href='https://adilgfx.com/testimonials'>Read client testimonials</a></li>
            <li><a href='https://wa.me/1234567890'>Message me on WhatsApp</a> for urgent inquiries</li>
        </ul>
        
        <p>Looking forward to working with you!</p>
        <p>Best regards,<br>Adil<br>Professional Designer & Video Editor</p>
        
        <hr>
        <p><small>This is an automated response. Please don't reply to this email.</small></p>
        ";

        return $this->sendEmail($email, $subject, $message);
    }

    /**
     * Send email using PHP mail function (basic implementation)
     * In production, use PHPMailer or similar for SMTP
     */
    private function sendEmail($to, $subject, $message) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            "From: {$this->from_name} <{$this->from_email}>",
            "Reply-To: {$this->from_email}",
            'X-Mailer: PHP/' . phpversion()
        ];

        try {
            $sent = mail($to, $subject, $message, implode("\r\n", $headers));
            
            if (!$sent) {
                error_log("Failed to send email to: {$to}");
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Email error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send newsletter subscription confirmation
     */
    public function sendNewsletterConfirmation($email, $name = '') {
        $subject = "Welcome to Adil GFX Newsletter!";
        
        $message = "
        <h2>Welcome to the Adil GFX Newsletter!</h2>
        <p>Hi " . ($name ?: 'there') . ",</p>
        <p>Thank you for subscribing! You'll now receive:</p>
        <ul>
            <li>Weekly design tips and tutorials</li>
            <li>Exclusive templates and resources</li>
            <li>Case studies and success stories</li>
            <li>Special offers and discounts</li>
        </ul>
        <p>As a welcome gift, here are 5 free YouTube thumbnail templates: <a href='#'>Download Now</a></p>
        <p>Best regards,<br>Adil</p>
        ";

        return $this->sendEmail($email, $subject, $message);
    }
}