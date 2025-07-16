import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      rating: searchParams.get("rating"),
      activityType: searchParams.get("activityType"),
      region: searchParams.get("region"),
      validity: searchParams.get("validity"),
    }

    // Remove null values
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== null))

    const dbService = await getDatabaseService()
    const handlers = await dbService.getFilteredHandlers(cleanFilters)

    return NextResponse.json(handlers)
  } catch (error) {
    console.error("Error fetching handlers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
