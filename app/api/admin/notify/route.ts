import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { certificationId, reason } = body

    if (!certificationId || !reason) {
      return NextResponse.json({ error: "Certification ID and reason are required" }, { status: 400 })
    }

    // In a real implementation, this would:
    // 1. Send an email/SMS notification to the recycler
    // 2. Log the notification in the database
    // 3. Update the certification record with notification details

    // For now, we'll just simulate the notification
    console.log(`Notification sent for certification ${certificationId}: ${reason}`)

    return NextResponse.json({
      message: "Notification sent successfully",
      certificationId,
      reason,
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
