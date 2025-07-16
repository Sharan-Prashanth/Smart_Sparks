import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "./auth"
import { getDatabaseService } from "./database"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    const current = rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      })
      return null // Allow request
    }

    if (current.count >= options.maxRequests) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    current.count++
    return null // Allow request
  }
}

export async function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const payload = verifyJWT(token)
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const dbService = await getDatabaseService()
  const user = await dbService.findUserById(payload.userId)

  if (!user || !user.isEmailVerified) {
    return NextResponse.json({ error: "User not found or email not verified" }, { status: 401 })
  }

  return { user, payload }
}

export async function logActivity(
  userId: string,
  action: string,
  details: any,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    const dbService = await getDatabaseService()
    await dbService.createAuditLog({
      userId,
      action,
      details,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}
