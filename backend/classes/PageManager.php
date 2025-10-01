<?php
/**
 * Page Manager Class
 * Handles dynamic page creation and management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class PageManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get all pages for navigation
     */
    public function getNavigationPages() {
        $cache_key = 'navigation_pages';
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT id, title, slug, nav_label, sort_order
                FROM pages 
                WHERE status = 'published' AND show_in_nav = TRUE
                ORDER BY sort_order ASC
            ");
            $stmt->execute();
            $pages = $stmt->fetchAll();

            $result = array_map(function($page) {
                return [
                    'id' => (int)$page['id'],
                    'title' => $page['title'],
                    'slug' => $page['slug'],
                    'navLabel' => $page['nav_label'] ?: $page['title'],
                    'sortOrder' => (int)$page['sort_order']
                ];
            }, $pages);

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get navigation pages error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get page by slug with full content
     */
    public function getPageBySlug($slug) {
        $cache_key = "page_" . $slug;
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM pages 
                WHERE slug = ? AND status = 'published'
                AND (publish_date IS NULL OR publish_date <= NOW())
                AND (unpublish_date IS NULL OR unpublish_date > NOW())
            ");
            $stmt->execute([$slug]);
            $page = $stmt->fetch();

            if (!$page) {
                return null;
            }

            $result = [
                'id' => (int)$page['id'],
                'title' => $page['title'],
                'slug' => $page['slug'],
                'metaTitle' => $page['meta_title'],
                'metaDescription' => $page['meta_description'],
                'metaKeywords' => $page['meta_keywords'],
                'ogTitle' => $page['og_title'],
                'ogDescription' => $page['og_description'],
                'ogImage' => $page['og_image'],
                'schemaType' => $page['schema_type'],
                'sections' => json_decode($page['sections'] ?? '[]', true),
                'status' => $page['status'],
                'publishDate' => $page['publish_date'],
                'unpublishDate' => $page['unpublish_date']
            ];

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get page error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all pages for admin management
     */
    public function getAllPages() {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, title, slug, status, sort_order, show_in_nav, nav_label,
                       publish_date, unpublish_date, created_at, updated_at
                FROM pages 
                ORDER BY sort_order ASC, title ASC
            ");
            $stmt->execute();
            $pages = $stmt->fetchAll();

            return array_map(function($page) {
                return [
                    'id' => (int)$page['id'],
                    'title' => $page['title'],
                    'slug' => $page['slug'],
                    'status' => $page['status'],
                    'sortOrder' => (int)$page['sort_order'],
                    'showInNav' => (bool)$page['show_in_nav'],
                    'navLabel' => $page['nav_label'],
                    'publishDate' => $page['publish_date'],
                    'unpublishDate' => $page['unpublish_date'],
                    'createdAt' => $page['created_at'],
                    'updatedAt' => $page['updated_at']
                ];
            }, $pages);

        } catch (Exception $e) {
            error_log("Get all pages error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create new page
     */
    public function createPage($data) {
        try {
            $slug = $this->generateSlug($data['title']);
            
            $stmt = $this->conn->prepare("
                INSERT INTO pages (title, slug, meta_title, meta_description, meta_keywords,
                                 og_title, og_description, og_image, schema_type, sections,
                                 status, sort_order, show_in_nav, nav_label, publish_date, unpublish_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['title'],
                $slug,
                $data['metaTitle'] ?? $data['title'],
                $data['metaDescription'] ?? '',
                $data['metaKeywords'] ?? '',
                $data['ogTitle'] ?? $data['title'],
                $data['ogDescription'] ?? '',
                $data['ogImage'] ?? '',
                $data['schemaType'] ?? 'WebPage',
                json_encode($data['sections'] ?? []),
                $data['status'] ?? 'draft',
                $data['sortOrder'] ?? 0,
                $data['showInNav'] ?? true,
                $data['navLabel'] ?? $data['title'],
                $data['publishDate'] ?? null,
                $data['unpublishDate'] ?? null
            ]);

            $page_id = $this->conn->lastInsertId();
            
            // Clear cache
            $this->clearPageCache();

            return ['success' => true, 'id' => $page_id, 'slug' => $slug];

        } catch (Exception $e) {
            error_log("Create page error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create page'];
        }
    }

    /**
     * Update page
     */
    public function updatePage($id, $data) {
        try {
            $fields = [];
            $params = [];
            
            $allowed_fields = [
                'title', 'meta_title', 'meta_description', 'meta_keywords',
                'og_title', 'og_description', 'og_image', 'schema_type',
                'sections', 'status', 'sort_order', 'show_in_nav', 'nav_label',
                'publish_date', 'unpublish_date'
            ];

            foreach ($allowed_fields as $field) {
                $camelField = lcfirst(str_replace('_', '', ucwords($field, '_')));
                if (isset($data[$camelField])) {
                    $fields[] = "{$field} = ?";
                    
                    if ($field === 'sections') {
                        $params[] = json_encode($data[$camelField]);
                    } else {
                        $params[] = $data[$camelField];
                    }
                }
            }

            if (empty($fields)) {
                return ['success' => false, 'message' => 'No fields to update'];
            }

            $fields[] = "updated_at = NOW()";
            $params[] = $id;

            $stmt = $this->conn->prepare("
                UPDATE pages SET " . implode(', ', $fields) . " WHERE id = ?
            ");
            $stmt->execute($params);

            // Clear cache
            $this->clearPageCache();

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update page error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update page'];
        }
    }

    /**
     * Delete page
     */
    public function deletePage($id) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM pages WHERE id = ?");
            $stmt->execute([$id]);

            // Clear cache
            $this->clearPageCache();

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete page error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete page'];
        }
    }

    /**
     * Reorder pages
     */
    public function reorderPages($pageOrders) {
        try {
            $this->conn->beginTransaction();

            foreach ($pageOrders as $pageId => $sortOrder) {
                $stmt = $this->conn->prepare("
                    UPDATE pages SET sort_order = ? WHERE id = ?
                ");
                $stmt->execute([$sortOrder, $pageId]);
            }

            $this->conn->commit();

            // Clear cache
            $this->clearPageCache();

            return ['success' => true];

        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Reorder pages error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to reorder pages'];
        }
    }

    /**
     * Generate unique slug
     */
    private function generateSlug($title) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        
        $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM pages WHERE slug LIKE ?");
        $stmt->execute(["{$slug}%"]);
        $count = $stmt->fetch()['count'];
        
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }
        
        return $slug;
    }

    /**
     * Clear page-related cache
     */
    private function clearPageCache() {
        if (CACHE_ENABLED) {
            $this->cache->delete('navigation_pages');
            $this->cache->clearPattern('page_*');
        }
    }
}