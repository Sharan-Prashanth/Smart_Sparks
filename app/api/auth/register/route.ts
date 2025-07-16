import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { hashPassword, generateVerificationToken, isValidEmail, isValidPassword } from "@/lib/auth"
import { sendEmail, generateVerificationEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, name, email, phone, region, password } = body

    // Validate required fields
    if (!role || !name || !email || !phone || !region || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters long and contain uppercase, lowercase, and number",
        },
        { status: 400 },
      )
    }

    const dbService = await getDatabaseService()

    // Check if user already exists
    const existingUser = await dbService.findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password and generate verification token
    const hashedPassword = await hashPassword(password)
    const verificationToken = generateVerificationToken()

    // Create new user
    const newUser = await dbService.createUser({
      role: role as "recycler" | "customer" | "wastecollector",
      name,
      email,
      password: hashedPassword,
      phone,
      region,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`
    const emailHTML = generateVerificationEmailHTML(name, verificationUrl)

    const emailSent = await sendEmail({
      to: email,
      subject: "Verify your email - EcoWaste Cert",
      html: emailHTML,
      text: `Welcome to EcoWaste Cert! Please verify your email by visiting: ${verificationUrl}`,
    })

    if (!emailSent) {
      console.error("Failed to send verification email")
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
