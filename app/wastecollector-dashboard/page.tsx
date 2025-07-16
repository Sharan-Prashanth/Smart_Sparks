"use client"

import { useState, useEffect } from "react"
import { Star, ChevronDown, ChevronUp, MessageSquare, Calendar, TrendingUp } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/components/AuthProvider"

interface Feedback {
  id: string
  recyclerName: string
  rating: number
  comment: string
  date: string
  projectType: string
}

function WasteCollectorDashboardContent() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [showAllFeedback, setShowAllFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    averageRating: 0,
    totalFeedbacks: 0,
    completionRate: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch collector stats and feedbacks
      const [statsResponse, feedbackResponse] = await Promise.all([
        fetch("/api/collector-stats"),
        fetch("/api/collector-feedback"),
      ])

      const statsData = await statsResponse.json()
      const feedbackData = await feedbackResponse.json()

      setStats(statsData)
      setFeedbacks(feedbackData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const displayedFeedbacks = showAllFeedback ? feedbacks : feedbacks.slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Waste Collector Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || "Collector"}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  {renderStars(stats.averageRating)}
                  <span className="ml-2 text-lg font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">Overall Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeedbacks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Display with Feedback Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Performance Rating</h2>
              <div className="flex items-center">
                {renderStars(stats.averageRating)}
                <span className="ml-3 text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                <span className="ml-2 text-gray-600">out of 5</span>
              </div>
              <p className="text-gray-600 mt-2">Based on {stats.totalFeedbacks} reviews</p>
            </div>

            <button
              onClick={() => setShowAllFeedback(!showAllFeedback)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{showAllFeedback ? "Hide" : "View All"} Feedback</span>
              {showAllFeedback ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Feedback {showAllFeedback && `(${feedbacks.length} total)`}
            </h3>

            {displayedFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No feedback available yet</p>
              </div>
            ) : (
              displayedFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{feedback.recyclerName}</h4>
                      <p className="text-sm text-gray-600">
                        {feedback.projectType} • {feedback.date}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {renderStars(feedback.rating)}
                      <span className="ml-1 text-sm font-medium text-gray-700">{feedback.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                </div>
              ))
            )}

            {feedbacks.length > 3 && !showAllFeedback && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllFeedback(true)}
                  className="text-green-600 hover:text-green-700 font-medium flex items-center mx-auto"
                >
                  View {feedbacks.length - 3} more reviews
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">New project request from RecycleTech Solutions</span>
              <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Completed plastic waste collection for EcoMetal Processing</span>
              <span className="ml-auto text-xs text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Received 5-star rating from Paper Plus Recycling</span>
              <span className="ml-auto text-xs text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WasteCollectorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["wastecollector"]}>
      <WasteCollectorDashboardContent />
    </ProtectedRoute>
  )
}
