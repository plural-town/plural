export const environment = {
  production: false,
};

export const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: 6379,
};
