<?php
// diagnose.php
// Diagnostic script to check file existence and check why WordPress is falling back to MySQL.

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Checking PHP modules:\n";
$modules = get_loaded_extensions();
echo "SQLite3 loaded: " . (in_array('sqlite3', $modules) ? "YES" : "NO") . "\n";
echo "PDO_SQLite loaded: " . (in_array('pdo_sqlite', $modules) ? "YES" : "NO") . "\n";
echo "MySQLi loaded: " . (in_array('mysqli', $modules) ? "YES" : "NO") . "\n";

echo "\nChecking critical file existence:\n";
$paths = [
    'wp-config.php' => './wp-config.php',
    'wp-content/db.php' => './wp-content/db.php',
    'wp-content/mu-plugins/sqlite-database-integration/db.php' => './wp-content/mu-plugins/sqlite-database-integration/db.php',
    'wp-content/themes/flatsome/style.css' => './wp-content/themes/flatsome/style.css',
    'wp-content/themes/flatsome-child-custom/style.css' => './wp-content/themes/flatsome-child-custom/style.css'
];

foreach ($paths as $name => $path) {
    echo "File '$name' exists: " . (file_exists($path) ? "YES" : "NO") . "\n";
}

if (file_exists('./wp-content/db.php')) {
    echo "\nReading first 5 lines of wp-content/db.php:\n";
    $lines = file('./wp-content/db.php');
    for ($i = 0; $i < min(5, count($lines)); $i++) {
        echo $lines[$i];
    }
}

echo "\nAttempting to load wp-load.php...\n";
try {
    require_once './wp-load.php';
    echo "Success! WordPress bootstrapped with no fatal errors.\n";
} catch (Throwable $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
}
?>
