import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-600 border-t border-gray-200 py-16 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-1 space-y-4">
          <span className="text-xl font-bold text-gray-900 tracking-wider">FixForge</span>
          <p className="text-sm text-gray-500">
            Autonomous AI software engineering assistant for GitHub issue resolution and Docker testing.
          </p>
        </div>
        <div>
          <h4 className="text-gray-900 text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-gray-900 transition">Features</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Docker Sandbox</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Integrations</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Security</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-900 text-sm font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-gray-900 transition">Documentation</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">API Reference</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Blog</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Community</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-900 text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-gray-900 transition">About Us</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Careers</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Contact</a></li>
            <li><a href="#" className="hover:text-gray-900 transition">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto border-t border-gray-200 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Ready to fix bugs automatically?</h3>
          <p className="text-sm text-gray-600 mt-1">Connect your repository and import your first GitHub issue today.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm shadow-md">
          Get Started for Free
        </button>
      </div>

      <div className="max-w-6xl mx-auto text-center text-xs text-gray-500 mt-12">
        © {new Date().getFullYear()} FixForge. All rights reserved.
      </div>
    </footer>
  );
}
