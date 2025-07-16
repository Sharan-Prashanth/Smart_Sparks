"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { User, Star, MapPin, Phone, Mail, MessageCircle, Filter } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/components/AuthProvider"

interface WasteCollector {
  id: string
  name: string
  email: string
  phone: string
  region: string
  rating: number
  specialization: string
  availability: string
  priceRange: string
  experience: string
}

function RecyclerDashboardContent() {
  const { user } = useAuth()
  const [wasteCollectors, setWasteCollectors] = useState<WasteCollector[]>([])
  const [filteredCollectors, setFilteredCollectors] = useState<WasteCollector[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    region: "",
    specialization: "",
    minRating: "",
  })

  useEffect(() => {
    fetchWasteCollectors()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [wasteCollectors, filters])

  const fetchWasteCollectors = async () => {
    try {
      const response = await fetch("/api/waste-collectors")
      const data = await response.json()
      setWasteCollectors(data)
    } catch (error) {
      console.error("Error fetching waste collectors:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = wasteCollectors

    if (filters.region) {
      filtered = filtered.filter((collector) => collector.region.toLowerCase().includes(filters.region.toLowerCase()))
    }

    if (filters.specialization) {
      filtered = filtered.filter((collector) => collector.specialization === filters.specialization)
    }

    if (filters.minRating) {
      filtered = filtered.filter((collector) => collector.rating >= Number.parseFloat(filters.minRating))
    }

    setFilteredCollectors(filtered)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const handleApproach = async (collectorId: string) => {
    try {
      const response = await fetch("/api/approach-collector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recyclerId: user?.id,
          collectorId,
          message: "I would like to discuss waste collection services.",
        }),
      })

      if (response.ok) {
        alert("Approach request sent successfully!")
      } else {
        alert("Failed to send approach request")
      }
    } catch (error) {
      console.error("Error sending approach:", error)
      alert("Error sending approach request")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading waste collectors...</p>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Recycler Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || "Recycler"}</p>
              </div>
              <div className="flex items-center space-x-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filter Waste Collectors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                placeholder="Enter region"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Specializations</option>
                <option value="plastic">Plastic Waste</option>
                <option value="metal">Metal Waste</option>
                <option value="paper">Paper Waste</option>
                <option value="electronic">Electronic Waste</option>
                <option value="organic">Organic Waste</option>
                <option value="mixed">Mixed Waste</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Waste Collectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollectors.map((collector) => (
            <div key={collector.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{collector.name}</h3>
                  <p className="text-gray-600">{collector.specialization} Specialist</p>
                </div>
                <div className="flex items-center">
                  {renderStars(collector.rating)}
                  <span className="ml-1 text-sm text-gray-600">({collector.rating})</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {collector.region}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Experience:</span> {collector.experience}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Price Range:</span> {collector.priceRange}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Availability:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      collector.availability === "Available"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {collector.availability}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {collector.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {collector.email}
                </div>
              </div>

              <button
                onClick={() => handleApproach(collector.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-semibold transition-colors flex items-center justify-center"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Approach Collector
              </button>
            </div>
          ))}
        </div>

        {filteredCollectors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No waste collectors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecyclerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["recycler"]}>
      <RecyclerDashboardContent />
    </ProtectedRoute>
  )
}
