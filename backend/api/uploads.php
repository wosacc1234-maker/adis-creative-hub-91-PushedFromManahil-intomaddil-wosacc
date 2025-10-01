<?php
/**
 * Media Upload API Endpoint
 * Handles file uploads and media management
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/MediaManager.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../middleware/cors.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';
$media_manager = new MediaManager();
$auth = new Auth();

try {
    // Verify authentication for all operations
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    $auth_result = $auth->verifyToken($token);
    if (!$auth_result['success']) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    switch ($method) {
        case 'POST':
            if (empty($path_info) || $path_info === '/') {
                // Upload new file
                if (!isset($_FILES['file'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No file uploaded']);
                    break;
                }

                $file = $_FILES['file'];
                $altText = $_POST['altText'] ?? '';
                $caption = $_POST['caption'] ?? '';

                $result = $media_manager->uploadFile($file, $auth_result['user_id'], $altText, $caption);
                
                if ($result['success']) {
                    http_response_code(201);
                    echo json_encode([
                        'message' => 'File uploaded successfully',
                        'file' => [
                            'id' => $result['id'],
                            'filename' => $result['filename'],
                            'url' => $result['url'],
                            'originalName' => $result['originalName']
                        ]
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'GET':
            if (empty($path_info) || $path_info === '/') {
                // Get media library
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 20), 50);
                $type = $_GET['type'] ?? null;

                $result = $media_manager->getMediaLibrary($page, $limit, $type);
                echo json_encode($result);
            }
            break;

        case 'PUT':
            // Update media metadata
            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $media_id = $matches[1];
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid JSON data']);
                    break;
                }

                $result = $media_manager->updateMediaMetadata(
                    $media_id,
                    $input['altText'] ?? '',
                    $input['caption'] ?? ''
                );
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Media updated successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => $result['message']]);
                }
            }
            break;

        case 'DELETE':
            // Delete media file (admin only)
            if ($auth_result['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Admin access required']);
                break;
            }

            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $media_id = $matches[1];
                $result = $media_manager->deleteMedia($media_id);
                
                if ($result['success']) {
                    echo json_encode(['message' => 'Media deleted successfully']);
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
    error_log("Uploads API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}