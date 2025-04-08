"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { ChevronDown, ChevronRight, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Property {
  _id: string
  address: string
  currentRent: number
  paymentStatus: string
  currentRenter: {
    _id: string
    username: string
  } | null
  paymentAmount: number
}

interface Subordinate {
  _id: string
  username: string
  role: string
  properties: Property[]
  subordinates: Subordinate[]
}

interface HierarchyData {
  _id: string
  username: string
  role: string
  properties: Property[]
  subordinates: Subordinate[]
}

export default function SubordinatesPage() {
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSubordinates, setExpandedSubordinates] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch("http://localhost:3001/api/users/hierarchy", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch hierarchy data")
        }

        const data = await response.json()
        setHierarchyData(data)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch hierarchy data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHierarchyData()
  }, [toast])

  const toggleSubordinate = (id: string) => {
    setExpandedSubordinates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Calculate total rent collected for a subordinate
  const calculateRentCollected = (properties: Property[]) => {
    return properties
      .filter((property) => property.paymentStatus === "paid")
      .reduce((total, property) => total + property.currentRent, 0)
  }

  // Calculate total rent due for a subordinate
  const calculateRentDue = (properties: Property[]) => {
    return properties.reduce((total, property) => total + property.currentRent, 0)
  }

  // Recursive function to render subordinates
  const renderSubordinates = (subordinates: Subordinate[], level = 0) => {
    if (!subordinates || subordinates.length === 0) return null

    return subordinates
      .filter((subordinate) => subordinate.username.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((subordinate) => {
        const totalRentDue = calculateRentDue(subordinate.properties)
        const totalRentCollected = calculateRentCollected(subordinate.properties)
        const rentRemaining = totalRentDue - totalRentCollected

        return (
          <div key={subordinate._id} className="mb-4">
            <div
              className={`p-4 rounded-md ${
                level === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700 ml-6"
              } shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSubordinate(subordinate._id)}
                    className="mr-2"
                  >
                    {expandedSubordinates[subordinate._id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <h3 className="font-medium">{subordinate.username}</h3>
                    <p className="text-xs text-muted-foreground">{subordinate.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rent Collected</p>
                    <p className="font-medium">₹{totalRentCollected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rent Due</p>
                    <p className="font-medium">₹{totalRentDue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-medium">₹{rentRemaining.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {expandedSubordinates[subordinate._id] && (
                <div className="mt-4">
                  {/* Properties Table */}
                  {subordinate.properties.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Properties</h4>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Address</TableHead>
                              <TableHead>Current Rent</TableHead>
                              <TableHead>Payment Status</TableHead>
                              <TableHead>Renter</TableHead>
                              <TableHead>Amount to Pay</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subordinate.properties
                              .filter((property) => statusFilter === "all" || property.paymentStatus === statusFilter)
                              .map((property) => (
                                <TableRow key={property._id}>
                                  <TableCell>{property.address}</TableCell>
                                  <TableCell>₹{property.currentRent.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        property.paymentStatus === "paid"
                                          ? "bg-green-100 text-green-800"
                                          : property.paymentStatus === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : property.paymentStatus === "failed"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {property.paymentStatus}
                                    </span>
                                  </TableCell>
                                  <TableCell>{property.currentRenter?.username || "Unassigned"}</TableCell>
                                  <TableCell>
                                    {property.paymentStatus !== "paid"
                                      ? `₹${property.paymentAmount.toLocaleString()}`
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Nested Subordinates */}
                  {subordinate.subordinates.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Subordinates</h4>
                      {renderSubordinates(subordinate.subordinates, level + 1)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subordinate Overview</h1>
          <p className="text-muted-foreground">Manage and monitor your subordinates and their properties</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subordinates..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="notPaid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subordinates List */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Subordinates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : hierarchyData?.subordinates && hierarchyData.subordinates.length > 0 ? (
              renderSubordinates(hierarchyData.subordinates)
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subordinates found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
