<?php
/**
 * Portfolio Management Class
 * Handles CRUD operations for portfolio items
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class PortfolioManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get paginated portfolio items
     */
    public function getPortfolio($page = 1, $limit = 10, $category = null) {
        $cache_key = "portfolio_page_{$page}_limit_{$limit}_cat_" . ($category ?? 'all');
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $offset = ($page - 1) * $limit;
            $where_conditions = ["published = 1"];
            $params = [];

            if ($category && $category !== 'All') {
                $where_conditions[] = "category = ?";
                $params[] = $category;
            }

            $where_clause = implode(' AND ', $where_conditions);

            // Get total count
            $count_stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM portfolio WHERE {$where_clause}");
            $count_stmt->execute($params);
            $total = $count_stmt->fetch()['total'];

            // Get portfolio items
            $stmt = $this->conn->prepare("
                SELECT id, title, slug, category, description, long_description, client, 
                       completion_date, featured_image, images, before_image, after_image,
                       tags, results, featured, views
                FROM portfolio 
                WHERE {$where_clause}
                ORDER BY featured DESC, completion_date DESC
                LIMIT ? OFFSET ?
            ");
            
            $params[] = $limit;
            $params[] = $offset;
            $stmt->execute($params);
            
            $items = $stmt->fetchAll();

            // Format response
            $formatted_items = array_map(function($item) {
                return [
                    'id' => (int)$item['id'],
                    'title' => $item['title'],
                    'slug' => $item['slug'],
                    'category' => $item['category'],
                    'description' => $item['description'],
                    'longDescription' => $item['long_description'],
                    'client' => $item['client'],
                    'completionDate' => $item['completion_date'],
                    'featuredImage' => $item['featured_image'],
                    'images' => json_decode($item['images'] ?? '[]'),
                    'beforeImage' => $item['before_image'],
                    'afterImage' => $item['after_image'],
                    'tags' => json_decode($item['tags'] ?? '[]'),
                    'results' => json_decode($item['results'] ?? '{}'),
                    'featured' => (bool)$item['featured'],
                    'views' => (int)$item['views']
                ];
            }, $items);

            $result = [
                'data' => $formatted_items,
                'page' => (int)$page,
                'totalPages' => (int)ceil($total / $limit),
                'totalItems' => (int)$total,
                'itemsPerPage' => (int)$limit
            ];

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get portfolio error: " . $e->getMessage());
            throw new Exception("Failed to fetch portfolio");
        }
    }

    /**
     * Get single portfolio item by ID or slug
     */
    public function getPortfolioById($identifier) {
        $cache_key = "portfolio_" . $identifier;
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM portfolio 
                WHERE (id = ? OR slug = ?) AND published = 1
            ");
            $stmt->execute([$identifier, $identifier]);
            
            $item = $stmt->fetch();
            
            if (!$item) {
                return null;
            }

            // Increment view count
            $this->incrementViews($item['id']);

            $formatted_item = [
                'id' => (int)$item['id'],
                'title' => $item['title'],
                'slug' => $item['slug'],
                'category' => $item['category'],
                'description' => $item['description'],
                'longDescription' => $item['long_description'],
                'client' => $item['client'],
                'completionDate' => $item['completion_date'],
                'featuredImage' => $item['featured_image'],
                'images' => json_decode($item['images'] ?? '[]'),
                'beforeImage' => $item['before_image'],
                'afterImage' => $item['after_image'],
                'tags' => json_decode($item['tags'] ?? '[]'),
                'results' => json_decode($item['results'] ?? '{}'),
                'featured' => (bool)$item['featured'],
                'views' => (int)$item['views'] + 1
            ];

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $formatted_item, CACHE_TTL);
            }

            return $formatted_item;

        } catch (Exception $e) {
            error_log("Get portfolio item error: " . $e->getMessage());
            throw new Exception("Failed to fetch portfolio item");
        }
    }

    /**
     * Create new portfolio item (admin only)
     */
    public function createPortfolioItem($data) {
        try {
            $slug = $this->generateSlug($data['title']);
            
            $stmt = $this->conn->prepare("
                INSERT INTO portfolio (title, slug, category, description, long_description, client, 
                                     completion_date, featured_image, images, before_image, after_image,
                                     tags, results, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['title'],
                $slug,
                $data['category'],
                $data['description'],
                $data['long_description'] ?? '',
                $data['client'],
                $data['completion_date'] ?? date('Y-m-d'),
                $data['featured_image'],
                json_encode($data['images'] ?? []),
                $data['before_image'] ?? null,
                $data['after_image'] ?? null,
                json_encode($data['tags'] ?? []),
                json_encode($data['results'] ?? []),
                $data['featured'] ?? false
            ]);

            $item_id = $this->conn->lastInsertId();
            
            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->clearPattern('portfolio_*');
            }

            return ['success' => true, 'id' => $item_id];

        } catch (Exception $e) {
            error_log("Create portfolio error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create portfolio item'];
        }
    }

    /**
     * Increment portfolio item views
     */
    private function incrementViews($item_id) {
        try {
            $stmt = $this->conn->prepare("UPDATE portfolio SET views = views + 1 WHERE id = ?");
            $stmt->execute([$item_id]);
        } catch (Exception $e) {
            error_log("Increment portfolio views error: " . $e->getMessage());
        }
    }

    /**
     * Generate URL-friendly slug
     */
    private function generateSlug($title) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        
        // Check for duplicates
        $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM portfolio WHERE slug LIKE ?");
        $stmt->execute(["{$slug}%"]);
        $count = $stmt->fetch()['count'];
        
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }
        
        return $slug;
    }

    /**
     * Get portfolio categories
     */
    public function getCategories() {
        try {
            $stmt = $this->conn->prepare("
                SELECT category, COUNT(*) as count 
                FROM portfolio 
                WHERE published = 1 
                GROUP BY category 
                ORDER BY count DESC
            ");
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch (Exception $e) {
            error_log("Get portfolio categories error: " . $e->getMessage());
            return [];
        }
    }
}