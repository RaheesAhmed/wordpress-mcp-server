<?php
/**
 * WPMCP File System Operations
 */

if (!defined('ABSPATH')) exit;

class WPMCP_FileSystem {
    
    private $allowed_dirs = ['wp-content/themes', 'wp-content/plugins', 'wp-content/uploads', 'wp-content/mu-plugins'];
    private $allowed_extensions = ['php', 'js', 'css', 'scss', 'json', 'html', 'xml', 'txt', 'md', 'svg', 'jpg', 'png', 'gif'];
    private $max_file_size = 10485760;
    private $backup_dir = 'wp-content/wpmcp-backups';
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        $this->ensure_backup_dir();
    }
    
    private function ensure_backup_dir() {
        $backup_path = ABSPATH . $this->backup_dir;
        if (!file_exists($backup_path)) {
            wp_mkdir_p($backup_path);
            file_put_contents($backup_path . '/.htaccess', "Deny from all\n");
        }
    }
    
    public function register_routes() {
        $ns = 'wpmcp/v1';
        
        register_rest_route($ns, '/file/read', ['methods' => 'POST', 'callback' => [$this, 'read_file'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/file/list', ['methods' => 'POST', 'callback' => [$this, 'list_files'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/file/info', ['methods' => 'POST', 'callback' => [$this, 'file_info'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/file/write', ['methods' => 'POST', 'callback' => [$this, 'write_file'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/file/delete', ['methods' => 'POST', 'callback' => [$this, 'delete_file'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/file/copy', ['methods' => 'POST', 'callback' => [$this, 'copy_file'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/file/move', ['methods' => 'POST', 'callback' => [$this, 'move_file'], 'permission_callback' => [$this, 'check_permissions']]);
    }
    
    public function check_permissions() {
        return current_user_can('edit_themes') && current_user_can('edit_plugins');
    }
    
    private function validate_path($path) {
        $path = str_replace(['../', '..\\'], '', $path);
        $path = ltrim($path, '/\\');
        
        foreach ($this->allowed_dirs as $dir) {
            if (strpos($path, $dir) === 0) {
                $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                if ($ext && !in_array($ext, $this->allowed_extensions)) {
                    return new WP_Error('invalid_extension', 'Extension not allowed');
                }
                return ABSPATH . $path;
            }
        }
        
        return new WP_Error('invalid_path', 'Path not allowed');
    }
    
    private function create_backup($file_path) {
        if (!file_exists($file_path)) return null;
        
        $backup_id = uniqid('backup_', true);
        $backup_file = ABSPATH . $this->backup_dir . '/' . $backup_id . '.bak';
        
        if (copy($file_path, $backup_file)) {
            $meta = ['original_path' => str_replace(ABSPATH, '', $file_path), 'timestamp' => current_time('mysql'), 'user_id' => get_current_user_id()];
            file_put_contents($backup_file . '.meta', json_encode($meta));
            return $backup_id;
        }
        
        return null;
    }
    
    public function read_file($request) {
        $file_path = $this->validate_path($request->get_param('path'));
        if (is_wp_error($file_path)) return $file_path;
        if (!file_exists($file_path)) return new WP_Error('file_not_found', 'File not found');
        
        return ['content' => file_get_contents($file_path), 'size' => filesize($file_path), 'modified' => date('Y-m-d H:i:s', filemtime($file_path))];
    }
    
    public function list_files($request) {
        $dir_path = $this->validate_path($request->get_param('path'));
        if (is_wp_error($dir_path)) return $dir_path;
        if (!is_dir($dir_path)) return new WP_Error('not_directory', 'Not a directory');
        
        $files = [];
        $iterator = $request->get_param('recursive') 
            ? new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir_path, RecursiveDirectoryIterator::SKIP_DOTS))
            : new DirectoryIterator($dir_path);
        
        foreach ($iterator as $file) {
            if ($file->isDot()) continue;
            $files[] = [
                'path' => str_replace(ABSPATH, '', $file->getPathname()),
                'name' => $file->getFilename(),
                'type' => $file->isDir() ? 'directory' : 'file',
                'size' => $file->isFile() ? $file->getSize() : 0,
                'modified' => date('Y-m-d H:i:s', $file->getMTime())
            ];
        }
        
        return ['files' => $files];
    }
    
    public function file_info($request) {
        $file_path = $this->validate_path($request->get_param('path'));
        if (is_wp_error($file_path)) return $file_path;
        if (!file_exists($file_path)) return new WP_Error('file_not_found', 'File not found');
        
        return [
            'size' => filesize($file_path),
            'modified' => date('Y-m-d H:i:s', filemtime($file_path)),
            'permissions' => substr(sprintf('%o', fileperms($file_path)), -4),
            'type' => is_dir($file_path) ? 'directory' : 'file'
        ];
    }
    
    public function write_file($request) {
        $file_path = $this->validate_path($request->get_param('path'));
        if (is_wp_error($file_path)) return $file_path;
        
        $content = $request->get_param('content');
        if (strlen($content) > $this->max_file_size) return new WP_Error('file_too_large', 'File too large');
        
        $backup_id = null;
        if ($request->get_param('createBackup') && file_exists($file_path)) {
            $backup_id = $this->create_backup($file_path);
        }
        
        $dir = dirname($file_path);
        if (!is_dir($dir)) wp_mkdir_p($dir);
        
        $result = file_put_contents($file_path, $content);
        return $result !== false ? ['success' => true, 'backup' => $backup_id, 'bytes_written' => $result] : new WP_Error('write_failed', 'Write failed');
    }
    
    public function delete_file($request) {
        $file_path = $this->validate_path($request->get_param('path'));
        if (is_wp_error($file_path)) return $file_path;
        if (!file_exists($file_path)) return new WP_Error('file_not_found', 'File not found');
        
        $backup_id = $request->get_param('createBackup') ? $this->create_backup($file_path) : null;
        return unlink($file_path) ? ['success' => true, 'backup' => $backup_id] : new WP_Error('delete_failed', 'Delete failed');
    }
    
    public function copy_file($request) {
        $source_path = $this->validate_path($request->get_param('source'));
        if (is_wp_error($source_path)) return $source_path;
        
        $dest_path = $this->validate_path($request->get_param('destination'));
        if (is_wp_error($dest_path)) return $dest_path;
        
        if (!file_exists($source_path)) return new WP_Error('source_not_found', 'Source not found');
        
        $dir = dirname($dest_path);
        if (!is_dir($dir)) wp_mkdir_p($dir);
        
        return copy($source_path, $dest_path) ? ['success' => true] : new WP_Error('copy_failed', 'Copy failed');
    }
    
    public function move_file($request) {
        $source_path = $this->validate_path($request->get_param('source'));
        if (is_wp_error($source_path)) return $source_path;
        
        $dest_path = $this->validate_path($request->get_param('destination'));
        if (is_wp_error($dest_path)) return $dest_path;
        
        if (!file_exists($source_path)) return new WP_Error('source_not_found', 'Source not found');
        
        $dir = dirname($dest_path);
        if (!is_dir($dir)) wp_mkdir_p($dir);
        
        return rename($source_path, $dest_path) ? ['success' => true] : new WP_Error('move_failed', 'Move failed');
    }
}