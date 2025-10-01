<?php
/**
 * Testimonials API Endpoint
 * Handles testimonial-related API requests
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/TestimonialManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$testimonial_manager = new TestimonialManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all testimonials
                $featured = $_GET['featured'] ?? null;
                $limit = min((int)($_GET['limit'] ?? 50), 100);
                
                $testimonials = $testimonial_manager->getTestimonials($featured, $limit);
                echo json_encode($testimonials);
            } else {
                // Get single testimonial
                $identifier = trim($path_info, '/');
                $testimonial = $testimonial_manager->getTestimonialById($identifier);
                
                if ($testimonial) {
                    echo json_encode($testimonial);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Testimonial not found']);
                }
            }
            break;

        case 'POST':
            // Create new testimonial (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name'], $input['content'], $input['rating'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            $result = $testimonial_manager->createTestimonial($input);
            
            if ($result['success']) {
                http_response_code(201);
                echo json_encode(['message' => 'Testimonial created successfully', 'id' => $result['id']]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'PUT':
            // Update testimonial (admin only)
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

            $result = $testimonial_manager->updateTestimonial($identifier, $input);
            
            if ($result['success']) {
                echo json_encode(['message' => 'Testimonial updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'DELETE':
            // Delete testimonial (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $identifier = trim($path_info, '/');
            $result = $testimonial_manager->deleteTestimonial($identifier);
            
            if ($result['success']) {
                echo json_encode(['message' => 'Testimonial deleted successfully']);
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
    error_log("Testimonials API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}