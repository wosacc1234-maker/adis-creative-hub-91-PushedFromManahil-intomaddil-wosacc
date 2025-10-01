<?php
/**
 * Service Manager Class
 * Handles CRUD operations for services with enhanced features
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class ServiceManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get all services
     */
    public function getServices() {
        $cache_key = 'all_services';
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT id, name, slug, icon, tagline, description, features, 
                       pricing_tiers, delivery_time, popular
                FROM services 
                WHERE active = TRUE
                ORDER BY popular DESC, name ASC
            ");
            $stmt->execute();
            $services = $stmt->fetchAll();

            $result = array_map(function($service) {
                return [
                    'id' => (int)$service['id'],
                    'name' => $service['name'],
                    'slug' => $service['slug'],
                    'icon' => $service['icon'],
                    'tagline' => $service['tagline'],
                    'description' => $service['description'],
                    'features' => json_decode($service['features'] ?? '[]'),
                    'pricingTiers' => json_decode($service['pricing_tiers'] ?? '[]'),
                    'deliveryTime' => $service['delivery_time'],
                    'popular' => (bool)$service['popular'],
                    'testimonialIds' => [] // Will be populated from testimonials table
                ];
            }, $services);

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get services error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get single service by ID or slug
     */
    public function getServiceById($identifier) {
        $cache_key = "service_" . $identifier;
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM services 
                WHERE (id = ? OR slug = ?) AND active = TRUE
            ");
            $stmt->execute([$identifier, $identifier]);
            
            $service = $stmt->fetch();
            
            if (!$service) {
                return null;
            }

            $result = [
                'id' => (int)$service['id'],
                'name' => $service['name'],
                'slug' => $service['slug'],
                'icon' => $service['icon'],
                'tagline' => $service['tagline'],
                'description' => $service['description'],
                'features' => json_decode($service['features'] ?? '[]'),
                'pricingTiers' => json_decode($service['pricing_tiers'] ?? '[]'),
                'deliveryTime' => $service['delivery_time'],
                'popular' => (bool)$service['popular'],
                'testimonialIds' => []
            ];

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $result, CACHE_TTL);
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get service error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create new service
     */
    public function createService($data) {
        try {
            $slug = $this->generateSlug($data['name']);
            
            $stmt = $this->conn->prepare("
                INSERT INTO services (name, slug, icon, tagline, description, features, 
                                    pricing_tiers, delivery_time, popular)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'],
                $slug,
                $data['icon'] ?? 'Cog',
                $data['tagline'] ?? '',
                $data['description'],
                json_encode($data['features'] ?? []),
                json_encode($data['pricingTiers'] ?? []),
                $data['deliveryTime'] ?? '3-5 days',
                $data['popular'] ?? false
            ]);

            $service_id = $this->conn->lastInsertId();
            
            // Clear cache
            $this->clearServiceCache();

            return ['success' => true, 'id' => $service_id];

        } catch (Exception $e) {
            error_log("Create service error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create service'];
        }
    }

    /**
     * Update service
     */
    public function updateService($identifier, $data) {
        try {
            $fields = [];
            $params = [];
            
            $allowed_fields = [
                'name', 'icon', 'tagline', 'description', 'features',
                'pricing_tiers', 'delivery_time', 'popular', 'active'
            ];

            foreach ($allowed_fields as $field) {
                $camelField = lcfirst(str_replace('_', '', ucwords($field, '_')));
                if (isset($data[$camelField])) {
                    $fields[] = "{$field} = ?";
                    
                    if (in_array($field, ['features', 'pricing_tiers'])) {
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
            $params[] = $identifier;
            $params[] = $identifier;

            $stmt = $this->conn->prepare("
                UPDATE services SET " . implode(', ', $fields) . " 
                WHERE id = ? OR slug = ?
            ");
            $stmt->execute($params);

            // Clear cache
            $this->clearServiceCache();

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update service error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update service'];
        }
    }

    /**
     * Delete service
     */
    public function deleteService($identifier) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE services SET active = FALSE 
                WHERE id = ? OR slug = ?
            ");
            $stmt->execute([$identifier, $identifier]);

            // Clear cache
            $this->clearServiceCache();

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete service error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete service'];
        }
    }

    /**
     * Generate unique slug
     */
    private function generateSlug($name) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        
        $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM services WHERE slug LIKE ?");
        $stmt->execute(["{$slug}%"]);
        $count = $stmt->fetch()['count'];
        
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }
        
        return $slug;
    }

    /**
     * Clear service cache
     */
    private function clearServiceCache() {
        if (CACHE_ENABLED) {
            $this->cache->delete('all_services');
            $this->cache->clearPattern('service_*');
        }
    }
}