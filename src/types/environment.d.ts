namespace NodeJS {
  interface ProcessEnv {
    SESSION_SECRET: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production';
  }
}
