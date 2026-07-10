module.exports = {
  apps: [
    {
      name: "pilotnow-api",
      script: "pnpm",
      args: "--filter @pilotnow/api start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        API_PORT: 4000,
      },
    },
    {
      name: "pilotnow-web",
      script: "pnpm",
      args: "--filter @pilotnow/web start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
