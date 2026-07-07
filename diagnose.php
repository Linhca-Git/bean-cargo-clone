<?php
// diagnose.php
// Diagnostic script to run inside the wordpress folder to print the exact fatal error.

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Checking PHP modules:\n";
$modules = get_loaded_extensions();
echo "SQLite3 loaded: " . (in_array('sqlite3', $modules) ? "YES" : "NO") . "\n";
echo "PDO_SQLite loaded: " . (in_array('pdo_sqlite', $modules) ? "YES" : "NO") . "\n";
echo "MySQLi loaded: " . (in_array('mysqli', $modules) ? "YES" : "NO") . "\n";

echo "\nAttempting to load wp-load.php...\n";
try {
    require_once './wp-load.php';
    echo "Success! WordPress bootstrapped with no fatal errors.\n";
} catch (Throwable $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
?>
