"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Building, LayoutDashboard, Users, Home, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
        setIsMobileView(true)
      } else {
        setIsSidebarOpen(true)
        setIsMobileView(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Subordinate Overview", path: "/subordinates", icon: <Users className="h-5 w-5" /> },
    { name: "Hierarchy Management", path: "/hierarchy", icon: <Building className="h-5 w-5" /> },
    { name: "Property Management", path: "/properties", icon: <Home className="h-5 w-5" /> },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold">Property Manager</span>
          </div>
          {isMobileView && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                {isMobileView && (
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium">Head Office Admin</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
