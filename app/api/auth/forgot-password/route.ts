import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseService } from "@/lib/database"
import { generatePasswordResetToken } from "@/lib/auth"
import { sendEmail, generatePasswordResetEmailHTML } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const dbService = await getDatabaseService()

    // Find user by email
    const user = await dbService.findUserByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await dbService.updateUser(user._id!.toString(), {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    })

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`
    const emailHTML = generatePasswordResetEmailHTML(user.name, resetUrl)

    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset Request - EcoWaste Cert",
      html: emailHTML,
      text: `Reset your password by visiting: ${resetUrl}`,
    })

    if (!emailSent) {
      console.error("Failed to send password reset email")
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
