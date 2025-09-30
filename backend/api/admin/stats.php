<?php
/**
 * Admin Statistics API
 * Provides dashboard statistics for admin panel
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

    // Get total users
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    $stmt->execute();
    $total_users = $stmt->fetch()['total'];

    // Get total blogs
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM blogs WHERE published = 1");
    $stmt->execute();
    $total_blogs = $stmt->fetch()['total'];

    // Get total contact forms
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM contact_submissions");
    $stmt->execute();
    $total_contacts = $stmt->fetch()['total'];

    // Get total tokens issued
    $stmt = $conn->prepare("SELECT SUM(total_earned) as total FROM user_tokens");
    $stmt->execute();
    $total_tokens = $stmt->fetch()['total'] ?? 0;

    // Get new users this month
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total 
        FROM users 
        WHERE role = 'user' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    ");
    $stmt->execute();
    $new_users_month = $stmt->fetch()['total'];

    // Get popular blog posts
    $stmt = $conn->prepare("
        SELECT title, views, likes 
        FROM blogs 
        WHERE published = 1 
        ORDER BY views DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $popular_blogs = $stmt->fetchAll();

    // Get recent contact submissions
    $stmt = $conn->prepare("
        SELECT name, email, service, created_at 
        FROM contact_submissions 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $recent_contacts = $stmt->fetchAll();

    // Get user growth data (last 30 days)
    $stmt = $conn->prepare("
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users 
        WHERE role = 'user' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute();
    $user_growth = $stmt->fetchAll();

    echo json_encode([
        'totalUsers' => (int)$total_users,
        'totalBlogs' => (int)$total_blogs,
        'totalContacts' => (int)$total_contacts,
        'totalTokens' => (int)$total_tokens,
        'newUsersMonth' => (int)$new_users_month,
        'popularBlogs' => $popular_blogs,
        'recentContacts' => $recent_contacts,
        'userGrowth' => $user_growth
    ]);

} catch (Exception $e) {
    error_log("Admin stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load statistics']);
}