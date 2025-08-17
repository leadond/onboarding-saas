'use client'

import { useState } from 'react'

export default function PlatinumDemoPage() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-platinum-50 to-platinum-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-platinum-900 mb-4">
            Platinum Enterprise Theme Demo
          </h1>
          <p className="text-lg text-platinum-600">
            Explore the new enterprise-grade components and styling
          </p>
        </div>

        {/* Navigation Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Navigation</h2>
          <nav className="nav-platinum max-w-md">
            <a href="#" className="nav-item-active">Dashboard</a>
            <a href="#" className="nav-item">Analytics</a>
            <a href="#" className="nav-item">Settings</a>
            <a href="#" className="nav-item">Help</a>
          </nav>
        </section>

        {/* Buttons Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-platinum-primary">Primary Action</button>
            <button className="btn-platinum-secondary">Secondary Action</button>
            <button className="btn-platinum-primary" disabled>Disabled Primary</button>
            <button className="btn-platinum-secondary" disabled>Disabled Secondary</button>
          </div>
        </section>

        {/* Cards Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-platinum">
              <div className="card-platinum-header">
                <h3 className="text-lg font-semibold text-platinum-900">Analytics</h3>
              </div>
              <div className="card-platinum-body">
                <p className="text-platinum-600 mb-4">
                  View detailed analytics and insights about your onboarding process.
                </p>
                <div className="flex items-center justify-between">
                  <span className="badge-platinum-primary">New</span>
                  <button className="btn-platinum-secondary text-sm">View Details</button>
                </div>
              </div>
            </div>

            <div className="card-platinum">
              <div className="card-platinum-header">
                <h3 className="text-lg font-semibold text-platinum-900">Team Management</h3>
              </div>
              <div className="card-platinum-body">
                <p className="text-platinum-600 mb-4">
                  Manage your team members and their permissions.
                </p>
                <div className="flex items-center justify-between">
                  <span className="badge-platinum-success">Active</span>
                  <button className="btn-platinum-secondary text-sm">Manage Team</button>
                </div>
              </div>
            </div>

            <div className="card-platinum">
              <div className="card-platinum-header">
                <h3 className="text-lg font-semibold text-platinum-900">Settings</h3>
              </div>
              <div className="card-platinum-body">
                <p className="text-platinum-600 mb-4">
                  Configure your application settings and preferences.
                </p>
                <div className="flex items-center justify-between">
                  <span className="badge-platinum-warning">Review</span>
                  <button className="btn-platinum-secondary text-sm">Configure</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Table Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Data Table</h2>
          <div className="table-platinum">
            <table>
              <thead>
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Last Active</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row">
                  <td className="font-medium text-platinum-900">John Doe</td>
                  <td className="text-platinum-600">john@example.com</td>
                  <td>
                    <span className="badge-platinum-success">Active</span>
                  </td>
                  <td className="text-platinum-600">2 hours ago</td>
                  <td>
                    <button className="btn-platinum-secondary text-sm">Edit</button>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="font-medium text-platinum-900">Jane Smith</td>
                  <td className="text-platinum-600">jane@example.com</td>
                  <td>
                    <span className="badge-platinum-warning">Pending</span>
                  </td>
                  <td className="text-platinum-600">1 day ago</td>
                  <td>
                    <button className="btn-platinum-secondary text-sm">Edit</button>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="font-medium text-platinum-900">Bob Johnson</td>
                  <td className="text-platinum-600">bob@example.com</td>
                  <td>
                    <span className="badge-platinum-error">Inactive</span>
                  </td>
                  <td className="text-platinum-600">1 week ago</td>
                  <td>
                    <button className="btn-platinum-secondary text-sm">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Forms Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-platinum-700 mb-2">
                Text Input
              </label>
              <input
                type="text"
                className="input-platinum"
                placeholder="Enter your name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-platinum-700 mb-2">
                Select Dropdown
              </label>
              <select
                className="select-platinum"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                <option value="">Select an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </div>
          </div>
        </section>

        {/* Alerts Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Alerts</h2>
          <div className="space-y-4 max-w-2xl">
            <div className="alert-platinum-info">
              <p className="font-medium">Information</p>
              <p>This is an informational message to inform users about something important.</p>
            </div>
            <div className="alert-platinum-success">
              <p className="font-medium">Success</p>
              <p>Your changes have been saved successfully!</p>
            </div>
            <div className="alert-platinum-warning">
              <p className="font-medium">Warning</p>
              <p>Please review your input before proceeding.</p>
            </div>
            <div className="alert-platinum-error">
              <p className="font-medium">Error</p>
              <p>An error occurred. Please try again later.</p>
            </div>
          </div>
        </section>

        {/* Badges Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge-platinum-primary">Primary</span>
            <span className="badge-platinum-secondary">Secondary</span>
            <span className="badge-platinum-success">Success</span>
            <span className="badge-platinum-warning">Warning</span>
            <span className="badge-platinum-error">Error</span>
          </div>
        </section>

        {/* Hover Effects Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Hover Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-platinum hover-lift">
              <div className="card-platinum-body text-center">
                <h3 className="text-lg font-semibold text-platinum-900 mb-2">Lift Effect</h3>
                <p className="text-platinum-600">Hover over this card to see the lift effect</p>
              </div>
            </div>
            <div className="card-platinum hover-scale">
              <div className="card-platinum-body text-center">
                <h3 className="text-lg font-semibold text-platinum-900 mb-2">Scale Effect</h3>
                <p className="text-platinum-600">Hover over this card to see the scale effect</p>
              </div>
            </div>
            <div className="card-platinum hover-lift-modern">
              <div className="card-platinum-body text-center">
                <h3 className="text-lg font-semibold text-platinum-900 mb-2">Modern Lift</h3>
                <p className="text-platinum-600">Hover over this card to see the modern lift effect</p>
              </div>
            </div>
          </div>
        </section>

        {/* Glass Effects Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-platinum-900 mb-6">Glass Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-light p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Light Glass</h3>
              <p className="text-white/80">Subtle glass effect with light transparency</p>
            </div>
            <div className="glass-medium p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Medium Glass</h3>
              <p className="text-white/80">Moderate glass effect with medium transparency</p>
            </div>
            <div className="glass-strong p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Strong Glass</h3>
              <p className="text-white/80">Strong glass effect with high transparency</p>
            </div>
          </div>
        </section>

        <div className="text-center mt-12">
          <button className="btn-platinum-primary text-lg px-8 py-4">
            Get Started with Platinum Enterprise
          </button>
        </div>
      </div>
    </div>
  )
}