import { MongoClient, type Db, type Collection } from "mongodb"

// Database connection
let client: MongoClient
let db: Db

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/waste-platform")
    await client.connect()
    db = client.db("waste-platform")
  }
  return { client, db }
}

// Database Models/Interfaces
export interface User {
  _id?: string
  name: string
  email: string
  password: string
  phone: string
  region: string
  role: "recycler" | "customer" | "wastecollector" | "admin"
  isEmailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  isActive: boolean
  lastLoginAt?: Date
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Certification {
  _id?: string
  recyclerEmail: string
  recyclerName: string
  businessName: string
  activityType: string
  documentName: string
  documentUrl?: string
  status: "Pending" | "Certified" | "Revoked" | "Rejected"
  appliedAt: Date
  certifiedAt?: Date
  validUntil?: Date
  complianceStatus: "Compliant" | "Non-Compliant" | "Under Review"
  lastEvaluationDate: Date
  evaluatorId?: string
  evaluatorNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Handler {
  _id?: string
  userId: string
  name: string
  businessName: string
  email: string
  phone: string
  region: string
  activityType: string
  rating: number
  certificationStatus: string
  validUntil: string
  servicesOffered: string[]
  priceRange: string
  capacity: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WasteCollector {
  _id?: string
  userId: string
  name: string
  email: string
  phone: string
  region: string
  rating: number
  specialization: string
  availability: string
  priceRange: string
  experience: string
  servicesOffered: string[]
  vehicleTypes: string[]
  operatingHours: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Feedback {
  _id?: string
  collectorId: string
  recyclerId: string
  recyclerName: string
  rating: number
  comment: string
  date: Date
  projectType: string
  isVerified: boolean
  response?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApproachRequest {
  _id?: string
  recyclerId: string
  collectorId: string
  message: string
  status: "pending" | "accepted" | "rejected" | "completed"
  wasteType?: string
  quantity?: string
  urgency?: string
  preferredDate?: Date
  response?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  _id?: string
  userId: string
  action: string
  details: any
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface Notification {
  _id?: string
  userId: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  isRead: boolean
  actionUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface SystemSettings {
  _id?: string
  key: string
  value: any
  description?: string
  updatedBy: string
  updatedAt: Date
}

// Database operations class
export class DatabaseService {
  public db: Db

  constructor(database: Db) {
    this.db = database
  }

  // User operations
  async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
    const users: Collection<User> = this.db.collection("users")
    const newUser: User = {
      ...userData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await users.insertOne(newUser)
    return { ...newUser, _id: result.insertedId.toString() }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users: Collection<User> = this.db.collection("users")
    return await users.findOne({ email })
  }

  async findUserById(id: string): Promise<User | null> {
    const users: Collection<User> = this.db.collection("users")
    const { ObjectId } = require("mongodb")
    return await users.findOne({ _id: new ObjectId(id) })
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    const users: Collection<User> = this.db.collection("users")
    const { ObjectId } = require("mongodb")
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" },
    )
    return result.value
  }

  async verifyEmail(token: string): Promise<User | null> {
    const users: Collection<User> = this.db.collection("users")
    const result = await users.findOneAndUpdate(
      { emailVerificationToken: token },
      {
        $set: {
          isEmailVerified: true,
          updatedAt: new Date(),
        },
        $unset: { emailVerificationToken: "" },
      },
      { returnDocument: "after" },
    )
    return result.value
  }

  async getAllUsers(filters?: any): Promise<User[]> {
    const users: Collection<User> = this.db.collection("users")
    const query = filters || {}
    return await users.find(query).sort({ createdAt: -1 }).toArray()
  }

  // Certification operations
  async createCertification(certData: Omit<Certification, "_id" | "createdAt" | "updatedAt">): Promise<Certification> {
    const certifications: Collection<Certification> = this.db.collection("certifications")
    const newCert: Certification = {
      ...certData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await certifications.insertOne(newCert)
    return { ...newCert, _id: result.insertedId.toString() }
  }

  async getAllCertifications(): Promise<Certification[]> {
    const certifications: Collection<Certification> = this.db.collection("certifications")
    return await certifications.find({}).sort({ createdAt: -1 }).toArray()
  }

  async getCertificationsByUser(userEmail: string): Promise<Certification[]> {
    const certifications: Collection<Certification> = this.db.collection("certifications")
    return await certifications.find({ recyclerEmail: userEmail }).sort({ createdAt: -1 }).toArray()
  }

  async updateCertificationStatus(
    id: string,
    status: Certification["status"],
    evaluatorId?: string,
    notes?: string,
  ): Promise<Certification | null> {
    const certifications: Collection<Certification> = this.db.collection("certifications")
    const { ObjectId } = require("mongodb")
    const updateData: any = {
      status,
      lastEvaluationDate: new Date(),
      updatedAt: new Date(),
    }

    if (evaluatorId) updateData.evaluatorId = evaluatorId
    if (notes) updateData.evaluatorNotes = notes

    if (status === "Certified") {
      updateData.certifiedAt = new Date()
      updateData.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      updateData.complianceStatus = "Compliant"
    }

    const result = await certifications.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    )
    return result.value
  }

  // Handler operations
  async createHandler(handlerData: Omit<Handler, "_id" | "createdAt" | "updatedAt">): Promise<Handler> {
    const handlers: Collection<Handler> = this.db.collection("handlers")
    const newHandler: Handler = {
      ...handlerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await handlers.insertOne(newHandler)
    return { ...newHandler, _id: result.insertedId.toString() }
  }

  async getAllHandlers(): Promise<Handler[]> {
    const handlers: Collection<Handler> = this.db.collection("handlers")
    return await handlers.find({}).sort({ rating: -1 }).toArray()
  }

  async getFilteredHandlers(filters: any): Promise<Handler[]> {
    const handlers: Collection<Handler> = this.db.collection("handlers")
    const query: any = { isVerified: true }

    if (filters.rating) {
      query.rating = { $gte: Number.parseFloat(filters.rating) }
    }
    if (filters.activityType) {
      query.activityType = filters.activityType
    }
    if (filters.region) {
      query.region = { $regex: filters.region, $options: "i" }
    }
    if (filters.validity === "valid") {
      query.validUntil = { $gt: new Date().toISOString() }
    }

    return await handlers.find(query).sort({ rating: -1 }).toArray()
  }

  // Waste Collector operations
  async createWasteCollector(
    collectorData: Omit<WasteCollector, "_id" | "createdAt" | "updatedAt">,
  ): Promise<WasteCollector> {
    const wasteCollectors: Collection<WasteCollector> = this.db.collection("wasteCollectors")
    const newCollector: WasteCollector = {
      ...collectorData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await wasteCollectors.insertOne(newCollector)
    return { ...newCollector, _id: result.insertedId.toString() }
  }

  async getAllWasteCollectors(): Promise<WasteCollector[]> {
    const wasteCollectors: Collection<WasteCollector> = this.db.collection("wasteCollectors")
    return await wasteCollectors.find({ isVerified: true }).sort({ rating: -1 }).toArray()
  }

  async getWasteCollectorById(id: string): Promise<WasteCollector | null> {
    const wasteCollectors: Collection<WasteCollector> = this.db.collection("wasteCollectors")
    const { ObjectId } = require("mongodb")
    return await wasteCollectors.findOne({ _id: new ObjectId(id) })
  }

  async getWasteCollectorByUserId(userId: string): Promise<WasteCollector | null> {
    const wasteCollectors: Collection<WasteCollector> = this.db.collection("wasteCollectors")
    return await wasteCollectors.findOne({ userId })
  }

  // Feedback operations
  async getFeedbackByCollectorId(collectorId: string): Promise<Feedback[]> {
    const feedbacks: Collection<Feedback> = this.db.collection("feedbacks")
    return await feedbacks.find({ collectorId }).sort({ createdAt: -1 }).toArray()
  }

  async createFeedback(feedbackData: Omit<Feedback, "_id" | "createdAt" | "updatedAt">): Promise<Feedback> {
    const feedbacks: Collection<Feedback> = this.db.collection("feedbacks")
    const newFeedback: Feedback = {
      ...feedbackData,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await feedbacks.insertOne(newFeedback)
    return { ...newFeedback, _id: result.insertedId.toString() }
  }

  // Approach Request operations
  async createApproachRequest(
    requestData: Omit<ApproachRequest, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApproachRequest> {
    const requests: Collection<ApproachRequest> = this.db.collection("approachRequests")
    const newRequest: ApproachRequest = {
      ...requestData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await requests.insertOne(newRequest)
    return { ...newRequest, _id: result.insertedId.toString() }
  }

  async getApproachRequestsByUser(userId: string, role: string): Promise<ApproachRequest[]> {
    const requests: Collection<ApproachRequest> = this.db.collection("approachRequests")
    const query = role === "recycler" ? { recyclerId: userId } : { collectorId: userId }
    return await requests.find(query).sort({ createdAt: -1 }).toArray()
  }

  async updateApproachRequest(id: string, updateData: Partial<ApproachRequest>): Promise<ApproachRequest | null> {
    const requests: Collection<ApproachRequest> = this.db.collection("approachRequests")
    const { ObjectId } = require("mongodb")
    const result = await requests.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" },
    )
    return result.value
  }

  // Audit Log operations
  async createAuditLog(logData: Omit<AuditLog, "_id">): Promise<AuditLog> {
    const auditLogs: Collection<AuditLog> = this.db.collection("auditLogs")
    const newLog: AuditLog = { ...logData }
    const result = await auditLogs.insertOne(newLog)
    return { ...newLog, _id: result.insertedId.toString() }
  }

  async getAuditLogs(filters?: any, limit = 100): Promise<AuditLog[]> {
    const auditLogs: Collection<AuditLog> = this.db.collection("auditLogs")
    const query = filters || {}
    return await auditLogs.find(query).sort({ timestamp: -1 }).limit(limit).toArray()
  }

  // Notification operations
  async createNotification(
    notificationData: Omit<Notification, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Notification> {
    const notifications: Collection<Notification> = this.db.collection("notifications")
    const newNotification: Notification = {
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await notifications.insertOne(newNotification)
    return { ...newNotification, _id: result.insertedId.toString() }
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const notifications: Collection<Notification> = this.db.collection("notifications")
    return await notifications.find({ userId }).sort({ createdAt: -1 }).toArray()
  }

  async markNotificationAsRead(id: string): Promise<Notification | null> {
    const notifications: Collection<Notification> = this.db.collection("notifications")
    const { ObjectId } = require("mongodb")
    const result = await notifications.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { isRead: true, updatedAt: new Date() } },
      { returnDocument: "after" },
    )
    return result.value
  }

  // System Settings operations
  async getSystemSetting(key: string): Promise<SystemSettings | null> {
    const settings: Collection<SystemSettings> = this.db.collection("systemSettings")
    return await settings.findOne({ key })
  }

  async updateSystemSetting(key: string, value: any, updatedBy: string): Promise<SystemSettings> {
    const settings: Collection<SystemSettings> = this.db.collection("systemSettings")
    const result = await settings.findOneAndUpdate(
      { key },
      { $set: { value, updatedBy, updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" },
    )
    return result.value!
  }

  // Analytics operations
  async getDashboardStats(): Promise<any> {
    const users = this.db.collection("users")
    const certifications = this.db.collection("certifications")
    const handlers = this.db.collection("handlers")
    const wasteCollectors = this.db.collection("wasteCollectors")

    const [
      totalUsers,
      totalRecyclers,
      totalCollectors,
      totalCertifications,
      activeCertifications,
      pendingCertifications,
      totalHandlers,
    ] = await Promise.all([
      users.countDocuments({ isActive: true }),
      users.countDocuments({ role: "recycler", isActive: true }),
      users.countDocuments({ role: "wastecollector", isActive: true }),
      certifications.countDocuments(),
      certifications.countDocuments({ status: "Certified" }),
      certifications.countDocuments({ status: "Pending" }),
      handlers.countDocuments({ isVerified: true }),
    ])

    return {
      totalUsers,
      totalRecyclers,
      totalCollectors,
      totalCertifications,
      activeCertifications,
      pendingCertifications,
      totalHandlers,
    }
  }
}

// Initialize database service
export async function getDatabaseService(): Promise<DatabaseService> {
  const { db } = await connectToDatabase()
  return new DatabaseService(db)
}
