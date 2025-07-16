import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { comparePassword, generateJWT } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const dbService = await getDatabaseService()

    // Find user by email
    const user = await dbService.findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if role matches
    if (user.role !== role) {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 401 })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in. Check your inbox for the verification link.",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    })

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
        isEmailVerified: user.isEmailVerified,
      },
    })

    // Set httpOnly cookie for security
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
