/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

// Stub implementation for @upstash/redis when not available

export class Redis {
  constructor(config?: any) {
    // Stub constructor
  }

  async get(key: string): Promise<string | null> {
    return null
  }

  async set(key: string, value: string, options?: any): Promise<string> {
    return 'OK'
  }

  async del(key: string): Promise<number> {
    return 1
  }

  async incr(key: string): Promise<number> {
    return 1
  }

  async expire(key: string, seconds: number): Promise<number> {
    return 1
  }

  async exists(key: string): Promise<number> {
    return 0
  }
}

export default Redis