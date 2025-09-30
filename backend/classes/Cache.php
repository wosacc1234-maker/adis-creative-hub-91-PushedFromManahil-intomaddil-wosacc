<?php
/**
 * Simple File-based Cache Class
 * Provides caching functionality for improved performance
 */

class Cache {
    private $cache_dir;

    public function __construct() {
        $this->cache_dir = __DIR__ . '/../cache/';
        if (!is_dir($this->cache_dir)) {
            mkdir($this->cache_dir, 0755, true);
        }
    }

    /**
     * Get cached data
     */
    public function get($key) {
        if (!CACHE_ENABLED) return null;
        
        $file = $this->cache_dir . md5($key) . '.cache';
        
        if (!file_exists($file)) {
            return null;
        }

        $data = file_get_contents($file);
        $cache_data = unserialize($data);

        if ($cache_data['expires'] < time()) {
            unlink($file);
            return null;
        }

        return $cache_data['data'];
    }

    /**
     * Set cache data
     */
    public function set($key, $data, $ttl = CACHE_TTL) {
        if (!CACHE_ENABLED) return false;
        
        $file = $this->cache_dir . md5($key) . '.cache';
        
        $cache_data = [
            'data' => $data,
            'expires' => time() + $ttl
        ];

        return file_put_contents($file, serialize($cache_data)) !== false;
    }

    /**
     * Delete cached data
     */
    public function delete($key) {
        $file = $this->cache_dir . md5($key) . '.cache';
        
        if (file_exists($file)) {
            return unlink($file);
        }
        
        return true;
    }

    /**
     * Clear cache by pattern
     */
    public function clearPattern($pattern) {
        $files = glob($this->cache_dir . '*.cache');
        $cleared = 0;
        
        foreach ($files as $file) {
            $key = basename($file, '.cache');
            if (strpos($key, md5($pattern)) !== false) {
                unlink($file);
                $cleared++;
            }
        }
        
        return $cleared;
    }

    /**
     * Clear all cache
     */
    public function clearAll() {
        $files = glob($this->cache_dir . '*.cache');
        $cleared = 0;
        
        foreach ($files as $file) {
            unlink($file);
            $cleared++;
        }
        
        return $cleared;
    }
}