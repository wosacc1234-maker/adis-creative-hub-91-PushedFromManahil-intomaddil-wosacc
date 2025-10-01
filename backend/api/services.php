<?php
/**
 * Services API Endpoint
 * Handles service-related API requests with enhanced features
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/ServiceManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$service_manager = new ServiceManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all services
                $services = $service_manager->getServices();
                echo json_encode($services);
            } else {
                // Get single service
                $identifier = trim($path_info, '/');
                $service = $service_manager->getServiceById($identifier);
                
                if ($service) {
                    echo json_encode($service);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Service not found']);
                }
            }
            break;

        case 'POST':
            // Create new service (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name'], $input['description'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            $result = $service_manager->createService($input);
            
            if ($result['success']) {
                http_response_code(201);
                echo json_encode(['message' => 'Service created successfully', 'id' => $result['id']]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'PUT':
            // Update service (admin only)
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

            $result = $service_manager->updateService($identifier, $input);
            
            if ($result['success']) {
                echo json_encode(['message' => 'Service updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'DELETE':
            // Delete service (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $identifier = trim($path_info, '/');
            $result = $service_manager->deleteService($identifier);
            
            if ($result['success']) {
                echo json_encode(['message' => 'Service deleted successfully']);
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
    error_log("Services API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}