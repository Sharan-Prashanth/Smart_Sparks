"use client"

import { useState, useEffect } from "react"
import { Shield, Bell, XCircle, Calendar, Filter } from "lucide-react"

interface Certification {
  id: string
  recyclerName: string
  businessName: string
  certificationStatus: "Certified" | "Pending" | "Revoked"
  complianceStatus: "Compliant" | "Non-Compliant" | "Under Review"
  lastEvaluationDate: string
  activityType: string
  validUntil: string
}

export default function AdminDashboard() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedCert, setSelectedCert] = useState<string | null>(null)

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await fetch("/api/admin/certifications")
      const data = await response.json()
      setCertifications(data)
    } catch (error) {
      console.error("Error fetching certifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotify = async (certId: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificationId: certId, reason }),
      })

      if (response.ok) {
        alert("Notification sent successfully")
        fetchCertifications()
      }
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  const handleRevoke = async (certId: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificationId: certId, reason }),
      })

      if (response.ok) {
        alert("Certificate revoked successfully")
        fetchCertifications()
      }
    } catch (error) {
      console.error("Error revoking certificate:", error)
    }
  }

  const filteredCertifications = certifications.filter((cert) => {
    if (filter === "all") return true
    return cert.certificationStatus.toLowerCase() === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Certified":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Revoked":
        return "bg-red-100 text-red-800"
      case "Compliant":
        return "bg-green-100 text-green-800"
      case "Non-Compliant":
        return "bg-red-100 text-red-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor and manage certification compliance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.certificationStatus === "Certified").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.certificationStatus === "Pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.complianceStatus === "Non-Compliant").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.complianceStatus === "Under Review").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium">Filter by Status:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Certifications</option>
              <option value="certified">Certified</option>
              <option value="pending">Pending</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        {/* Certifications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Certification Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recycler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certification Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Evaluation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertifications.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cert.recyclerName}</div>
                        <div className="text-sm text-gray-500">{cert.activityType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cert.certificationStatus)}`}
                      >
                        {cert.certificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cert.complianceStatus)}`}
                      >
                        {cert.complianceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.lastEvaluationDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleNotify(cert.id, "Compliance reminder")}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Notify
                      </button>
                      {cert.certificationStatus === "Certified" && (
                        <button
                          onClick={() => handleRevoke(cert.id, "Non-compliance detected")}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCertifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No certifications found matching the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
