"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Plus, Edit, ChevronRight, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Property {
  _id: string;
  address: string;
  currentRent: number;
  paymentStatus: string;
  paymentAmount: number;
}

interface Subordinate {
  _id: string;
  username: string;
  role: string;
  properties: Property[];
  subordinates: Subordinate[];
}

interface HierarchyData {
  _id: string;
  username: string;
  role: string;
  properties: Property[];
  subordinates: Subordinate[];
}

export default function HierarchyPage() {
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {}
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] =
    useState<Subordinate | null>(null);
  const [subordinateFormData, setSubordinateFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "subordinate",
    parentId: "",
  });
  const [propertyFormData, setPropertyFormData] = useState({
    address: "",
    currentRent: "",
    currentManager: "",
  });
  const { toast } = useToast();

  const handleAddSubordinateTwo = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const parentId = user._id;

      if (!token || !parentId) {
        throw new Error("Authentication token or user ID not found");
      }

      const payload = {
        username: subordinateFormData.username,
        email: subordinateFormData.email,
        phone: subordinateFormData.phone,
        password: subordinateFormData.password,
        role: "subordinate",
        parentId: parentId,
      };

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add subordinate");
      }

      toast({
        title: "Success",
        description: "Subordinate added successfully",
        variant: "default",
      });

      setSubordinateFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "subordinate",
        parentId: "",
      });

      const updatedResponse = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/hierarchy",
        {
          headers: { Authorization: `${token}` },
        }
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setHierarchyData(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add subordinate",
        variant: "destructive",
      });
    }
  };

  const handleAddPropertyTwo = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentManager = user._id;

      if (!token || !currentManager) {
        throw new Error("Authentication token or user ID not found");
      }

      const payload = {
        address: propertyFormData.address,
        currentRent: Number(propertyFormData.currentRent),
        currentManager: currentManager,
      };

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/properties/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add property");
      }

      toast({
        title: "Success",
        description: "Property added successfully",
        variant: "default",
      });

      setPropertyFormData({
        address: "",
        currentRent: "",
        currentManager: "",
      });

      const updatedResponse = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/hierarchy",
        {
          headers: { Authorization: `${token}` },
        }
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setHierarchyData(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add property",
        variant: "destructive",
      });
    }
  };

  const handleAddSubordinate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const payload = {
        username: subordinateFormData.username,
        email: subordinateFormData.email,
        phone: subordinateFormData.phone,
        password: subordinateFormData.password,
        role: "subordinate",
        parentId: subordinateFormData.parentId,
      };

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add subordinate");
      }

      toast({
        title: "Success",
        description: "Subordinate added successfully",
        variant: "default",
      });

      setSubordinateFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "subordinate",
        parentId: "",
      });

      const updatedResponse = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/hierarchy",
        {
          headers: { Authorization: `${token}` },
        }
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setHierarchyData(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add subordinate",
        variant: "destructive",
      });
    }
  };

  const handleAddProperty = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const payload = {
        address: propertyFormData.address,
        currentRent: Number(propertyFormData.currentRent),
        currentManager: propertyFormData.currentManager,
      };

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/properties/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add property");
      }

      toast({
        title: "Success",
        description: "Property added successfully",
        variant: "default",
      });

      setPropertyFormData({
        address: "",
        currentRent: "",
        currentManager: "",
      });

      const updatedResponse = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/hierarchy",
        {
          headers: { Authorization: `${token}` },
        }
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setHierarchyData(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add property",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          "https://renter-app-f0fc.onrender.com/api/users/hierarchy",
          {
            headers: { Authorization: `${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch hierarchy data");
        const data = await response.json();
        setHierarchyData(data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch hierarchy data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchyData();
  }, [toast]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateRentStats = (subordinate: Subordinate) => {
    let totalDue = 0;
    let totalCollected = 0;
    let totalProperties = 0;

    const processSubordinate = (sub: Subordinate) => {
      sub.properties.forEach((prop) => {
        totalProperties++;
        if (prop.paymentStatus === "paid") {
          totalCollected += prop.paymentAmount;
        } else {
          totalDue += prop.paymentAmount;
        }
      });
      sub.subordinates.forEach(processSubordinate);
    };

    processSubordinate(subordinate);
    return { totalDue, totalCollected, totalProperties };
  };

  const renderHierarchyTree = (node: Subordinate, level = 0) => {
    const isExpanded = expandedNodes[node._id];
    const { totalDue, totalCollected } = calculateRentStats(node);

    return (
      <div key={node._id} className="mb-2">
        <div
          className={`p-4 rounded-md ${
            level === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700"
          } shadow-sm flex items-center justify-between`}
          style={{ marginLeft: `${level * 1.5}rem` }}
        >
          <div className="flex items-center">
            {(node.subordinates.length > 0 || node.properties.length > 0) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleNode(node._id)}
                className="mr-2"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <div>
              <h3 className="font-medium">{node.username}</h3>
              <p className="text-xs text-muted-foreground">{node.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-red-500 mr-1">Rent Due:</span>
              <span>₹{totalDue}</span>
            </div>
            <div className="text-sm">
              <span className="text-green-500 mr-1">Rent Collected:</span>
              <span>₹{totalCollected}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(node)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubordinateFormData((prev) => ({
                  ...prev,
                  parentId: node._id,
                }));
                setPropertyFormData((prev) => ({
                  ...prev,
                  currentManager: node._id,
                }));
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div
            className="mt-2"
            style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
          >
            {node.properties.map((property) => (
              <div
                key={property._id}
                className="p-2 bg-gray-100 dark:bg-gray-600 rounded-md mb-1 flex justify-between"
              >
                <span>{property.address}</span>
                <span
                  className={
                    property.paymentStatus === "paid"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {property.paymentStatus === "paid"
                    ? `Paid: ₹${property.paymentAmount}`
                    : `Due: ₹${property.paymentAmount}`}
                </span>
              </div>
            ))}
            {node.subordinates.map((subordinate) =>
              renderHierarchyTree(subordinate, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const handleEditSubordinate = () => {
    toast({
      title: "Info",
      description: "Edit functionality not implemented yet",
    });
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (subordinate: Subordinate) => {
    setSelectedSubordinate(subordinate);
    setSubordinateFormData({
      username: subordinate.username,
      email: "",
      phone: "",
      password: "",
      role: subordinate.role,
      parentId: "",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hierarchy Management
            </h1>
            <p className="text-muted-foreground">
              Manage your organization's hierarchy structure
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  setSubordinateFormData((prev) => ({
                    ...prev,
                    parentId: user._id || "",
                  }));
                  setPropertyFormData((prev) => ({
                    ...prev,
                    currentManager: user._id || "",
                  }));
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Subordinate/Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Subordinate or Property</DialogTitle>
                <DialogDescription>
                  Add a new subordinate or property under the selected manager.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Subordinate Section */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Add Subordinate</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sub-username">Username</Label>
                      <Input
                        id="sub-username"
                        value={subordinateFormData.username}
                        onChange={(e) =>
                          setSubordinateFormData({
                            ...subordinateFormData,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-email">Email</Label>
                      <Input
                        id="sub-email"
                        type="email"
                        value={subordinateFormData.email}
                        onChange={(e) =>
                          setSubordinateFormData({
                            ...subordinateFormData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-phone">Phone</Label>
                      <Input
                        id="sub-phone"
                        value={subordinateFormData.phone}
                        onChange={(e) =>
                          setSubordinateFormData({
                            ...subordinateFormData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-password">Password</Label>
                      <Input
                        id="sub-password"
                        type="password"
                        value={subordinateFormData.password}
                        onChange={(e) =>
                          setSubordinateFormData({
                            ...subordinateFormData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={
                        subordinateFormData.parentId ===
                        JSON.parse(localStorage.getItem("user") || "{}")._id
                          ? handleAddSubordinateTwo
                          : handleAddSubordinate
                      }
                    >
                      Add Subordinate
                    </Button>
                  </div>
                </div>

                {/* Property Section */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Add Property</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="prop-address">Address</Label>
                      <Input
                        id="prop-address"
                        value={propertyFormData.address}
                        onChange={(e) =>
                          setPropertyFormData({
                            ...propertyFormData,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="prop-rent">Current Rent</Label>
                      <Input
                        id="prop-rent"
                        type="number"
                        value={propertyFormData.currentRent}
                        onChange={(e) =>
                          setPropertyFormData({
                            ...propertyFormData,
                            currentRent: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={
                        propertyFormData.currentManager ===
                        JSON.parse(localStorage.getItem("user") || "{}")._id
                          ? handleAddPropertyTwo
                          : handleAddProperty
                      }
                    >
                      Add Property
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subordinates Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : hierarchyData?.subordinates.length ? (
              <div>
                {hierarchyData.subordinates.map((subordinate) =>
                  renderHierarchyTree(subordinate)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subordinates found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subordinate</DialogTitle>
            <DialogDescription>
              Update subordinate information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Name</Label>
              <Input
                id="edit-username"
                value={subordinateFormData.username}
                onChange={(e) =>
                  setSubordinateFormData({
                    ...subordinateFormData,
                    username: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={subordinateFormData.email}
                onChange={(e) =>
                  setSubordinateFormData({
                    ...subordinateFormData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={subordinateFormData.phone}
                onChange={(e) =>
                  setSubordinateFormData({
                    ...subordinateFormData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={subordinateFormData.role}
                onValueChange={(value) =>
                  setSubordinateFormData({
                    ...subordinateFormData,
                    role: value,
                  })
                }
              >
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubordinate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
