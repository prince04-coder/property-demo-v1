"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { Plus, Edit, ChevronRight, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Property {
  _id: string
  address: string
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

export default function HierarchyPage() {
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSubordinate, setSelectedSubordinate] = useState<Subordinate | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "manager",
    parentId: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch("https://renter-app-f0fc.onrender.com/api/users/hierarchy", {
          headers: {
            Authorization: `${token}`,
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

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAddSubordinate = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("http://localhost:3000/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create subordinate")
      }

      toast({
        title: "Success",
        description: "Subordinate created successfully",
      })

      // Reset form and refresh data
      setFormData({
        username: "",
        email: "",
        phone: "",
        role: "manager",
        parentId: "",
      })
      setIsAddDialogOpen(false)

      // Refetch hierarchy data
      setLoading(true)
      const updatedResponse = await fetch("http://localhost:3001/api/users/hierarchy", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!updatedResponse.ok) {
        throw new Error("Failed to fetch updated hierarchy data")
      }

      const updatedData = await updatedResponse.json()
      setHierarchyData(updatedData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subordinate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubordinate = () => {
    // This would be implemented if the API endpoint was available
    toast({
      title: "Info",
      description: "Edit functionality would be implemented here with the appropriate API endpoint",
    })
    setIsEditDialogOpen(false)
  }

  const openEditDialog = (subordinate: Subordinate) => {
    setSelectedSubordinate(subordinate)
    setFormData({
      username: subordinate.username,
      email: "", // Would be populated if available in the API
      phone: "", // Would be populated if available in the API
      role: subordinate.role,
      parentId: "", // Would be populated if available in the API
    })
    setIsEditDialogOpen(true)
  }

  // Count properties and subordinates recursively
  const countProperties = (subordinate: Subordinate): number => {
    return (
      subordinate.properties.length + subordinate.subordinates.reduce((total, sub) => total + countProperties(sub), 0)
    )
  }

  const countSubordinates = (subordinate: Subordinate): number => {
    return (
      subordinate.subordinates.length +
      subordinate.subordinates.reduce((total, sub) => total + countSubordinates(sub), 0)
    )
  }

  // Recursive function to render the hierarchy tree
  const renderHierarchyTree = (node: Subordinate, level = 0) => {
    const isExpanded = expandedNodes[node._id]
    const propertyCount = countProperties(node)
    const subordinateCount = countSubordinates(node)

    return (
      <div key={node._id} className="mb-2">
        <div
          className={`p-4 rounded-md ${
            level === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"
          } shadow-sm flex items-center justify-between`}
          style={{ marginLeft: `${level * 1.5}rem` }}
        >
          <div className="flex items-center">
            {node.subordinates.length > 0 && (
              <Button variant="ghost" size="icon" onClick={() => toggleNode(node._id)} className="mr-2">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <div>
              <h3 className="font-medium">{node.username}</h3>
              <p className="text-xs text-muted-foreground">{node.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground mr-1">Subordinates:</span>
              <span>{subordinateCount}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground mr-1">Properties:</span>
              <span>{propertyCount}</span>
            </div>
            <Button variant="outline" size="sm" className="ml-2" onClick={() => openEditDialog(node)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData((prev) => ({ ...prev, parentId: node._id }))
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {isExpanded && node.subordinates.length > 0 && (
          <div className="mt-2">
            {node.subordinates.map((subordinate) => renderHierarchyTree(subordinate, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hierarchy Management</h1>
            <p className="text-muted-foreground">Manage your organization's hierarchy structure</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subordinate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subordinate</DialogTitle>
                <DialogDescription>Create a new subordinate in your organization hierarchy.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Name</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSubordinate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subordinate</DialogTitle>
                <DialogDescription>Update subordinate information.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">Name</Label>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubordinate}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hierarchy Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : hierarchyData ? (
              <div>{renderHierarchyTree(hierarchyData)}</div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hierarchy data found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
