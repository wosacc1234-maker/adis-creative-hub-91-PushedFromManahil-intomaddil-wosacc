<?php
/**
 * Authentication Class
 * Handles user authentication, JWT tokens, and session management
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Register new user
     */
    public function register($email, $password, $name) {
        try {
            // Check if user already exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Email already registered'];
            }

            // Hash password
            $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
            
            // Generate referral code
            $referral_code = strtoupper(substr($name, 0, 3) . rand(1000, 9999));

            // Insert user
            $stmt = $this->conn->prepare("
                INSERT INTO users (email, password_hash, name) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$email, $password_hash, $name]);
            
            $user_id = $this->conn->lastInsertId();

            // Initialize user tokens
            $stmt = $this->conn->prepare("
                INSERT INTO user_tokens (user_id, balance, total_earned) 
                VALUES (?, 100, 100)
            ");
            $stmt->execute([$user_id]);

            // Initialize user streak
            $stmt = $this->conn->prepare("
                INSERT INTO user_streaks (user_id, current_streak, last_check_in) 
                VALUES (?, 1, CURDATE())
            ");
            $stmt->execute([$user_id]);

            // Create referral entry
            $stmt = $this->conn->prepare("
                INSERT INTO referrals (referrer_id, referral_code) 
                VALUES (?, ?)
            ");
            $stmt->execute([$user_id, $referral_code]);

            // Add welcome tokens to history
            $stmt = $this->conn->prepare("
                INSERT INTO token_history (user_id, type, amount, description) 
                VALUES (?, 'earned', 100, 'Welcome bonus')
            ");
            $stmt->execute([$user_id]);

            // Initialize achievements
            $this->initializeUserAchievements($user_id);

            return [
                'success' => true, 
                'message' => 'Account created successfully',
                'user_id' => $user_id
            ];

        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Registration failed'];
        }
    }

    /**
     * Login user
     */
    public function login($email, $password) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, email, password_hash, name, role, avatar, verified 
                FROM users 
                WHERE email = ?
            ");
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }

            $user = $stmt->fetch();

            if (!password_verify($password, $user['password_hash'])) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }

            // Update last login
            $stmt = $this->conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);

            // Update login streak
            $this->updateLoginStreak($user['id']);

            // Generate JWT token
            $token = $this->generateJWT($user);

            return [
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role'],
                    'avatar' => $user['avatar'],
                    'verified' => (bool)$user['verified']
                ]
            ];

        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Login failed'];
        }
    }

    /**
     * Verify JWT token
     */
    public function verifyToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            return [
                'success' => true,
                'user_id' => $decoded->user_id,
                'role' => $decoded->role
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Invalid token'];
        }
    }

    /**
     * Generate JWT token
     */
    private function generateJWT($user) {
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + JWT_EXPIRY
        ];

        return JWT::encode($payload, JWT_SECRET, 'HS256');
    }

    /**
     * Update user login streak
     */
    private function updateLoginStreak($user_id) {
        $stmt = $this->conn->prepare("
            SELECT current_streak, last_check_in 
            FROM user_streaks 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $streak = $stmt->fetch();

        if (!$streak) {
            // Create new streak record
            $stmt = $this->conn->prepare("
                INSERT INTO user_streaks (user_id, current_streak, last_check_in) 
                VALUES (?, 1, CURDATE())
            ");
            $stmt->execute([$user_id]);
            return;
        }

        $today = date('Y-m-d');
        $last_check_in = $streak['last_check_in'];
        
        if ($last_check_in === $today) {
            // Already checked in today
            return;
        }

        $yesterday = date('Y-m-d', strtotime('-1 day'));
        
        if ($last_check_in === $yesterday) {
            // Consecutive day - increment streak
            $new_streak = $streak['current_streak'] + 1;
            
            // Check for milestone rewards
            $this->checkStreakMilestones($user_id, $new_streak);
            
            $stmt = $this->conn->prepare("
                UPDATE user_streaks 
                SET current_streak = ?, longest_streak = GREATEST(longest_streak, ?), last_check_in = CURDATE()
                WHERE user_id = ?
            ");
            $stmt->execute([$new_streak, $new_streak, $user_id]);
        } else {
            // Streak broken - reset to 1
            $stmt = $this->conn->prepare("
                UPDATE user_streaks 
                SET current_streak = 1, last_check_in = CURDATE()
                WHERE user_id = ?
            ");
            $stmt->execute([$user_id]);
        }
    }

    /**
     * Check and award streak milestone rewards
     */
    private function checkStreakMilestones($user_id, $streak) {
        $milestones = [7 => 50, 14 => 100, 30 => 250, 60 => 500, 90 => 1000];
        
        if (isset($milestones[$streak])) {
            $reward = $milestones[$streak];
            
            // Add tokens
            $stmt = $this->conn->prepare("
                UPDATE user_tokens 
                SET balance = balance + ?, total_earned = total_earned + ?
                WHERE user_id = ?
            ");
            $stmt->execute([$reward, $reward, $user_id]);

            // Add to history
            $stmt = $this->conn->prepare("
                INSERT INTO token_history (user_id, type, amount, description) 
                VALUES (?, 'earned', ?, ?)
            ");
            $stmt->execute([$user_id, $reward, "{$streak}-day login streak bonus"]);

            // Create notification
            $stmt = $this->conn->prepare("
                INSERT INTO notifications (user_id, type, title, message, icon) 
                VALUES (?, 'milestone', 'Streak Milestone!', ?, 'Flame')
            ");
            $stmt->execute([$user_id, "You've earned {$reward} tokens for your {$streak}-day streak!"]);
        }
    }

    /**
     * Initialize user achievements
     */
    private function initializeUserAchievements($user_id) {
        $stmt = $this->conn->prepare("
            INSERT INTO user_achievements (user_id, achievement_id, progress) 
            SELECT ?, id, 0 FROM achievements WHERE active = TRUE
        ");
        $stmt->execute([$user_id]);
    }

    /**
     * Get current user data
     */
    public function getCurrentUser($user_id) {
        try {
            $stmt = $this->conn->prepare("
                SELECT u.*, ut.balance, ut.total_earned, ut.total_spent,
                       us.current_streak, us.longest_streak, us.last_check_in,
                       r.referral_code
                FROM users u
                LEFT JOIN user_tokens ut ON u.id = ut.user_id
                LEFT JOIN user_streaks us ON u.id = us.user_id
                LEFT JOIN referrals r ON u.id = r.referrer_id
                WHERE u.id = ?
            ");
            $stmt->execute([$user_id]);
            
            return $stmt->fetch();
        } catch (Exception $e) {
            error_log("Get user error: " . $e->getMessage());
            return null;
        }
    }
}