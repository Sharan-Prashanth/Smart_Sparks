import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { requireAuth, logActivity, rateLimit } from "@/lib/middleware"

const rateLimiter = rateLimit({ windowMs: 60000, maxRequests: 20 })

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) return rateLimitResult

    // Require recycler authentication
    const authResult = await requireAuth(request, ["recycler"])
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const body = await request.json()
    const { collectorId, message, wasteType, quantity, urgency, preferredDate } = body

    if (!collectorId || !message) {
      return NextResponse.json({ error: "Collector ID and message are required" }, { status: 400 })
    }

    const dbService = await getDatabaseService()

    // Verify collector exists
    const collector = await dbService.getWasteCollectorById(collectorId)
    if (!collector) {
      return NextResponse.json({ error: "Waste collector not found" }, { status: 404 })
    }

    // Create approach request
    const approachRequest = await dbService.createApproachRequest({
      recyclerId: user._id!.toString(),
      collectorId,
      message,
      wasteType,
      quantity,
      urgency,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    })

    // Create notification for collector
    await dbService.createNotification({
      userId: collector.userId,
      title: "New Approach Request",
      message: `${user.name} has sent you a new approach request for waste collection.`,
      type: "info",
      actionUrl: "/wastecollector-dashboard",
    })

    // Log activity
    await logActivity(
      user._id!.toString(),
      "APPROACH_COLLECTOR",
      { collectorId, wasteType, quantity },
      request.ip,
      request.headers.get("user-agent"),
    )

    return NextResponse.json({
      message: "Approach request sent successfully",
      requestId: approachRequest._id,
    })
  } catch (error) {
    console.error("Error sending approach request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) return rateLimitResult

    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const dbService = await getDatabaseService()
    const requests = await dbService.getApproachRequestsByUser(user._id!.toString(), user.role)

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching approach requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
