import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret'
const JWT_EXPIRES_IN = '7d' // Token expiration time

export interface JwtPayload {
  userId: string
  email: string
  forcePasswordChange: boolean
}

/**
 * Generate a JWT token for a user
 * @param payload - user data to encode in the token
 * @returns signed JWT token string
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns decoded payload if valid, otherwise null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as JwtPayload
  } catch (error) {
    return null
  }
}