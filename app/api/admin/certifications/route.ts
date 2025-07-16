import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { verifyJWT } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (you can add admin role check here)
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const dbService = await getDatabaseService()
    const certifications = await dbService.getAllCertifications()

    // Transform data for admin view
    const enrichedCertifications = certifications.map((cert) => ({
      id: cert._id,
      recyclerName: cert.recyclerName,
      businessName: cert.businessName,
      certificationStatus: cert.status,
      complianceStatus: cert.complianceStatus,
      lastEvaluationDate: cert.lastEvaluationDate.toISOString().split("T")[0],
      activityType: cert.activityType,
      validUntil: cert.validUntil?.toISOString().split("T")[0] || "N/A",
    }))

    return NextResponse.json(enrichedCertifications)
  } catch (error) {
    console.error("Error fetching admin certifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
