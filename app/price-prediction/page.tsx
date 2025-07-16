"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, TrendingUp, AlertCircle } from "lucide-react"

export default function PricePredictionPage() {
  const [formData, setFormData] = useState({
    wasteType: "",
    quantity: "",
    region: "",
  })
  const [prediction, setPrediction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Integrate ML price prediction model here
    // This is a placeholder for the actual ML integration
    setTimeout(() => {
      setPrediction({
        estimatedPrice: Math.random() * 100 + 50,
        confidence: Math.random() * 30 + 70,
        marketTrend: Math.random() > 0.5 ? "up" : "down",
        factors: ["Regional demand", "Seasonal variations", "Material quality", "Market conditions"],
      })
      setIsLoading(false)
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Prediction</h1>
          <p className="text-gray-600">Get AI-powered price estimates for your waste materials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Calculator className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">Prediction Parameters</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
                <select
                  name="wasteType"
                  value={formData.wasteType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select waste type</option>
                  <option value="plastic">Plastic</option>
                  <option value="metal">Metal</option>
                  <option value="paper">Paper</option>
                  <option value="electronic">Electronic</option>
                  <option value="organic">Organic</option>
                  <option value="glass">Glass</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter quantity in kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your region"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-semibold transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Predicting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Predict Price
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Prediction Results</h2>

            {!prediction && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter your parameters and click "Predict Price" to see results</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing market data...</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                {/* AI ML Integration Placeholder */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">AI/ML Integration Placeholder</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    This section will be integrated with machine learning models for accurate price prediction
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-800 mb-2">${prediction.estimatedPrice.toFixed(2)}</h3>
                    <p className="text-green-600">Estimated Price per kg</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Confidence</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{prediction.confidence.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Market Trend</h4>
                    <div className="flex items-center">
                      <TrendingUp
                        className={`h-4 w-4 mr-1 ${
                          prediction.marketTrend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${prediction.marketTrend === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {prediction.marketTrend === "up" ? "Rising" : "Declining"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Price Factors</h4>
                  <ul className="space-y-2">
                    {prediction.factors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
