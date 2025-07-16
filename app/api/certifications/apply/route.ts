import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { verifyJWT } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, activityType, documentName } = body

    // Validate required fields
    if (!businessName || !activityType) {
      return NextResponse.json({ error: "Business name and activity type are required" }, { status: 400 })
    }

    const dbService = await getDatabaseService()

    // Get user info
    const user = await dbService.findUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "recycler") {
      return NextResponse.json({ error: "Only recyclers can apply for certification" }, { status: 403 })
    }

    // Create certification application
    const newApplication = await dbService.createCertification({
      recyclerEmail: user.email,
      recyclerName: user.name,
      businessName,
      activityType,
      documentName: documentName || "No document uploaded",
      status: "Pending",
      appliedAt: new Date(),
      complianceStatus: "Under Review",
      lastEvaluationDate: new Date(),
    })

    return NextResponse.json({
      message: "Certification application submitted successfully",
      application: {
        id: newApplication._id,
        status: newApplication.status,
        appliedAt: newApplication.appliedAt,
      },
    })
  } catch (error) {
    console.error("Certification application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
