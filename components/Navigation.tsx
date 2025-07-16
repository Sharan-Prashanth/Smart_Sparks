"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Recycle, User, LogOut } from "lucide-react"
import { useAuth } from "./AuthProvider"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Recycle className="h-8 w-8 text-green-600" />
              <span className="font-bold text-xl text-gray-900">EcoWaste Cert</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>

            {!isAuthenticated ? (
              <Link href="/auth" className="text-gray-700 hover:text-green-600 transition-colors">
                Login / Register
              </Link>
            ) : (
              <>
                {user?.role === "recycler" && (
                  <>
                    <Link href="/apply-certification" className="text-gray-700 hover:text-green-600 transition-colors">
                      Apply Certification
                    </Link>
                    <Link href="/recycler-dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
                      Dashboard
                    </Link>
                  </>
                )}

                {user?.role === "wastecollector" && (
                  <Link
                    href="/wastecollector-dashboard"
                    className="text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                <Link href="/find-handlers" className="text-gray-700 hover:text-green-600 transition-colors">
                  Find Handlers
                </Link>
                <Link href="/price-prediction" className="text-gray-700 hover:text-green-600 transition-colors">
                  Price Prediction
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-green-600 transition-colors">
                  Admin
                </Link>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-green-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                Home
              </Link>

              {!isAuthenticated ? (
                <Link href="/auth" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                  Login / Register
                </Link>
              ) : (
                <>
                  {user?.role === "recycler" && (
                    <>
                      <Link href="/apply-certification" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                        Apply Certification
                      </Link>
                      <Link href="/recycler-dashboard" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                        Dashboard
                      </Link>
                    </>
                  )}

                  {user?.role === "wastecollector" && (
                    <Link
                      href="/wastecollector-dashboard"
                      className="block px-3 py-2 text-gray-700 hover:text-green-600"
                    >
                      Dashboard
                    </Link>
                  )}

                  <Link href="/find-handlers" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                    Find Handlers
                  </Link>
                  <Link href="/price-prediction" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                    Price Prediction
                  </Link>
                  <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                    Admin
                  </Link>

                  <div className="px-3 py-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{user?.name}</span>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
