<?php
/**
 * Contact Form API Endpoint
 * Handles contact form submissions with validation and email notifications
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';
require_once __DIR__ . '/../classes/EmailService.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    // Validate required fields
    $required_fields = ['name', 'email', 'message'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: {$field}"]);
            exit;
        }
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Validate field lengths
    if (strlen($input['name']) < 2 || strlen($input['name']) > 100) {
        http_response_code(400);
        echo json_encode(['error' => 'Name must be between 2 and 100 characters']);
        exit;
    }

    if (strlen($input['message']) < 10 || strlen($input['message']) > 1000) {
        http_response_code(400);
        echo json_encode(['error' => 'Message must be between 10 and 1000 characters']);
        exit;
    }

    // Validate phone if provided
    if (!empty($input['phone'])) {
        $phone = preg_replace('/[^\d]/', '', $input['phone']);
        if (strlen($phone) < 10) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid phone number']);
            exit;
        }
    }

    // Save to database
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("
        INSERT INTO contact_submissions (name, email, service, budget, timeline, phone, message, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        trim($input['name']),
        trim($input['email']),
        $input['service'] ?? null,
        $input['budget'] ?? null,
        $input['timeline'] ?? null,
        $input['phone'] ?? null,
        trim($input['message']),
        $_SERVER['REMOTE_ADDR'],
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);

    $submission_id = $conn->lastInsertId();

    // Send email notification
    $email_service = new EmailService();
    $email_sent = $email_service->sendContactNotification([
        'id' => $submission_id,
        'name' => $input['name'],
        'email' => $input['email'],
        'service' => $input['service'] ?? 'Not specified',
        'budget' => $input['budget'] ?? 'Not specified',
        'timeline' => $input['timeline'] ?? 'Not specified',
        'phone' => $input['phone'] ?? 'Not provided',
        'message' => $input['message']
    ]);

    // Send auto-reply to user
    $email_service->sendContactAutoReply($input['email'], $input['name']);

    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message! We\'ll get back to you within 2 hours.',
        'id' => $submission_id
    ]);

} catch (Exception $e) {
    error_log("Contact API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to submit contact form. Please try again.'
    ]);
}