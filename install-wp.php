<?php
// install-wp.php
// Programmatic WordPress installer, theme activator, and UX Builder page importer

// Load WordPress bootstrap
define('WP_INSTALLING', true);
require_once './wp-load.php';
require_once './wp-admin/includes/upgrade.php';

echo "Installing WordPress database tables...\n";
// Install WP: Site Title, Username, Password, Email, Public (boolean)
$result = wp_install('Bean Cargo', 'admin', 'admin123', true, '', 'admin123');

echo "WordPress database tables created successfully!\n";

echo "Activating Flatsome Child Custom theme...\n";
// Switch theme to flatsome-child-custom
switch_theme('flatsome-child-custom');
echo "Theme activated!\n";

// Change permalink structure to postname
echo "Setting permalinks to /%postname%/\n";
update_option('permalink_structure', '/%postname%/');
global $wp_rewrite;
$wp_rewrite->set_permalink_structure('/%postname%/');
$wp_rewrite->flush_rules();

echo "Creating pages and importing UX Builder shortcodes...\n";
$pages = [
    'Trang chủ' => 'trang-chu.txt',
    'Giới thiệu' => 'gioi-thieu.txt',
    'Dịch vụ' => 'dich-vu.txt',
    'Liên hệ' => 'lien-he.txt',
    'Câu hỏi thường gặp' => 'cau-hoi-thuong-gap.txt',
    'Hệ thống cửa hàng' => 'he-thong-cua-hang.txt'
];

foreach ($pages as $title => $filename) {
    $filePath = "../ux-builder-templates/" . $filename;
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $page_id = wp_insert_post([
            'post_title' => $title,
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_author' => 1
        ]);
        
        if ($page_id && !is_wp_error($page_id)) {
            // Set template to Page - Full Width (page-blank.php)
            update_post_meta($page_id, '_wp_page_template', 'page-blank.php');
            echo "Created page: '$title'\n";
            
            if ($title === 'Trang chủ') {
                update_option('show_on_front', 'page');
                update_option('page_on_front', $page_id);
                echo "Set '$title' as Front Page.\n";
            }
        } else {
            echo "Failed to create page: '$title'\n";
        }
    } else {
        echo "Shortcode file not found: $filePath\n";
    }
}

echo "----------------------------------------\n";
echo "WordPress Setup Completed!\n";
echo "Admin Login URL: http://localhost:8000/wp-admin/\n";
echo "Admin Username: admin\n";
echo "Admin Password: admin123\n";
echo "----------------------------------------\n";
?>
