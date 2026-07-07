#!/bin/bash
# setup-wordpress.sh
# Automated script to setup WordPress with SQLite, install Flatsome, and import UX Builder templates

echo "=================================================="
echo "      WordPress + Flatsome SQLite Auto Setup      "
echo "=================================================="

# 1. Clean previous installation
echo "Cleaning up any old WordPress folders..."
rm -rf wordpress/

# 2. Download and extract WordPress
echo "Downloading latest WordPress..."
curl -L -s https://wordpress.org/latest.tar.gz | tar -xz

# 3. Install PHP SQLite extension if missing & setup integration
if command -v apt-get &> /dev/null; then
    echo "Installing missing PHP SQLite3 and MySQL extensions in Codespaces..."
    sudo apt-get update && sudo apt-get install -y php-sqlite3 php-mysql
fi

echo "Downloading and configuring SQLite Integration..."
curl -L -s -o sqlite.zip https://downloads.wordpress.org/plugin/sqlite-database-integration.1.8.1.zip
mkdir -p wordpress/wp-content/mu-plugins
unzip -q sqlite.zip -d wordpress/wp-content/mu-plugins/
rm sqlite.zip
cp wordpress/wp-content/mu-plugins/sqlite-database-integration/db.php wordpress/wp-content/db.php

# 4. Create wp-config.php using SQLite
echo "Generating wp-config.php..."
cat << 'EOF' > wordpress/wp-config.php
<?php
define( 'DB_NAME', 'wp_db' );
define( 'DB_USER', 'username' );
define( 'DB_PASSWORD', 'password' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

// Enable SQLite engine
define( 'DB_ENGINE', 'sqlite' );

$table_prefix = 'wp_';

define( 'WP_DEBUG', false );

// Security keys
define('AUTH_KEY',         'vF5jH7k8L9q0w1e2r3t4y5u6i7o8p9a0');
define('SECURE_AUTH_KEY',  'a1s2d3f4g5h6j7k8l9z0x1c2v3b4n5m6');
define('LOGGED_IN_KEY',    'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6');
define('NONCE_KEY',        'z1x2c3v4b5n6m7q8w9e0r1t2y3u4i5o6');
define('AUTH_SALT',        'aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0u1');
define('SECURE_AUTH_SALT', 'vW1xY2zZ3aA4bB5cC6dD5eE6fF7gG8hH');
define('LOGGED_IN_SALT',   'iI1jJ2kK3lL4mM5nN6oO7pP8qQ9rR0sS');
define('NONCE_SALT',       'tT1uU2vV3wW4xX5yY6zZ7aA8bB9cC0dD');

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
EOF

# 5. Extract Flatsome and Child themes
echo "Installing Flatsome & Flatsome Child themes..."
unzip -q flatsome-3.20.4.zip -d wordpress/wp-content/themes/
unzip -q flatsome-child-custom.zip -d wordpress/wp-content/themes/

# 6. Run programmatic installer and importer
echo "Running automated installer script..."
cp install-wp.php wordpress/
cd wordpress
php install-wp.php
rm install-wp.php

# 7. Start the PHP server
echo "=================================================="
echo " WordPress is ready! Starting dev server..."
echo " Opening http://127.0.0.1:8000/ will show your site."
echo " Admin Panel: http://127.0.0.1:8000/wp-admin/"
echo " Admin Username: admin"
echo " Admin Password: admin123"
echo "=================================================="
echo "Press Ctrl+C to stop the server."
php -S 0.0.0.0:8000
