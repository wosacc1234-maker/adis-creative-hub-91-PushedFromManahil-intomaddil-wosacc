<?php
/**
 * Carousel Manager Class
 * Handles carousel slides management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class CarouselManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get carousel slides by name
     */
    public function getCarouselSlides($carouselName) {
        $cache_key = "carousel_" . $carouselName;
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT id, title, subtitle, description, image_url, video_url,
                       cta_text, cta_url, sort_order
                FROM carousel_slides 
                WHERE carousel_name = ? AND active = TRUE
                ORDER BY sort_order ASC
            ");
            $stmt->execute([$carouselName]);
            $slides = $stmt->fetchAll();

            $result = array_map(function($slide) {
                return [
                    'id' => (int)$slide['id'],
                    'title' => $slide['title'],
                    'subtitle' => $slide['subtitle'],
                    'description' => $slide['description'],
                    'imageUrl' => $slide['image_url'],
                    'videoUrl' => $slide['video_url'],
                    'ctaText' => $slide['cta_text'],
                    'ctaUrl' => $slide['cta_url'],
                    'sortOrder' => (int)$slide['sort_order']
                ];
            }, $slides);

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get carousel slides error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all carousels for admin
     */
    public function getAllCarousels() {
        try {
            $stmt = $this->conn->prepare("
                SELECT carousel_name, COUNT(*) as slide_count
                FROM carousel_slides 
                WHERE active = TRUE
                GROUP BY carousel_name
                ORDER BY carousel_name
            ");
            $stmt->execute();
            $carousels = $stmt->fetchAll();

            $result = [];
            foreach ($carousels as $carousel) {
                $slides = $this->getCarouselSlides($carousel['carousel_name']);
                $result[] = [
                    'name' => $carousel['carousel_name'],
                    'slideCount' => (int)$carousel['slide_count'],
                    'slides' => $slides
                ];
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get all carousels error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create carousel slide
     */
    public function createSlide($data) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO carousel_slides (carousel_name, title, subtitle, description,
                                           image_url, video_url, cta_text, cta_url, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['carouselName'],
                $data['title'] ?? '',
                $data['subtitle'] ?? '',
                $data['description'] ?? '',
                $data['imageUrl'] ?? '',
                $data['videoUrl'] ?? '',
                $data['ctaText'] ?? '',
                $data['ctaUrl'] ?? '',
                $data['sortOrder'] ?? 0
            ]);

            $slide_id = $this->conn->lastInsertId();
            
            // Clear cache
            $this->clearCarouselCache($data['carouselName']);

            return ['success' => true, 'id' => $slide_id];

        } catch (Exception $e) {
            error_log("Create slide error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create slide'];
        }
    }

    /**
     * Update carousel slide
     */
    public function updateSlide($id, $data) {
        try {
            $fields = [];
            $params = [];
            
            $allowed_fields = [
                'title', 'subtitle', 'description', 'image_url', 'video_url',
                'cta_text', 'cta_url', 'sort_order', 'active'
            ];

            foreach ($allowed_fields as $field) {
                $camelField = lcfirst(str_replace('_', '', ucwords($field, '_')));
                if (isset($data[$camelField])) {
                    $fields[] = "{$field} = ?";
                    $params[] = $data[$camelField];
                }
            }

            if (empty($fields)) {
                return ['success' => false, 'message' => 'No fields to update'];
            }

            $fields[] = "updated_at = NOW()";
            $params[] = $id;

            $stmt = $this->conn->prepare("
                UPDATE carousel_slides SET " . implode(', ', $fields) . " WHERE id = ?
            ");
            $stmt->execute($params);

            // Get carousel name to clear cache
            $stmt = $this->conn->prepare("SELECT carousel_name FROM carousel_slides WHERE id = ?");
            $stmt->execute([$id]);
            $carousel = $stmt->fetch();
            
            if ($carousel) {
                $this->clearCarouselCache($carousel['carousel_name']);
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update slide error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update slide'];
        }
    }

    /**
     * Delete carousel slide
     */
    public function deleteSlide($id) {
        try {
            // Get carousel name before deletion
            $stmt = $this->conn->prepare("SELECT carousel_name FROM carousel_slides WHERE id = ?");
            $stmt->execute([$id]);
            $carousel = $stmt->fetch();

            $stmt = $this->conn->prepare("DELETE FROM carousel_slides WHERE id = ?");
            $stmt->execute([$id]);

            if ($carousel) {
                $this->clearCarouselCache($carousel['carousel_name']);
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete slide error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete slide'];
        }
    }

    /**
     * Reorder carousel slides
     */
    public function reorderSlides($carouselName, $slideOrders) {
        try {
            $this->conn->beginTransaction();

            foreach ($slideOrders as $slideId => $sortOrder) {
                $stmt = $this->conn->prepare("
                    UPDATE carousel_slides 
                    SET sort_order = ? 
                    WHERE id = ? AND carousel_name = ?
                ");
                $stmt->execute([$sortOrder, $slideId, $carouselName]);
            }

            $this->conn->commit();

            // Clear cache
            $this->clearCarouselCache($carouselName);

            return ['success' => true];

        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Reorder slides error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to reorder slides'];
        }
    }

    /**
     * Clear carousel cache
     */
    private function clearCarouselCache($carouselName) {
        if (CACHE_ENABLED) {
            $this->cache->delete("carousel_" . $carouselName);
        }
    }
}