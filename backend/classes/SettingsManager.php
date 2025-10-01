<?php
/**
 * Settings Manager Class
 * Handles global site settings and configuration
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Cache.php';

class SettingsManager {
    private $db;
    private $conn;
    private $cache;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->cache = new Cache();
    }

    /**
     * Get all settings grouped by category
     */
    public function getAllSettings() {
        $cache_key = 'all_settings';
        
        if (CACHE_ENABLED) {
            $cached = $this->cache->get($cache_key);
            if ($cached) return $cached;
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT setting_key, setting_value, setting_type, category, description
                FROM settings 
                ORDER BY category, setting_key
            ");
            $stmt->execute();
            $settings = $stmt->fetchAll();

            $grouped = [];
            foreach ($settings as $setting) {
                $category = $setting['category'];
                if (!isset($grouped[$category])) {
                    $grouped[$category] = [];
                }
                
                $value = $setting['setting_value'];
                
                // Parse value based on type
                switch ($setting['setting_type']) {
                    case 'json':
                        $value = json_decode($value, true);
                        break;
                    case 'boolean':
                        $value = $value === 'true';
                        break;
                    case 'number':
                        $value = is_numeric($value) ? (float)$value : 0;
                        break;
                }
                
                $grouped[$category][$setting['setting_key']] = [
                    'value' => $value,
                    'type' => $setting['setting_type'],
                    'description' => $setting['description']
                ];
            }

            if (CACHE_ENABLED) {
                $this->cache->set($cache_key, $grouped, CACHE_TTL);
            }

            return $grouped;

        } catch (Exception $e) {
            error_log("Get settings error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get settings by category
     */
    public function getSettingsByCategory($category) {
        try {
            $stmt = $this->conn->prepare("
                SELECT setting_key, setting_value, setting_type, description
                FROM settings 
                WHERE category = ?
                ORDER BY setting_key
            ");
            $stmt->execute([$category]);
            $settings = $stmt->fetchAll();

            $result = [];
            foreach ($settings as $setting) {
                $value = $setting['setting_value'];
                
                switch ($setting['setting_type']) {
                    case 'json':
                        $value = json_decode($value, true);
                        break;
                    case 'boolean':
                        $value = $value === 'true';
                        break;
                    case 'number':
                        $value = is_numeric($value) ? (float)$value : 0;
                        break;
                }
                
                $result[$setting['setting_key']] = [
                    'value' => $value,
                    'type' => $setting['setting_type'],
                    'description' => $setting['description']
                ];
            }

            return $result;

        } catch (Exception $e) {
            error_log("Get settings by category error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get single setting value
     */
    public function getSetting($key, $default = null) {
        try {
            $stmt = $this->conn->prepare("
                SELECT setting_value, setting_type 
                FROM settings 
                WHERE setting_key = ?
            ");
            $stmt->execute([$key]);
            $setting = $stmt->fetch();

            if (!$setting) {
                return $default;
            }

            $value = $setting['setting_value'];
            
            switch ($setting['setting_type']) {
                case 'json':
                    return json_decode($value, true);
                case 'boolean':
                    return $value === 'true';
                case 'number':
                    return is_numeric($value) ? (float)$value : 0;
                default:
                    return $value;
            }

        } catch (Exception $e) {
            error_log("Get setting error: " . $e->getMessage());
            return $default;
        }
    }

    /**
     * Update setting value
     */
    public function updateSetting($key, $value, $type = 'text') {
        try {
            // Convert value based on type
            $stored_value = $value;
            switch ($type) {
                case 'json':
                    $stored_value = json_encode($value);
                    break;
                case 'boolean':
                    $stored_value = $value ? 'true' : 'false';
                    break;
                case 'number':
                    $stored_value = (string)$value;
                    break;
            }

            $stmt = $this->conn->prepare("
                UPDATE settings 
                SET setting_value = ?, setting_type = ?, updated_at = NOW()
                WHERE setting_key = ?
            ");
            $stmt->execute([$stored_value, $type, $key]);

            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->delete('all_settings');
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Update setting error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update setting'];
        }
    }

    /**
     * Create new setting
     */
    public function createSetting($key, $value, $type, $category, $description = '') {
        try {
            $stored_value = $value;
            switch ($type) {
                case 'json':
                    $stored_value = json_encode($value);
                    break;
                case 'boolean':
                    $stored_value = $value ? 'true' : 'false';
                    break;
                case 'number':
                    $stored_value = (string)$value;
                    break;
            }

            $stmt = $this->conn->prepare("
                INSERT INTO settings (setting_key, setting_value, setting_type, category, description)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$key, $stored_value, $type, $category, $description]);

            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->delete('all_settings');
            }

            return ['success' => true, 'id' => $this->conn->lastInsertId()];

        } catch (Exception $e) {
            error_log("Create setting error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create setting'];
        }
    }

    /**
     * Delete setting
     */
    public function deleteSetting($key) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM settings WHERE setting_key = ?");
            $stmt->execute([$key]);

            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->delete('all_settings');
            }

            return ['success' => true];

        } catch (Exception $e) {
            error_log("Delete setting error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete setting'];
        }
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdateSettings($settings) {
        try {
            $this->conn->beginTransaction();

            foreach ($settings as $key => $data) {
                $value = $data['value'];
                $type = $data['type'] ?? 'text';
                
                $stored_value = $value;
                switch ($type) {
                    case 'json':
                        $stored_value = json_encode($value);
                        break;
                    case 'boolean':
                        $stored_value = $value ? 'true' : 'false';
                        break;
                    case 'number':
                        $stored_value = (string)$value;
                        break;
                }

                $stmt = $this->conn->prepare("
                    UPDATE settings 
                    SET setting_value = ?, setting_type = ?, updated_at = NOW()
                    WHERE setting_key = ?
                ");
                $stmt->execute([$stored_value, $type, $key]);
            }

            $this->conn->commit();

            // Clear cache
            if (CACHE_ENABLED) {
                $this->cache->delete('all_settings');
            }

            return ['success' => true];

        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Bulk update settings error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update settings'];
        }
    }
}