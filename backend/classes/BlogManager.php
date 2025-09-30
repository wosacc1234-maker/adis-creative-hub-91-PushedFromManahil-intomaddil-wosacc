<?php
/**
 * Blog Management Class
 * Handles CRUD operations for blog posts
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class BlogManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get paginated blogs
     */
    public function getBlogs($page = 1, $limit = 10, $category = null, $search = null) {
        $cache_key = "blogs_page_{$page}_limit_{$limit}_cat_" . ($category ?? 'all') . "_search_" . md5($search ?? '');
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $offset = ($page - 1) * $limit;
            $where_conditions = ["published = 1"];
            $params = [];

            if ($category) {
                $where_conditions[] = "category = ?";
                $params[] = $category;
            }

            if ($search) {
                $where_conditions[] = "(MATCH(title, excerpt, content) AGAINST(? IN NATURAL LANGUAGE MODE) OR tags LIKE ?)";
                $params[] = $search;
                $params[] = "%{$search}%";
            }

            $where_clause = implode(' AND ', $where_conditions);

            // Get total count
            $count_stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM blogs WHERE {$where_clause}");
            $count_stmt->execute($params);
            $total = $count_stmt->fetch()['total'];

            // Get blogs
            $stmt = $this->conn->prepare("
                SELECT id, title, slug, excerpt, category, author_name, author_avatar, author_bio,
                       featured_image, tags, featured, views, likes, published_at as date,
                       CONCAT(CEIL(CHAR_LENGTH(content) / 200), ' min read') as read_time
                FROM blogs 
                WHERE {$where_clause}
                ORDER BY featured DESC, published_at DESC
                LIMIT ? OFFSET ?
            ");
            
            $params[] = $limit;
            $params[] = $offset;
            $stmt->execute($params);
            
            $blogs = $stmt->fetchAll();

            // Format response
            $formatted_blogs = array_map(function($blog) {
                return [
                    'id' => (int)$blog['id'],
                    'title' => $blog['title'],
                    'slug' => $blog['slug'],
                    'excerpt' => $blog['excerpt'],
                    'category' => $blog['category'],
                    'author' => [
                        'name' => $blog['author_name'],
                        'avatar' => $blog['author_avatar'],
                        'bio' => $blog['author_bio']
                    ],
                    'date' => $blog['date'],
                    'readTime' => $blog['read_time'],
                    'featuredImage' => $blog['featured_image'],
                    'tags' => json_decode($blog['tags'] ?? '[]'),
                    'featured' => (bool)$blog['featured'],
                    'views' => (int)$blog['views'],
                    'likes' => (int)$blog['likes']
                ];
            }, $blogs);

            $result = [
                'data' => $formatted_blogs,
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
            error_log("Get blogs error: " . $e->getMessage());
            throw new Exception("Failed to fetch blogs");
        }
    }

    /**
     * Get single blog by ID or slug
     */
    public function getBlogById($identifier) {
        $cache_key = "blog_" . $identifier;
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM blogs 
                WHERE (id = ? OR slug = ?) AND published = 1
            ");
            $stmt->execute([$identifier, $identifier]);
            
            $blog = $stmt->fetch();
            
            if (!$blog) {
                return null;
            }

            // Increment view count
            $this->incrementViews($blog['id']);

            $formatted_blog = [
                'id' => (int)$blog['id'],
                'title' => $blog['title'],
                'slug' => $blog['slug'],
                'excerpt' => $blog['excerpt'],
                'content' => $blog['content'],
                'category' => $blog['category'],
                'author' => [
                    'name' => $blog['author_name'],
                    'avatar' => $blog['author_avatar'],
                    'bio' => $blog['author_bio']
                ],
                'date' => $blog['published_at'],
                'readTime' => ceil(strlen($blog['content']) / 200) . ' min read',
                'featuredImage' => $blog['featured_image'],
                'tags' => json_decode($blog['tags'] ?? '[]'),
                'featured' => (bool)$blog['featured'],
                'views' => (int)$blog['views'] + 1,
                'likes' => (int)$blog['likes']
            ];

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $formatted_blog, CACHE_TTL);
            }

            return $formatted_blog;

        } catch (Exception $e) {
            error_log("Get blog error: " . $e->getMessage());
            throw new Exception("Failed to fetch blog");
        }
    }

    /**
     * Create new blog post (admin only)
     */
    public function createBlog($data) {
        try {
            $slug = $this->generateSlug($data['title']);
            
            $stmt = $this->conn->prepare("
                INSERT INTO blogs (title, slug, excerpt, content, category, featured_image, tags, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['title'],
                $slug,
                $data['excerpt'],
                $data['content'],
                $data['category'],
                $data['featured_image'],
                json_encode($data['tags'] ?? []),
                $data['featured'] ?? false
            ]);

            $blog_id = $this->conn->lastInsertId();
            
            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->clearPattern('blogs_*');
            }

            return ['success' => true, 'id' => $blog_id];

        } catch (Exception $e) {
            error_log("Create blog error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create blog'];
        }
    }

    /**
     * Update blog post
     */
    public function updateBlog($id, $data) {
        try {
            $slug = isset($data['title']) ? $this->generateSlug($data['title']) : null;
            
            $fields = [];
            $params = [];
            
            foreach (['title', 'excerpt', 'content', 'category', 'featured_image', 'featured'] as $field) {
                if (isset($data[$field])) {
                    $fields[] = "{$field} = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (isset($data['tags'])) {
                $fields[] = "tags = ?";
                $params[] = json_encode($data['tags']);
            }
            
            if ($slug) {
                $fields[] = "slug = ?";
                $params[] = $slug;
            }
            
            $fields[] = "updated_at = NOW()";
            $params[] = $id;

            $stmt = $this->conn->prepare("
                UPDATE blogs SET " . implode(', ', $fields) . " WHERE id = ?
            ");
            $stmt->execute($params);

            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->clearPattern('blogs_*');
                $this->cache->delete("blog_{$id}");
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update blog error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update blog'];
        }
    }

    /**
     * Delete blog post
     */
    public function deleteBlog($id) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM blogs WHERE id = ?");
            $stmt->execute([$id]);

            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->clearPattern('blogs_*');
                $this->cache->delete("blog_{$id}");
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete blog error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete blog'];
        }
    }

    /**
     * Increment blog views
     */
    private function incrementViews($blog_id) {
        try {
            $stmt = $this->conn->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
            $stmt->execute([$blog_id]);
        } catch (Exception $e) {
            error_log("Increment views error: " . $e->getMessage());
        }
    }

    /**
     * Generate URL-friendly slug
     */
    private function generateSlug($title) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        
        // Check for duplicates
        $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM blogs WHERE slug LIKE ?");
        $stmt->execute(["{$slug}%"]);
        $count = $stmt->fetch()['count'];
        
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }
        
        return $slug;
    }

    /**
     * Get blog categories
     */
    public function getCategories() {
        try {
            $stmt = $this->conn->prepare("
                SELECT category, COUNT(*) as count 
                FROM blogs 
                WHERE published = 1 
                GROUP BY category 
                ORDER BY count DESC
            ");
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch (Exception $e) {
            error_log("Get categories error: " . $e->getMessage());
            return [];
        }
    }
}