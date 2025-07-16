"use client"

import type React from "react"
import { useState } from "react"
import { Building, Mail, FileText, Upload } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

function ApplyCertificationContent() {
  const [formData, setFormData] = useState({
    recyclerEmail: "",
    businessName: "",
    activityType: "",
    documents: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      // In a real implementation, you would handle file upload properly
      const applicationData = {
        recyclerEmail: formData.recyclerEmail,
        businessName: formData.businessName,
        activityType: formData.activityType,
        documentName: formData.documents?.name || "",
      }

      const response = await fetch("/api/certifications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Certification application submitted successfully!")
        setFormData({ recyclerEmail: "", businessName: "", activityType: "", documents: null })
      } else {
        setMessage(result.error || "Application failed")
      }
    } catch (error) {
      setMessage("An error occurred during application submission")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({
      ...formData,
      documents: file,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Certification</h1>
          <p className="text-gray-600">Submit your application for ethical waste handling certification</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This application is only available for registered recyclers.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recycler Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recycler Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="recyclerEmail"
                value={formData.recyclerEmail}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your registered email"
              />
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your business name"
              />
            </div>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select activity type</option>
                <option value="plastic-recycling">Plastic Recycling</option>
                <option value="metal-recycling">Metal Recycling</option>
                <option value="paper-recycling">Paper Recycling</option>
                <option value="electronic-waste">Electronic Waste</option>
                <option value="organic-waste">Organic Waste</option>
                <option value="hazardous-waste">Hazardous Waste</option>
                <option value="mixed-waste">Mixed Waste</option>
              </select>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-500 transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  {formData.documents ? formData.documents.name : "Click to upload documents"}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-semibold transition-colors"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </button>

          {/* Message */}
          {message && (
            <div
              className={`text-center p-3 rounded-md ${
                message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default function ApplyCertificationPage() {
  return (
    <ProtectedRoute allowedRoles={["recycler"]}>
      <ApplyCertificationContent />
    </ProtectedRoute>
  )
}
