import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would get the collector ID from the authenticated user
    const collectorId = "1" // Mock collector ID

    const feedbacks = db.feedbacks.getByCollectorId(collectorId)

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error("Error fetching collector feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
