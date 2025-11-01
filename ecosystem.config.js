module.exports = {
  apps: [
    // === Production ===
    {
      name: 'nail-art-backend',                        // PM2 进程名称（prod）
      script: 'dist/main.js',                          // NestJS 构建后入口文件
      cwd: '/home/ubuntu/nail-art-backend',            // EC2 生产项目路径
      instances: 1,                                    // 单实例（可改成 max 或 2+）
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',                        // 环境变量
        PORT: 10204                                     // 和 .env 对应
      },
    },

    // === Staging ===
    {
      name: 'nail-art-backend-staging',                // PM2 进程名称（staging）
      script: 'dist/main.js',
      cwd: '/home/ubuntu/nail-art-backend-staging',    // EC2 测试环境路径
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'staging',
        PORT: 10203                                     // 对应 staging .env
      },
    },
  ],
};