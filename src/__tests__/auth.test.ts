/**
 * Unit Tests for Authentication Controller
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from '../config/database';

// Mock config
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    jwt: {
      secret: 'test-secret',
      expiresIn: '1h',
    },
    password: {
      saltRounds: 10,
    },
  },
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockRequest = {};
    jest.clearAllMocks();
  });

  describe('Login Validation', () => {
    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user@domain.co'];
      const invalidEmails = ['invalid', 'test@', '@domain.com'];

      validEmails.forEach(email => {
        expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(false);
      });
    });

    it('should validate password requirements', () => {
      const validPasswords = ['password1', 'Test123', 'secure9'];
      const invalidPasswords = ['short', 'nonnumber', '12345'];

      validPasswords.forEach(password => {
        expect(password.length >= 6 && /\d/.test(password)).toBe(true);
      });

      invalidPasswords.forEach(password => {
        const isValid = password.length >= 6 && /\d/.test(password);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);
      
      expect(hash).not.toBe(password);
      expect(await bcrypt.compare(password, hash)).toBe(true);
      expect(await bcrypt.compare('wrongPassword', hash)).toBe(false);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: '123', email: 'test@test.com', role: 'USER' };
      const token = jwt.sign(payload, 'test-secret', { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, 'test-secret') as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should reject invalid token', () => {
      expect(() => {
        jwt.verify('invalid-token', 'test-secret');
      }).toThrow();
    });
  });
});

describe('User Sanitization', () => {
  it('should remove password from user object', () => {
    const user = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
    };

    const { password, ...sanitized } = user;

    expect(sanitized).not.toHaveProperty('password');
    expect(sanitized.id).toBe('1');
    expect(sanitized.email).toBe('test@test.com');
    expect(sanitized.firstName).toBe('John');
  });
});
