<?php
/**
 * Pages API Endpoint
 * Handles dynamic page management
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/PageManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$page_manager = new PageManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all pages (admin) or navigation pages (public)
                $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
                $token = str_replace('Bearer ', '', $token);
                
                $auth_result = $auth->verifyToken($token);
                $isAdmin = $auth_result['success'] && $auth_result['role'] === 'admin';

                if ($isAdmin) {
                    $pages = $page_manager->getAllPages();
                } else {
                    $pages = $page_manager->getNavigationPages();
                }
                
                echo json_encode($pages);
            } elseif (preg_match('/^\/(.+)$/', $path_info, $matches)) {
                // Get single page by slug
                $slug = $matches[1];
                $page = $page_manager->getPageBySlug($slug);
                
                if ($page) {
                    echo json_encode($page);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Page not found']);
                }
            }
            break;

        case 'POST':
            // Create new page (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            if ($path_info === '/reorder') {
                // Reorder pages
                if (!isset($input['pageOrders'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing page orders']);
                    break;
                }

                $result = $page_manager->reorderPages($input['pageOrders']);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Pages reordered successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            } else {
                // Create new page
                $result = $page_manager->createPage($input);
                
                if ($result['success']) {
                    http_response_code(201);
                    echo json_encode([
                        'message' => 'Page created successfully',
                        'id' => $result['id'],
                        'slug' => $result['slug']
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'PUT':
            // Update page (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $page_id = $matches[1];
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid JSON data']);
                    break;
                }

                $result = $page_manager->updatePage($page_id, $input);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Page updated successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'DELETE':
            // Delete page (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $page_id = $matches[1];
                $result = $page_manager->deletePage($page_id);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Page deleted successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    error_log("Pages API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}