"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Filter, Star, MapPin, Phone, Mail } from "lucide-react"

interface Handler {
  id: string
  name: string
  businessName: string
  activityType: string
  region: string
  rating: number
  certificationStatus: string
  validUntil: string
  phone: string
  email: string
}

export default function FindHandlersPage() {
  const [handlers, setHandlers] = useState<Handler[]>([])
  const [filteredHandlers, setFilteredHandlers] = useState<Handler[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    rating: "",
    activityType: "",
    region: "",
    validity: "",
  })

  useEffect(() => {
    fetchHandlers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [handlers, filters])

  const fetchHandlers = async () => {
    try {
      const response = await fetch("/api/handlers")
      const data = await response.json()
      setHandlers(data)
    } catch (error) {
      console.error("Error fetching handlers:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = handlers

    if (filters.rating) {
      filtered = filtered.filter((handler) => handler.rating >= Number.parseFloat(filters.rating))
    }

    if (filters.activityType) {
      filtered = filtered.filter((handler) => handler.activityType === filters.activityType)
    }

    if (filters.region) {
      filtered = filtered.filter((handler) => handler.region.toLowerCase().includes(filters.region.toLowerCase()))
    }

    if (filters.validity === "valid") {
      filtered = filtered.filter((handler) => new Date(handler.validUntil) > new Date())
    }

    setFilteredHandlers(filtered)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
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
            <p className="mt-4 text-gray-600">Loading trusted handlers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Trusted Handlers</h1>
          <p className="text-gray-600">Discover certified waste handling professionals in your area</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filter Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                name="activityType"
                value={filters.activityType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Types</option>
                <option value="plastic-recycling">Plastic Recycling</option>
                <option value="metal-recycling">Metal Recycling</option>
                <option value="paper-recycling">Paper Recycling</option>
                <option value="electronic-waste">Electronic Waste</option>
                <option value="organic-waste">Organic Waste</option>
                <option value="hazardous-waste">Hazardous Waste</option>
              </select>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
              <select
                name="validity"
                value={filters.validity}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="valid">Currently Valid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHandlers.map((handler) => (
            <div key={handler.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{handler.name}</h3>
                  <p className="text-gray-600">{handler.businessName}</p>
                </div>
                <div className="flex items-center">
                  {renderStars(handler.rating)}
                  <span className="ml-1 text-sm text-gray-600">({handler.rating})</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {handler.region}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Activity:</span> {handler.activityType}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      handler.certificationStatus === "Certified"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {handler.certificationStatus}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Valid Until:</span> {handler.validUntil}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {handler.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {handler.email}
                </div>
              </div>

              <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-semibold transition-colors">
                Contact Handler
              </button>
            </div>
          ))}
        </div>

        {filteredHandlers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No handlers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
