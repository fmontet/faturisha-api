import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const API_KEY_HEADER = 'x-api-key';
export const PROTECTED_PDF_ROUTES = ['/api/invoices', '/api/receipts'];

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getCorsOrigin(value: string | undefined): string[] | boolean {
  if (!value) {
    return false;
  }

  if (value.trim() === '*') {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApiKeyMiddleware(apiKey?: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!apiKey || req.method === 'OPTIONS') {
      next();
      return;
    }

    if (isApiKeyValid(req.header(API_KEY_HEADER), apiKey)) {
      next();
      return;
    }

    res.status(401).json({
      statusCode: 401,
      message: 'Missing or invalid API key',
      error: 'Unauthorized',
    });
  };
}

function isApiKeyValid(
  provided: string | undefined,
  expected: string,
): boolean {
  if (!provided) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function createRateLimitMiddleware(
  maxRequests: number,
  windowMs: number,
): RequestHandler {
  const clients = new Map<string, RateLimitEntry>();
  let lastCleanup = 0;

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const now = Date.now();

    if (now - lastCleanup > windowMs) {
      for (const [key, entry] of clients.entries()) {
        if (entry.resetAt <= now) {
          clients.delete(key);
        }
      }
      lastCleanup = now;
    }

    const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
    const current = clients.get(clientKey);
    const entry =
      current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + windowMs };

    entry.count += 1;
    clients.set(clientKey, entry);

    const remaining = Math.max(maxRequests - entry.count, 0);
    const resetSeconds = Math.ceil(entry.resetAt / 1000);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(resetSeconds));

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      });
      return;
    }

    next();
  };
}
