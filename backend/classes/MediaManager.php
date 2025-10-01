<?php
/**
 * Media Manager Class
 * Handles file uploads and media management
 */

require_once __DIR__ . '/../config/database.php';

class MediaManager {
    private $db;
    private $conn;
    private $upload_path;
    private $allowed_types;
    private $max_file_size;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->upload_path = __DIR__ . '/../uploads/';
        $this->allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'mp4', 'webm', 'pdf'];
        $this->max_file_size = 10 * 1024 * 1024; // 10MB

        // Create upload directory if it doesn't exist
        if (!is_dir($this->upload_path)) {
            mkdir($this->upload_path, 0755, true);
        }
    }

    /**
     * Upload file
     */
    public function uploadFile($file, $uploadedBy = null, $altText = '', $caption = '') {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                return ['success' => false, 'message' => $validation['message']];
            }

            // Generate unique filename
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $filepath = $this->upload_path . $filename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return ['success' => false, 'message' => 'Failed to move uploaded file'];
            }

            // Save to database
            $stmt = $this->conn->prepare("
                INSERT INTO media_uploads (filename, original_name, file_path, file_size, 
                                         mime_type, uploaded_by, alt_text, caption)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $filename,
                $file['name'],
                '/backend/uploads/' . $filename,
                $file['size'],
                $file['type'],
                $uploadedBy,
                $altText,
                $caption
            ]);

            $media_id = $this->conn->lastInsertId();

            return [
                'success' => true,
                'id' => $media_id,
                'filename' => $filename,
                'url' => '/backend/uploads/' . $filename,
                'originalName' => $file['name']
            ];

        } catch (Exception $e) {
            error_log("Upload file error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Upload failed'];
        }
    }

    /**
     * Get media library
     */
    public function getMediaLibrary($page = 1, $limit = 20, $type = null) {
        try {
            $offset = ($page - 1) * $limit;
            $where_conditions = [];
            $params = [];

            if ($type) {
                $where_conditions[] = "mime_type LIKE ?";
                $params[] = $type . '%';
            }

            $where_clause = empty($where_conditions) ? '' : 'WHERE ' . implode(' AND ', $where_conditions);

            // Get total count
            $count_stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM media_uploads {$where_clause}");
            $count_stmt->execute($params);
            $total = $count_stmt->fetch()['total'];

            // Get media files
            $stmt = $this->conn->prepare("
                SELECT m.*, u.name as uploader_name
                FROM media_uploads m
                LEFT JOIN users u ON m.uploaded_by = u.id
                {$where_clause}
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?
            ");
            
            $params[] = $limit;
            $params[] = $offset;
            $stmt->execute($params);
            
            $media = $stmt->fetchAll();

            $result = [
                'data' => array_map(function($item) {
                    return [
                        'id' => (int)$item['id'],
                        'filename' => $item['filename'],
                        'originalName' => $item['original_name'],
                        'url' => $item['file_path'],
                        'fileSize' => (int)$item['file_size'],
                        'mimeType' => $item['mime_type'],
                        'altText' => $item['alt_text'],
                        'caption' => $item['caption'],
                        'uploaderName' => $item['uploader_name'],
                        'createdAt' => $item['created_at']
                    ];
                }, $media),
                'page' => (int)$page,
                'totalPages' => (int)ceil($total / $limit),
                'totalItems' => (int)$total
            ];

            return $result;

        } catch (Exception $e) {
            error_log("Get media library error: " . $e->getMessage());
            return ['data' => [], 'page' => 1, 'totalPages' => 0, 'totalItems' => 0];
        }
    }

    /**
     * Delete media file
     */
    public function deleteMedia($id) {
        try {
            // Get file info
            $stmt = $this->conn->prepare("SELECT filename, file_path FROM media_uploads WHERE id = ?");
            $stmt->execute([$id]);
            $media = $stmt->fetch();

            if (!$media) {
                return ['success' => false, 'message' => 'Media not found'];
            }

            // Delete from database
            $stmt = $this->conn->prepare("DELETE FROM media_uploads WHERE id = ?");
            $stmt->execute([$id]);

            // Delete physical file
            $fullPath = $this->upload_path . $media['filename'];
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete media error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete media'];
        }
    }

    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'message' => 'Upload error occurred'];
        }

        if ($file['size'] > $this->max_file_size) {
            return ['valid' => false, 'message' => 'File too large (max 10MB)'];
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowed_types)) {
            return ['valid' => false, 'message' => 'File type not allowed'];
        }

        // Additional security checks
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
            'video/mp4', 'video/webm', 'application/pdf'
        ];

        if (!in_array($mimeType, $allowedMimes)) {
            return ['valid' => false, 'message' => 'Invalid file type'];
        }

        return ['valid' => true];
    }

    /**
     * Update media metadata
     */
    public function updateMediaMetadata($id, $altText, $caption) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE media_uploads 
                SET alt_text = ?, caption = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$altText, $caption, $id]);

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update media metadata error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update metadata'];
        }
    }
}