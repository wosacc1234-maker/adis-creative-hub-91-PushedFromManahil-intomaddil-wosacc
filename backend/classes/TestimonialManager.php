<?php
/**
 * Testimonial Manager Class
 * Handles CRUD operations for testimonials
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class TestimonialManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get testimonials with optional filtering
     */
    public function getTestimonials($featured = null, $limit = 50) {
        $cache_key = "testimonials_featured_" . ($featured ?? 'all') . "_limit_" . $limit;
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $where_conditions = ["published = 1"];
            $params = [];

            if ($featured !== null) {
                $where_conditions[] = "featured = ?";
                $params[] = $featured === 'true' ? 1 : 0;
            }

            $where_clause = implode(' AND ', $where_conditions);
            $params[] = $limit;

            $stmt = $this->conn->prepare("
                SELECT id, name, role, company, content, rating, avatar, 
                       project_type, verified, featured, created_at as date
                FROM testimonials 
                WHERE {$where_clause}
                ORDER BY featured DESC, rating DESC, created_at DESC
                LIMIT ?
            ");
            $stmt->execute($params);
            $testimonials = $stmt->fetchAll();

            $result = array_map(function($testimonial) {
                return [
                    'id' => (int)$testimonial['id'],
                    'name' => $testimonial['name'],
                    'role' => $testimonial['role'],
                    'company' => $testimonial['company'],
                    'content' => $testimonial['content'],
                    'rating' => (int)$testimonial['rating'],
                    'avatar' => $testimonial['avatar'],
                    'date' => $testimonial['date'],
                    'projectType' => $testimonial['project_type'],
                    'verified' => (bool)$testimonial['verified']
                ];
            }, $testimonials);

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get testimonials error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get single testimonial by ID
     */
    public function getTestimonialById($id) {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM testimonials 
                WHERE id = ? AND published = 1
            ");
            $stmt->execute([$id]);
            
            $testimonial = $stmt->fetch();
            
            if (!$testimonial) {
                return null;
            }

            return [
                'id' => (int)$testimonial['id'],
                'name' => $testimonial['name'],
                'role' => $testimonial['role'],
                'company' => $testimonial['company'],
                'content' => $testimonial['content'],
                'rating' => (int)$testimonial['rating'],
                'avatar' => $testimonial['avatar'],
                'date' => $testimonial['created_at'],
                'projectType' => $testimonial['project_type'],
                'verified' => (bool)$testimonial['verified']
            ];

        } catch (Exception $e) {
            error_log("Get testimonial error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create new testimonial
     */
    public function createTestimonial($data) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO testimonials (name, role, company, content, rating, avatar, 
                                        project_type, verified, featured, status, publish_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'],
                $data['role'] ?? '',
                $data['company'] ?? '',
                $data['content'],
                $data['rating'],
                $data['avatar'] ?? '/api/placeholder/80/80',
                $data['projectType'] ?? '',
                $data['verified'] ?? false,
                $data['featured'] ?? false,
                $data['status'] ?? 'published',
                $data['publishDate'] ?? null
            ]);

            $testimonial_id = $this->conn->lastInsertId();
            
            // Clear cache
            $this->clearTestimonialCache();

            return ['success' => true, 'id' => $testimonial_id];

        } catch (Exception $e) {
            error_log("Create testimonial error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create testimonial'];
        }
    }

    /**
     * Update testimonial
     */
    public function updateTestimonial($id, $data) {
        try {
            $fields = [];
            $params = [];
            
            $allowed_fields = [
                'name', 'role', 'company', 'content', 'rating', 'avatar',
                'project_type', 'verified', 'featured', 'status', 'publish_date', 'unpublish_date'
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
                UPDATE testimonials SET " . implode(', ', $fields) . " WHERE id = ?
            ");
            $stmt->execute($params);

            // Clear cache
            $this->clearTestimonialCache();

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update testimonial error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update testimonial'];
        }
    }

    /**
     * Delete testimonial
     */
    public function deleteTestimonial($id) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE testimonials SET published = FALSE 
                WHERE id = ?
            ");
            $stmt->execute([$id]);

            // Clear cache
            $this->clearTestimonialCache();

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete testimonial error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete testimonial'];
        }
    }

    /**
     * Clear testimonial cache
     */
    private function clearTestimonialCache() {
        if (CACHE_ENABLED) {
            $this->cache->clearPattern('testimonials_*');
        }
    }
}