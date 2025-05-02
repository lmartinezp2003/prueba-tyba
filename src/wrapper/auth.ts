// src/middleware/auth.ts
import { Request, Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { DatabaseConnection } from '../database/db';
import { UserRoles } from '../entities/User';
import { AuthRequest, DecodedToken } from '../common/authCommonTypes';
import HttpError from '../utils/exception';
import { decodeToken } from '../utils/encryption';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

interface WrapperConfig {
  bodyValidation?: J.ObjectSchema;
  queryValidation?: J.ObjectSchema;
  pathsValidation?: J.ObjectSchema;
  roles?: UserRoles[];
  validateToken: boolean;
  handler: (req: AuthRequest, res: Response, db: EntityManager) => Promise<any>;
}

const validateRequestData = (schema: J.ObjectSchema | undefined, data: any, source: string) => {
  if (!schema) return;
  const { error } = schema.validate(data);
  if (error) throw new HttpError(400, `Validation Error in ${source}: ${error.message}`);
};

const validateUserRole = (allowedRoles: UserRoles[], userRole: UserRoles) => {
  if (!allowedRoles.includes(userRole)) {
    throw new HttpError(403, 'Forbidden: insufficient permissions');
  }
};

const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redis.get(`bl:${token}`);
  return result === 'true';
};

export const blacklistToken = async (token: string, expInSeconds: number) => {
  await redis.set(`bl:${token}`, 'true', 'EX', expInSeconds);
};

export const serviceAuthWrapper = async (
  req: AuthRequest,
  res: Response,
  options: WrapperConfig
): Promise<any> => {
  try {
    if (options.validateToken) {
      const token = req.headers.authorization;
      if (!token) throw new HttpError(401, 'Authorization token is required');

      if (await isTokenBlacklisted(token)) {
        throw new HttpError(401, 'Token has been revoked');
      }

      const decodedToken = decodeToken(token);
      req.decodedToken = decodedToken;

      if (options.roles) {
        validateUserRole(options.roles, decodedToken.role);
      }
    }

    validateRequestData(options.bodyValidation, req.body, 'body');
    validateRequestData(options.queryValidation, req.query, 'query');
    validateRequestData(options.pathsValidation, req.params, 'params');

    const connection = await DatabaseConnection.getInstance();
    const manager = connection.getConnectionManager();

    return await options.handler(req, res, manager);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(error.status || 500).send({ error: error.message });
  }
};
