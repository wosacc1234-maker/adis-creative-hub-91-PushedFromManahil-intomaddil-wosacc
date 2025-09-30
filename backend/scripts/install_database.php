<?php
/**
 * Database Installation Script
 * Sets up the database schema and initial data
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

echo "Installing Adil GFX Database...\n";

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Read and execute schema
    $schema = file_get_contents(__DIR__ . '/../database/schema.sql');
    $statements = explode(';', $schema);

    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $conn->exec($statement);
            echo "✓ Executed: " . substr($statement, 0, 50) . "...\n";
        }
    }

    // Insert sample data from JSON files
    echo "\nInserting sample data...\n";

    // Insert blogs
    $blogs_json = file_get_contents(__DIR__ . '/../../src/data/blogs.json');
    $blogs = json_decode($blogs_json, true);

    foreach ($blogs as $blog) {
        $stmt = $conn->prepare("
            INSERT IGNORE INTO blogs (id, title, slug, excerpt, content, category, featured_image, tags, featured, views, likes, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $blog['id'],
            $blog['title'],
            $blog['slug'],
            $blog['excerpt'],
            $blog['content'],
            $blog['category'],
            $blog['featuredImage'],
            json_encode($blog['tags']),
            $blog['featured'],
            $blog['views'],
            $blog['likes'],
            $blog['date']
        ]);
    }
    echo "✓ Inserted " . count($blogs) . " blog posts\n";

    // Insert testimonials
    $testimonials_json = file_get_contents(__DIR__ . '/../../src/data/testimonials.json');
    $testimonials = json_decode($testimonials_json, true);

    foreach ($testimonials as $testimonial) {
        $stmt = $conn->prepare("
            INSERT IGNORE INTO testimonials (id, name, role, company, content, rating, avatar, project_type, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $testimonial['id'],
            $testimonial['name'],
            $testimonial['role'],
            $testimonial['company'],
            $testimonial['content'],
            $testimonial['rating'],
            $testimonial['avatar'],
            $testimonial['projectType'],
            $testimonial['verified']
        ]);
    }
    echo "✓ Inserted " . count($testimonials) . " testimonials\n";

    // Insert portfolio items
    $portfolio_json = file_get_contents(__DIR__ . '/../../src/data/portfolio.json');
    $portfolio = json_decode($portfolio_json, true);

    foreach ($portfolio as $item) {
        $stmt = $conn->prepare("
            INSERT IGNORE INTO portfolio (id, title, slug, category, description, long_description, client, completion_date, featured_image, images, before_image, after_image, tags, results, featured, views)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $item['id'],
            $item['title'],
            $item['slug'],
            $item['category'],
            $item['description'],
            $item['longDescription'],
            $item['client'],
            $item['completionDate'],
            $item['featuredImage'],
            json_encode($item['images']),
            $item['beforeImage'],
            $item['afterImage'],
            json_encode($item['tags']),
            json_encode($item['results']),
            $item['featured'],
            $item['views']
        ]);
    }
    echo "✓ Inserted " . count($portfolio) . " portfolio items\n";

    // Insert services
    $services_json = file_get_contents(__DIR__ . '/../../src/data/services.json');
    $services = json_decode($services_json, true);

    foreach ($services as $service) {
        $stmt = $conn->prepare("
            INSERT IGNORE INTO services (id, name, slug, icon, tagline, description, features, pricing_tiers, delivery_time, popular)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $service['id'],
            $service['name'],
            $service['slug'],
            $service['icon'],
            $service['tagline'],
            $service['description'],
            json_encode($service['features']),
            json_encode($service['pricingTiers']),
            $service['deliveryTime'],
            $service['popular']
        ]);
    }
    echo "✓ Inserted " . count($services) . " services\n";

    echo "\n🎉 Database installation completed successfully!\n";
    echo "Admin login: admin@adilgfx.com / admin123\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}