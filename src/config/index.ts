/**
 * Application Configuration
 * Centralized configuration management
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  
  // Password requirements
  password: {
    minLength: 6,
    saltRounds: 12,
  },
} as const;

export default config;
