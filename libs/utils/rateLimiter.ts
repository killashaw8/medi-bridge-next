// Rate limiter utility for contact form
// Tracks daily email submissions per user/IP

interface RateLimitEntry {
  count: number;
  resetTime: number; // Timestamp when limit resets
}

// In-memory store (for production, consider using Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Every hour

/**
 * Check if user/IP has exceeded daily email limit
 * @param identifier - User ID (if logged in) or IP address (if not logged in)
 * @param dailyLimit - Maximum emails allowed per day (default: 1)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  dailyLimit: number = 1
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or entry has expired, create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + 24 * 60 * 60 * 1000; // 24 hours from now
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: dailyLimit - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= dailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: dailyLimit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: any): string {
  // Check various headers for IP address
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const remoteAddress = req.socket?.remoteAddress;

  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddress) {
    return remoteAddress;
  }
  return 'unknown';
}

/**
 * Format time until reset (for error messages)
 */
export function formatTimeUntilReset(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

