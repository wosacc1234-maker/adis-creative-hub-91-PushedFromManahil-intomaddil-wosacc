<?php
/**
 * Newsletter API Endpoint
 * Handles newsletter subscriptions
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/EmailService.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';

if ($method !== 'POST' || $path_info !== '/subscribe') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        exit;
    }

    $email = trim($input['email']);
    $name = trim($input['name'] ?? '');

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Check if already subscribed
    $stmt = $conn->prepare("SELECT id, status FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['status'] === 'active') {
            echo json_encode([
                'success' => true,
                'message' => 'You are already subscribed to our newsletter!'
            ]);
            exit;
        } else {
            // Reactivate subscription
            $stmt = $conn->prepare("
                UPDATE newsletter_subscribers 
                SET status = 'active', name = ?, subscribed_at = NOW(), unsubscribed_at = NULL
                WHERE email = ?
            ");
            $stmt->execute([$name, $email]);
        }
    } else {
        // New subscription
        $stmt = $conn->prepare("
            INSERT INTO newsletter_subscribers (email, name, source)
            VALUES (?, ?, 'website')
        ");
        $stmt->execute([$email, $name]);
    }

    // Send confirmation email
    $email_service = new EmailService();
    $email_service->sendNewsletterConfirmation($email, $name);

    echo json_encode([
        'success' => true,
        'message' => 'Successfully subscribed! Check your email for confirmation.'
    ]);

} catch (Exception $e) {
    error_log("Newsletter API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Subscription failed. Please try again.'
    ]);
}