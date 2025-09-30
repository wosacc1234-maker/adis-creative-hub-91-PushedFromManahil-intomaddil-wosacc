<?php
/**
 * Authentication API Endpoint
 * Handles user registration, login, and token verification
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$auth = new Auth();

try {
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data']);
                break;
            }

            if ($path_info === '/register') {
                // User registration
                if (!isset($input['email'], $input['password'], $input['name'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields']);
                    break;
                }

                // Validate input
                if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid email format']);
                    break;
                }

                if (strlen($input['password']) < 8) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Password must be at least 8 characters']);
                    break;
                }

                $result = $auth->register($input['email'], $input['password'], $input['name']);
                
                if ($result['success']) {
                    http_response_code(201);
                    echo json_encode([
                        'message' => 'Account created successfully',
                        'user_id' => $result['user_id']
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => $result['message']]);
                }

            } elseif ($path_info === '/login') {
                // User login
                if (!isset($input['email'], $input['password'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing email or password']);
                    break;
                }

                $result = $auth->login($input['email'], $input['password']);
                
                if ($result['success']) {
                    echo json_encode([
                        'message' => $result['message'],
                        'token' => $result['token'],
                        'user' => $result['user']
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => $result['message']]);
                }

            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;

        case 'GET':
            if ($path_info === '/verify') {
                // Verify token
                $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
                $token = str_replace('Bearer ', '', $token);
                
                if (!$token) {
                    http_response_code(401);
                    echo json_encode(['error' => 'No token provided']);
                    break;
                }

                $result = $auth->verifyToken($token);
                
                if ($result['success']) {
                    $user = $auth->getCurrentUser($result['user_id']);
                    echo json_encode([
                        'valid' => true,
                        'user' => $user
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid token']);
                }

            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    error_log("Auth API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}