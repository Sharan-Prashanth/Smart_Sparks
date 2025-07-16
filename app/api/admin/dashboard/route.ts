import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { requireAuth, logActivity, rateLimit } from "@/lib/middleware"

const rateLimiter = rateLimit({ windowMs: 60000, maxRequests: 50 })

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) return rateLimitResult

    // Require admin authentication
    const authResult = await requireAuth(request, ["admin"])
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const dbService = await getDatabaseService()

    // Get dashboard statistics
    const stats = await dbService.getDashboardStats()

    // Get recent activity logs
    const recentLogs = await dbService.getAuditLogs({}, 10)

    // Get recent certifications
    const recentCertifications = await dbService.getAllCertifications()
    const recentCerts = recentCertifications.slice(0, 5).map((cert) => ({
      id: cert._id,
      recyclerName: cert.recyclerName,
      businessName: cert.businessName,
      status: cert.status,
      appliedAt: cert.appliedAt,
    }))

    // Log activity
    await logActivity(user._id!.toString(), "VIEW_ADMIN_DASHBOARD", {}, request.ip, request.headers.get("user-agent"))

    return NextResponse.json({
      stats,
      recentActivity: recentLogs,
      recentCertifications: recentCerts,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
