<?php
/**
 * Admin Activity Log API
 * Provides recent activity for admin dashboard
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';
require_once __DIR__ . '/../../middleware/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Verify admin authentication
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $token);

$auth = new Auth();
$auth_result = $auth->verifyToken($token);

if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get recent activity from various sources
    $activities = [];

    // Recent user registrations
    $stmt = $conn->prepare("
        SELECT 'user_registered' as type, name as description, created_at as time
        FROM users 
        WHERE role = 'user' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $user_activities = $stmt->fetchAll();

    foreach ($user_activities as $activity) {
        $activities[] = [
            'id' => uniqid(),
            'type' => $activity['type'],
            'description' => $activity['description'] . ' registered',
            'time' => $activity['time'],
            'icon' => 'fas fa-user-plus'
        ];
    }

    // Recent contact submissions
    $stmt = $conn->prepare("
        SELECT name, service, created_at as time
        FROM contact_submissions 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $contact_activities = $stmt->fetchAll();

    foreach ($contact_activities as $activity) {
        $activities[] = [
            'id' => uniqid(),
            'type' => 'contact_submitted',
            'description' => $activity['name'] . ' submitted contact form for ' . $activity['service'],
            'time' => $activity['time'],
            'icon' => 'fas fa-envelope'
        ];
    }

    // Recent blog views (top performing)
    $stmt = $conn->prepare("
        SELECT title, views
        FROM blogs 
        WHERE published = 1 AND views > 0
        ORDER BY views DESC 
        LIMIT 3
    ");
    $stmt->execute();
    $blog_activities = $stmt->fetchAll();

    foreach ($blog_activities as $activity) {
        $activities[] = [
            'id' => uniqid(),
            'type' => 'blog_popular',
            'description' => 'Blog "' . $activity['title'] . '" has ' . $activity['views'] . ' views',
            'time' => date('Y-m-d H:i:s'),
            'icon' => 'fas fa-eye'
        ];
    }

    // Sort all activities by time
    usort($activities, function($a, $b) {
        return strtotime($b['time']) - strtotime($a['time']);
    });

    // Format timestamps
    $formatted_activities = array_map(function($activity) {
        $time = new DateTime($activity['time']);
        $now = new DateTime();
        $diff = $now->diff($time);

        if ($diff->days > 0) {
            $timeStr = $diff->days . ' day' . ($diff->days > 1 ? 's' : '') . ' ago';
        } elseif ($diff->h > 0) {
            $timeStr = $diff->h . ' hour' . ($diff->h > 1 ? 's' : '') . ' ago';
        } elseif ($diff->i > 0) {
            $timeStr = $diff->i . ' minute' . ($diff->i > 1 ? 's' : '') . ' ago';
        } else {
            $timeStr = 'Just now';
        }

        return [
            'id' => $activity['id'],
            'description' => $activity['description'],
            'time' => $timeStr,
            'icon' => $activity['icon']
        ];
    }, array_slice($activities, 0, 10));

    echo json_encode($formatted_activities);

} catch (Exception $e) {
    error_log("Admin activity error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load activity']);
}