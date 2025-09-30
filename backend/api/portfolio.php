<?php
/**
 * Portfolio API Endpoint
 * Handles portfolio-related API requests
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/PortfolioManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$portfolio_manager = new PortfolioManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all portfolio items with pagination
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 10), 50);
                $category = $_GET['category'] ?? null;
                
                $result = $portfolio_manager->getPortfolio($page, $limit, $category);
                echo json_encode($result);
            } else {
                // Get single portfolio item
                $identifier = trim($path_info, '/');
                $item = $portfolio_manager->getPortfolioById($identifier);
                
                if ($item) {
                    echo json_encode($item);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Portfolio item not found']);
                }
            }
            break;

        case 'POST':
            // Create new portfolio item (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['title'], $input['category'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            $result = $portfolio_manager->createPortfolioItem($input);
            
            if ($result['success']) {
                http_response_code(201);
                echo json_encode(['message' => 'Portfolio item created successfully', 'id' => $result['id']]);
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
    error_log("Portfolio API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}