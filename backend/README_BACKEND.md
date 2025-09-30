# Adil GFX Backend Documentation

## Overview
Complete PHP backend system with admin panel for the Adil GFX design services platform. Built with security, performance, and scalability in mind.

## Features Implemented

### 🔐 Authentication & Security
- JWT-based authentication with secure token handling
- Password hashing using PHP's `password_hash()` with bcrypt
- Role-based access control (User vs Admin)
- CSRF protection on all forms
- Rate limiting to prevent abuse
- SQL injection prevention with prepared statements

### 📊 Database Architecture
- **Users**: Authentication, profiles, roles
- **Tokens**: Gamification system with earning/spending history
- **Streaks**: Login streak tracking with milestone rewards
- **Referrals**: Viral growth system with tracking
- **Blogs**: Content management with SEO optimization
- **Portfolio**: Project showcase with results tracking
- **Services**: Dynamic pricing and package management
- **Testimonials**: Client feedback with verification
- **Orders**: Project tracking and status management
- **Notifications**: Real-time user notifications
- **Contact**: Form submissions with auto-replies

### 🚀 Performance Optimization
- File-based caching system for frequently accessed data
- Database indexing for optimal query performance
- Pagination support for large datasets
- Optimized queries with proper JOIN strategies

### 📧 Email Integration
- Contact form auto-replies
- Admin notifications for new submissions
- Newsletter subscription confirmations
- SMTP configuration ready for production

## API Endpoints

### Authentication
```
POST /api/auth.php/register
POST /api/auth.php/login
GET  /api/auth.php/verify
```

### Blogs
```
GET    /api/blogs.php                    # Get paginated blogs
GET    /api/blogs.php/{id}               # Get single blog
POST   /api/blogs.php                    # Create blog (admin)
PUT    /api/blogs.php/{id}               # Update blog (admin)
DELETE /api/blogs.php/{id}               # Delete blog (admin)
```

### Portfolio
```
GET    /api/portfolio.php                # Get paginated portfolio
GET    /api/portfolio.php/{id}           # Get single portfolio item
POST   /api/portfolio.php                # Create item (admin)
PUT    /api/portfolio.php/{id}           # Update item (admin)
DELETE /api/portfolio.php/{id}           # Delete item (admin)
```

### Services
```
GET    /api/services.php                 # Get all services
GET    /api/services.php/{id}            # Get single service
POST   /api/services.php                 # Create service (admin)
PUT    /api/services.php/{id}            # Update service (admin)
DELETE /api/services.php/{id}            # Delete service (admin)
```

### User Profile
```
GET    /api/user/profile.php             # Get user dashboard data
PUT    /api/user/profile.php             # Update user profile
```

### Contact & Forms
```
POST   /api/contact.php                  # Submit contact form
POST   /api/newsletter.php               # Subscribe to newsletter
```

### Admin Panel
```
GET    /api/admin/stats.php              # Dashboard statistics
GET    /api/admin/activity.php           # Recent activity log
GET    /api/admin/users.php              # User management
POST   /api/admin/notifications.php      # Send notifications
```

## Installation

### 1. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE adilgfx_db;"

# Install schema and sample data
php scripts/install_database.php
```

### 4. File Permissions
```bash
# Set proper permissions
chmod 755 backend/
chmod 777 backend/cache/
chmod 777 backend/uploads/
```

### 5. Web Server Configuration

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1.php [QSA,L]
```

#### Nginx
```nginx
location /api/ {
    try_files $uri $uri.php $uri/ =404;
    fastcgi_pass php-fpm;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

## Frontend Integration

### 1. Update React Environment
```env
# .env (React project)
VITE_API_BASE_URL=https://your-domain.com/backend
VITE_USE_MOCK_DATA=false
```

### 2. API Calls Work Automatically
The existing `src/utils/api.ts` will automatically switch to live API calls when `VITE_USE_MOCK_DATA=false`.

## Security Features

### Rate Limiting
- 100 requests per hour per IP address
- Configurable limits in `.env`
- Automatic cleanup of old entries

### CORS Protection
- Whitelist of allowed origins
- Proper preflight handling
- Credential support for authenticated requests

### Input Validation
- Server-side validation for all inputs
- Email format validation
- Length constraints on all fields
- XSS prevention through proper escaping

### Authentication Security
- JWT tokens with expiration
- Secure password hashing (bcrypt cost 12)
- Session invalidation on logout
- Role-based access control

## Admin Panel Features

### Dashboard Overview
- User statistics and growth metrics
- Blog performance analytics
- Contact form submissions
- Token economy overview

### Content Management
- **Blogs**: Create, edit, delete blog posts with rich text editor
- **Portfolio**: Manage project showcase with before/after images
- **Services**: Dynamic pricing and package management
- **Testimonials**: Client feedback moderation and verification

### User Management
- View all registered users
- Reset user tokens and streaks
- Send targeted notifications
- Track user activity and engagement

### Analytics & Reporting
- User growth charts
- Popular content metrics
- Contact form conversion rates
- Token economy health

## Caching Strategy

### What's Cached
- Blog listings (1 hour TTL)
- Service listings (1 hour TTL)
- Portfolio items (1 hour TTL)
- User profile data (30 minutes TTL)

### Cache Management
```php
// Clear specific cache
$cache->delete('blogs_page_1');

// Clear pattern
$cache->clearPattern('blogs_*');

// Clear all cache
$cache->clearAll();
```

## Database Optimization

### Indexes Created
- Email lookups (users table)
- Blog searches (title, content fulltext)
- Portfolio filtering (category, featured)
- Token history (user_id, created_at)
- Rate limiting (ip_address, endpoint)

### Query Optimization
- Prepared statements for all queries
- Efficient JOIN operations
- Pagination with LIMIT/OFFSET
- Proper WHERE clause ordering

## Monitoring & Logging

### Error Logging
- All errors logged to PHP error log
- Custom error handling for API endpoints
- Database connection error handling
- Email delivery failure logging

### Audit Trail
- All admin actions logged with timestamps
- User authentication attempts
- Data modification tracking
- IP address and user agent logging

## Production Deployment

### Server Requirements
- PHP 7.4+ with PDO MySQL extension
- MySQL 5.7+ or MariaDB 10.2+
- Composer for dependency management
- SSL certificate for HTTPS

### Performance Tuning
- Enable OPcache for PHP
- Configure MySQL query cache
- Use CDN for static assets
- Implement Redis for session storage (optional)

### Security Checklist
- [ ] Change default JWT secret
- [ ] Set strong database passwords
- [ ] Enable HTTPS only
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Enable error logging
- [ ] Disable PHP error display in production

## Testing

### Run Tests
```bash
composer test
```

### Manual Testing
1. Test user registration and login
2. Verify JWT token authentication
3. Test CRUD operations for all entities
4. Check rate limiting functionality
5. Verify email notifications
6. Test admin panel functionality

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check database credentials in `.env`
- Verify MySQL service is running
- Check firewall settings

**JWT Token Invalid**
- Verify JWT_SECRET is set correctly
- Check token expiration time
- Ensure proper Authorization header format

**Email Not Sending**
- Check SMTP credentials
- Verify firewall allows SMTP ports
- Test with a simple mail() function first

**Cache Not Working**
- Check cache directory permissions (777)
- Verify CACHE_ENABLED in config
- Clear cache manually if needed

## Support

For technical support or questions about this backend implementation:
- Check error logs first: `tail -f /var/log/php_errors.log`
- Review database queries in slow query log
- Test API endpoints with Postman or curl
- Verify environment variables are loaded correctly

## License
MIT License - See LICENSE file for details