module.exports = {
  apps: [
    {
      name: "app",
      script: "npm",
      args: "run server:prod",
      cwd: "/home/ec2-user/CT",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};