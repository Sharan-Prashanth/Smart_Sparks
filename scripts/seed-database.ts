import { getDatabaseService } from "../lib/database"
import { hashPassword } from "../lib/auth"

async function seedDatabase() {
  console.log("🌱 Starting database seeding...")

  try {
    const dbService = await getDatabaseService()

    // Clear existing data (optional - remove in production)
    console.log("🧹 Clearing existing data...")
    await dbService.db.collection("users").deleteMany({})
    await dbService.db.collection("certifications").deleteMany({})
    await dbService.db.collection("handlers").deleteMany({})
    await dbService.db.collection("wasteCollectors").deleteMany({})
    await dbService.db.collection("feedbacks").deleteMany({})

    // Create admin user
    console.log("👤 Creating admin user...")
    const adminPassword = await hashPassword("Admin123!")
    const adminUser = await dbService.createUser({
      name: "System Administrator",
      email: "admin@ecowastecert.com",
      password: adminPassword,
      phone: "+1-555-0000",
      region: "Global",
      role: "admin",
      isEmailVerified: true,
    })

    // Create sample recyclers
    console.log("♻️ Creating sample recyclers...")
    const recyclerPassword = await hashPassword("Recycler123!")
    const recyclers = [
      {
        name: "John Smith",
        email: "john@recycletech.com",
        phone: "+1-555-0101",
        region: "California",
        role: "recycler" as const,
      },
      {
        name: "Maria Garcia",
        email: "maria@ecometal.com",
        phone: "+1-555-0102",
        region: "Nevada",
        role: "recycler" as const,
      },
      {
        name: "David Chen",
        email: "david@paperplus.com",
        phone: "+1-555-0103",
        region: "Oregon",
        role: "recycler" as const,
      },
    ]

    const createdRecyclers = []
    for (const recycler of recyclers) {
      const user = await dbService.createUser({
        ...recycler,
        password: recyclerPassword,
        isEmailVerified: true,
      })
      createdRecyclers.push(user)
    }

    // Create sample waste collectors
    console.log("🚛 Creating sample waste collectors...")
    const collectorPassword = await hashPassword("Collector123!")
    const collectors = [
      {
        name: "Mike Johnson",
        email: "mike@wastepro.com",
        phone: "+1-555-0201",
        region: "California",
        role: "wastecollector" as const,
      },
      {
        name: "Sarah Davis",
        email: "sarah@cleanwaste.com",
        phone: "+1-555-0202",
        region: "Texas",
        role: "wastecollector" as const,
      },
      {
        name: "Carlos Rodriguez",
        email: "carlos@ecowaste.com",
        phone: "+1-555-0203",
        region: "Nevada",
        role: "wastecollector" as const,
      },
    ]

    const createdCollectors = []
    for (const collector of collectors) {
      const user = await dbService.createUser({
        ...collector,
        password: collectorPassword,
        isEmailVerified: true,
      })
      createdCollectors.push(user)
    }

    // Create certifications
    console.log("📜 Creating sample certifications...")
    const certifications = [
      {
        recyclerEmail: "john@recycletech.com",
        recyclerName: "John Smith",
        businessName: "RecycleTech Solutions",
        activityType: "plastic-recycling",
        documentName: "certification-docs.pdf",
        status: "Certified" as const,
        appliedAt: new Date("2024-01-15"),
        certifiedAt: new Date("2024-01-25"),
        validUntil: new Date("2025-01-25"),
        complianceStatus: "Compliant" as const,
        lastEvaluationDate: new Date("2024-01-25"),
        evaluatorId: adminUser._id!.toString(),
        evaluatorNotes: "All requirements met. Excellent facility management.",
      },
      {
        recyclerEmail: "maria@ecometal.com",
        recyclerName: "Maria Garcia",
        businessName: "EcoMetal Processing",
        activityType: "metal-recycling",
        documentName: "metal-cert.pdf",
        status: "Pending" as const,
        appliedAt: new Date("2024-01-20"),
        complianceStatus: "Under Review" as const,
        lastEvaluationDate: new Date("2024-01-20"),
      },
    ]

    for (const cert of certifications) {
      await dbService.createCertification(cert)
    }

    // Create handlers
    console.log("🏢 Creating sample handlers...")
    const handlers = [
      {
        userId: createdRecyclers[0]._id!.toString(),
        name: "John Smith",
        businessName: "RecycleTech Solutions",
        email: "john@recycletech.com",
        phone: "+1-555-0101",
        region: "California",
        activityType: "plastic-recycling",
        rating: 4.8,
        certificationStatus: "Certified",
        validUntil: "2025-01-25",
        servicesOffered: ["Plastic Collection", "Plastic Processing", "Recycling Consultation"],
        priceRange: "$50-100/ton",
        capacity: "500 tons/month",
        isVerified: true,
      },
      {
        userId: createdRecyclers[1]._id!.toString(),
        name: "Maria Garcia",
        businessName: "EcoMetal Processing",
        email: "maria@ecometal.com",
        phone: "+1-555-0102",
        region: "Nevada",
        activityType: "metal-recycling",
        rating: 4.5,
        certificationStatus: "Pending",
        validUntil: "2025-03-15",
        servicesOffered: ["Metal Collection", "Metal Processing", "Scrap Analysis"],
        priceRange: "$75-150/ton",
        capacity: "300 tons/month",
        isVerified: true,
      },
    ]

    for (const handler of handlers) {
      await dbService.createHandler(handler)
    }

    // Create waste collectors
    console.log("🚚 Creating sample waste collector profiles...")
    const wasteCollectorProfiles = [
      {
        userId: createdCollectors[0]._id!.toString(),
        name: "Mike Johnson",
        email: "mike@wastepro.com",
        phone: "+1-555-0201",
        region: "California",
        rating: 4.8,
        specialization: "plastic",
        availability: "Available",
        priceRange: "$50-100/ton",
        experience: "5+ years",
        servicesOffered: ["Pickup Service", "Sorting", "Transportation"],
        vehicleTypes: ["Truck", "Container"],
        operatingHours: "Mon-Fri 8AM-6PM",
        isVerified: true,
      },
      {
        userId: createdCollectors[1]._id!.toString(),
        name: "Sarah Davis",
        email: "sarah@cleanwaste.com",
        phone: "+1-555-0202",
        region: "Texas",
        rating: 4.5,
        specialization: "metal",
        availability: "Busy",
        priceRange: "$75-150/ton",
        experience: "8+ years",
        servicesOffered: ["Heavy Lifting", "Metal Sorting", "Scrap Processing"],
        vehicleTypes: ["Heavy Truck", "Crane"],
        operatingHours: "Mon-Sat 7AM-7PM",
        isVerified: true,
      },
      {
        userId: createdCollectors[2]._id!.toString(),
        name: "Carlos Rodriguez",
        email: "carlos@ecowaste.com",
        phone: "+1-555-0203",
        region: "Nevada",
        rating: 4.9,
        specialization: "electronic",
        availability: "Available",
        priceRange: "$100-200/ton",
        experience: "10+ years",
        servicesOffered: ["E-waste Collection", "Data Destruction", "Component Recovery"],
        vehicleTypes: ["Specialized Van", "Secure Transport"],
        operatingHours: "Mon-Fri 9AM-5PM",
        isVerified: true,
      },
    ]

    for (const profile of wasteCollectorProfiles) {
      await dbService.createWasteCollector(profile)
    }

    // Create sample feedbacks
    console.log("⭐ Creating sample feedbacks...")
    const feedbacks = [
      {
        collectorId: createdCollectors[0]._id!.toString(),
        recyclerId: createdRecyclers[0]._id!.toString(),
        recyclerName: "RecycleTech Solutions",
        rating: 5,
        comment: "Excellent service! Very professional and punctual. Handled our plastic waste efficiently.",
        date: new Date("2024-01-20"),
        projectType: "Plastic Collection",
        isVerified: true,
      },
      {
        collectorId: createdCollectors[0]._id!.toString(),
        recyclerId: createdRecyclers[1]._id!.toString(),
        recyclerName: "EcoMetal Processing",
        rating: 4,
        comment: "Good service overall. Could improve communication during pickup times.",
        date: new Date("2024-01-15"),
        projectType: "Mixed Waste",
        isVerified: true,
      },
    ]

    for (const feedback of feedbacks) {
      await dbService.createFeedback(feedback)
    }

    // Create system settings
    console.log("⚙️ Creating system settings...")
    const systemSettings = [
      { key: "platform_name", value: "EcoWaste Cert", description: "Platform display name" },
      { key: "max_file_size", value: 10485760, description: "Maximum file upload size in bytes (10MB)" },
      { key: "certification_validity_days", value: 365, description: "Certification validity period in days" },
      { key: "email_notifications_enabled", value: true, description: "Enable email notifications" },
      { key: "maintenance_mode", value: false, description: "Enable maintenance mode" },
    ]

    for (const setting of systemSettings) {
      await dbService.updateSystemSetting(setting.key, setting.value, adminUser._id!.toString())
    }

    // Create sample notifications
    console.log("🔔 Creating sample notifications...")
    for (const recycler of createdRecyclers) {
      await dbService.createNotification({
        userId: recycler._id!.toString(),
        title: "Welcome to EcoWaste Cert!",
        message: "Your account has been created successfully. Start by applying for certification.",
        type: "info",
        actionUrl: "/apply-certification",
      })
    }

    for (const collector of createdCollectors) {
      await dbService.createNotification({
        userId: collector._id!.toString(),
        title: "Profile Setup Complete",
        message: "Your waste collector profile is now active and visible to recyclers.",
        type: "success",
        actionUrl: "/wastecollector-dashboard",
      })
    }

    console.log("✅ Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`- Created 1 admin user`)
    console.log(`- Created ${recyclers.length} recyclers`)
    console.log(`- Created ${collectors.length} waste collectors`)
    console.log(`- Created ${certifications.length} certifications`)
    console.log(`- Created ${handlers.length} handlers`)
    console.log(`- Created ${feedbacks.length} feedbacks`)
    console.log(`- Created ${systemSettings.length} system settings`)
    console.log("\n🔐 Login Credentials:")
    console.log("Admin: admin@ecowastecert.com / Admin123!")
    console.log("Recycler: john@recycletech.com / Recycler123!")
    console.log("Collector: mike@wastepro.com / Collector123!")
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    process.exit(1)
  }

  process.exit(0)
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase
