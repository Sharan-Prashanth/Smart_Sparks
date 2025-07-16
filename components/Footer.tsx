import { Recycle, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Recycle className="h-8 w-8 text-green-400" />
              <span className="font-bold text-xl">EcoWaste Cert</span>
            </div>
            <p className="text-gray-300 mb-4">
              Leading the way in ethical waste handling certification with AI-powered compliance monitoring and
              sustainable practices.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="text-sm">contact@ecowastecert.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Certification Programs</li>
              <li>Compliance Monitoring</li>
              <li>Handler Verification</li>
              <li>Price Analytics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Contact Support</li>
              <li>Training Resources</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 EcoWaste Cert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
