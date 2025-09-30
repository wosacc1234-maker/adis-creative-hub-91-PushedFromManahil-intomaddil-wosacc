<?php
/**
 * Blogs API Endpoint
 * Handles blog-related API requests
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/BlogManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$blog_manager = new BlogManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all blogs with pagination
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 10), 50); // Max 50 items
                $category = $_GET['category'] ?? null;
                $search = $_GET['search'] ?? null;
                
                $result = $blog_manager->getBlogs($page, $limit, $category, $search);
                echo json_encode($result);
            } else {
                // Get single blog
                $identifier = trim($path_info, '/');
                $blog = $blog_manager->getBlogById($identifier);
                
                if ($blog) {
                    echo json_encode($blog);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Blog not found']);
                }
            }
            break;

        case 'POST':
            // Create new blog (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['title'], $input['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            $result = $blog_manager->createBlog($input);
            
            if ($result['success']) {
                http_response_code(201);
                echo json_encode(['message' => 'Blog created successfully', 'id' => $result['id']]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'PUT':
            // Update blog (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $identifier = trim($path_info, '/');
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data']);
                break;
            }

            $result = $blog_manager->updateBlog($identifier, $input);
            
            if ($result['success']) {
                echo json_encode(['message' => 'Blog updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'DELETE':
            // Delete blog (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $identifier = trim($path_info, '/');
            $result = $blog_manager->deleteBlog($identifier);
            
            if ($result['success']) {
                echo json_encode(['message' => 'Blog deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    error_log("Blogs API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}