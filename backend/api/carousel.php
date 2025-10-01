<?php
/**
 * Carousel API Endpoint
 * Handles carousel slides management
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/CarouselManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$carousel_manager = new CarouselManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all carousels (admin) or specific carousel (public)
                $carousel_name = $_GET['name'] ?? null;
                
                if ($carousel_name) {
                    $slides = $carousel_manager->getCarouselSlides($carousel_name);
                    echo json_encode($slides);
                } else {
                    // Admin view - get all carousels
                    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
                    $token = str_replace('Bearer ', '', $token);
                    
                    $auth_result = $auth->verifyToken($token);
                    if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                        http_response_code(401);
                        echo json_encode(['error' => 'Unauthorized']);
                        break;
                    }

                    $carousels = $carousel_manager->getAllCarousels();
                    echo json_encode($carousels);
                }
            }
            break;

        case 'POST':
            // Create new slide (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['carouselName'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            if ($path_info === '/reorder') {
                // Reorder slides
                if (!isset($input['slideOrders'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing slide orders']);
                    break;
                }

                $result = $carousel_manager->reorderSlides($input['carouselName'], $input['slideOrders']);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Slides reordered successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            } else {
                // Create new slide
                $result = $carousel_manager->createSlide($input);
                
                if ($result['success']) {
                    http_response_code(201);
                    echo json_encode(['message' => 'Slide created successfully', 'id' => $result['id']]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'PUT':
            // Update slide (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $slide_id = $matches[1];
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid JSON data']);
                    break;
                }

                $result = $carousel_manager->updateSlide($slide_id, $input);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Slide updated successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'DELETE':
            // Delete slide (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $slide_id = $matches[1];
                $result = $carousel_manager->deleteSlide($slide_id);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Slide deleted successfully']);
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
    error_log("Carousel API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}