import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { requireAuth, logActivity, rateLimit } from "@/lib/middleware"

const rateLimiter = rateLimit({ windowMs: 60000, maxRequests: 100 })

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) return rateLimitResult

    // Require admin authentication
    const authResult = await requireAuth(request, ["admin"])
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const isActive = searchParams.get("isActive")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const dbService = await getDatabaseService()

    // Build filters
    const filters: any = {}
    if (role) filters.role = role
    if (isActive !== null) filters.isActive = isActive === "true"

    const users = await dbService.getAllUsers(filters)

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    // Remove sensitive data
    const sanitizedUsers = paginatedUsers.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }))

    // Log activity
    await logActivity(
      user._id!.toString(),
      "VIEW_USERS",
      { filters, page, limit },
      request.ip,
      request.headers.get("user-agent"),
    )

    return NextResponse.json({
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) return rateLimitResult

    // Require admin authentication
    const authResult = await requireAuth(request, ["admin"])
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const body = await request.json()
    const { userId, updates } = body

    if (!userId || !updates) {
      return NextResponse.json({ error: "User ID and updates are required" }, { status: 400 })
    }

    const dbService = await getDatabaseService()

    // Validate updates (only allow certain fields)
    const allowedUpdates = ["isActive", "role"]
    const filteredUpdates: any = {}
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    }

    const updatedUser = await dbService.updateUser(userId, filteredUpdates)

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log activity
    await logActivity(
      user._id!.toString(),
      "UPDATE_USER",
      { targetUserId: userId, updates: filteredUpdates },
      request.ip,
      request.headers.get("user-agent"),
    )

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
