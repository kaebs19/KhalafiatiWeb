// PM2 Ecosystem Configuration for Khalafiati Backend
// Place this file in: /var/www/khalafiati/backend/ecosystem.config.js
// Start with: pm2 start ecosystem.config.js
// Save config: pm2 save

module.exports = {
  apps: [
    {
      // Application name
      name: 'khalafiati-api',

      // Script to run
      script: './server.js',

      // Working directory
      cwd: '/var/www/khalafiati/backend',

      // Cluster mode for better performance
      instances: 2, // or 'max' for all CPU cores
      exec_mode: 'cluster',

      // Watch for file changes (disable in production)
      watch: false,

      // Memory limit - restart if exceeded
      max_memory_restart: '500M',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },

      // Log configuration
      error_file: '/var/log/pm2/khalafiati-api-error.log',
      out_file: '/var/log/pm2/khalafiati-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Kill timeout
      kill_timeout: 5000,

      // Wait time before restart
      restart_delay: 4000
    }
  ]
};
