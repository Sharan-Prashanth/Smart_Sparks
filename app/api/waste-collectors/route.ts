import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const dbService = await getDatabaseService()
    const wasteCollectors = await dbService.getAllWasteCollectors()
    return NextResponse.json(wasteCollectors)
  } catch (error) {
    console.error("Error fetching waste collectors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
