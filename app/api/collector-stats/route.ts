import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { requireAuth, rateLimit } from "@/lib/middleware"

const rateLimiter = rateLimit({ windowMs: 60000, maxRequests: 50 })

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) return rateLimitResult

    // Require waste collector authentication
    const authResult = await requireAuth(request, ["wastecollector"])
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const dbService = await getDatabaseService()

    // Get collector profile
    const collectorProfile = await dbService.getWasteCollectorByUserId(user._id!.toString())
    if (!collectorProfile) {
      return NextResponse.json({ error: "Collector profile not found" }, { status: 404 })
    }

    // Get feedbacks for this collector
    const feedbacks = await dbService.getFeedbackByCollectorId(collectorProfile._id!.toString())

    // Get approach requests
    const approachRequests = await dbService.getApproachRequestsByUser(user._id!.toString(), "wastecollector")

    // Calculate statistics
    const stats = {
      totalProjects: approachRequests.filter((req) => req.status === "completed").length,
      activeRequests: approachRequests.filter((req) => req.status === "pending").length,
      averageRating: feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0,
      totalFeedbacks: feedbacks.length,
      completionRate:
        approachRequests.length > 0
          ? (approachRequests.filter((req) => req.status === "completed").length / approachRequests.length) * 100
          : 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching collector stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
