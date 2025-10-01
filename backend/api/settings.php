<?php
/**
 * Settings API Endpoint
 * Handles global site settings
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/SettingsManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$settings_manager = new SettingsManager();
$auth = new Auth();

try {
    switch ($method) {
        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get all settings
                $settings = $settings_manager->getAllSettings();
                echo json_encode($settings);
            } elseif (preg_match('/^\/category\/(.+)$/', $path_info, $matches)) {
                // Get settings by category
                $category = $matches[1];
                $settings = $settings_manager->getSettingsByCategory($category);
                echo json_encode($settings);
            } elseif (preg_match('/^\/(.+)$/', $path_info, $matches)) {
                // Get single setting
                $key = $matches[1];
                $value = $settings_manager->getSetting($key);
                echo json_encode(['value' => $value]);
            }
            break;

        case 'POST':
            // Create new setting (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['key'], $input['value'], $input['type'], $input['category'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                break;
            }

            $result = $settings_manager->createSetting(
                $input['key'],
                $input['value'],
                $input['type'],
                $input['category'],
                $input['description'] ?? ''
            );
            
            if ($result['success']) {
                http_response_code(201);
                echo json_encode(['message' => 'Setting created successfully', 'id' => $result['id']]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['message']]);
            }
            break;

        case 'PUT':
            // Update setting (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            if (preg_match('/^\/bulk$/', $path_info)) {
                // Bulk update settings
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || !isset($input['settings'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing settings data']);
                    break;
                }

                $result = $settings_manager->bulkUpdateSettings($input['settings']);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Settings updated successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            } elseif (preg_match('/^\/(.+)$/', $path_info, $matches)) {
                // Update single setting
                $key = $matches[1];
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input || !isset($input['value'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing value']);
                    break;
                }

                $result = $settings_manager->updateSetting(
                    $key,
                    $input['value'],
                    $input['type'] ?? 'text'
                );
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Setting updated successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'DELETE':
            // Delete setting (admin only)
            $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            $token = str_replace('Bearer ', '', $token);
            
            $auth_result = $auth->verifyToken($token);
            if (!$auth_result['success'] || $auth_result['role'] !== 'admin') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }

            if (preg_match('/^\/(.+)$/', $path_info, $matches)) {
                $key = $matches[1];
                $result = $settings_manager->deleteSetting($key);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Setting deleted successfully']);
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
    error_log("Settings API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}