"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Plus, Search, Filter, UserPlus, DollarSign } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Renter {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
}

interface Property {
  _id: string;
  address: string;
  currentRent: number;
  paymentStatus: string;
  currentRenter: Renter | null;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [isAssignRenterDialogOpen, setIsAssignRenterDialogOpen] =
    useState(false);
  const [isChangeRentDialogOpen, setIsChangeRentDialogOpen] = useState(false);
  const [isRegisterRenterDialogOpen, setIsRegisterRenterDialogOpen] =
    useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [propertyFormData, setPropertyFormData] = useState({
    address: "",
    currentRent: "",
  });
  const [renterFormData, setRenterFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [assignRenterData, setAssignRenterData] = useState({
    renterId: "",
    propertyId: "",
  });
  const [changeRentData, setChangeRentData] = useState({
    propertyId: "",
    newRent: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          "https://renter-app-f0fc.onrender.com/api/properties/manager/67a1e9b03af77711ab07eeb5",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data);

        // For demo purposes, let's create some mock renters
        // In a real app, you would fetch this from an API
        const mockRenters: Renter[] = [
          { _id: "r1", username: "John Doe" },
          { _id: "r2", username: "Jane Smith" },
          { _id: "r3", username: "Robert Johnson" },
          { _id: "r4", username: "Emily Davis" },
        ];
        setRenters(mockRenters);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch properties",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const handleAddProperty = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}"); // Parse the user object from localStorage
      const currentManager = user._id; // Extract the logged-in user's ID as currentManager

      if (!token || !currentManager) {
        throw new Error("Authentication token or user ID not found");
      }

      const payload = {
        address: propertyFormData.address,
        currentRent: Number(propertyFormData.currentRent),
        currentManager: currentManager, // Use the logged-in user's ID as currentManager
      };

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/properties/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

      // Refetch properties to include the newly added property
      const updatedResponse = await fetch(
        "https://renter-app-f0fc.onrender.com/api/properties/manager/67a1e9b03af77711ab07eeb5",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setProperties(updatedData);
      }

      // Reset property form and close dialog
      setPropertyFormData({
        address: "",
        currentRent: "",
      });
      setIsAddPropertyDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add property",
        variant: "destructive",
      });
    }
  };
  const handleOpenAssignRenterDialog = async (property: Property) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Fetch renters from the API
      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/all-renters",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch renters");
      }

      const rentersData = await response.json();
      setRenters(rentersData);

      // Open the dialog and set the selected property
      setSelectedProperty(property);
      setAssignRenterData({
        propertyId: property._id,
        renterId: "",
      });
      setIsAssignRenterDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch renters",
        variant: "destructive",
      });
    }
  };
  const handleAssignRenter = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `https://renter-app-f0fc.onrender.com/api/properties/assign-renter/${assignRenterData.propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ renterId: assignRenterData.renterId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign renter");
      }

      toast({
        title: "Success",
        description: "Renter assigned successfully",
      });

      // Update the property in the local state
      setProperties((prevProperties) =>
        prevProperties.map((property) => {
          if (property._id === assignRenterData.propertyId) {
            const assignedRenter = renters.find(
              (r) => r._id === assignRenterData.renterId
            );
            return {
              ...property,
              currentRenter: assignedRenter || null,
            };
          }
          return property;
        })
      );

      setIsAssignRenterDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign renter",
        variant: "destructive",
      });
    }
  };

  const handleChangeRent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      if (!changeRentData.propertyId || !changeRentData.newRent) {
        throw new Error("Property ID or new rent amount is missing");
      }
      const response = await fetch(
        `https://renter-app-f0fc.onrender.com/api/properties/${changeRentData.propertyId}/rent`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ newRent: Number(changeRentData.newRent) }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update rent");
      }

      toast({
        title: "Success",
        description: "Rent updated successfully",
        variant: "default",
      });

      // Update the property in the local state
      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property._id === changeRentData.propertyId
            ? { ...property, currentRent: Number(changeRentData.newRent) }
            : property
        )
      );

      setIsChangeRentDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update rent",
        variant: "destructive",
      });
    }
  };

  const handleRegisterRenter = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/register-renter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(renterFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to register renter");
      }

      toast({
        title: "Success",
        description: "Renter registered successfully",
      });

      // Add the new renter to the local state with a mock ID
      const newRenter: Renter = {
        _id: `r${renters.length + 1}`,
        username: renterFormData.name,
        email: renterFormData.email,
        phone: renterFormData.phone,
      };
      setRenters([...renters, newRenter]);

      setRenterFormData({
        name: "",
        email: "",
        phone: "",
      });
      setIsRegisterRenterDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to register renter",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.currentRenter?.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;

    const matchesStatus =
      statusFilter === "all" || property.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Property & Renter Management
            </h1>
            <p className="text-muted-foreground">
              Manage properties, assign renters, and update rent amounts
            </p>
          </div>
          <div className="flex gap-2">
            {/* <Dialog
              open={isAddPropertyDialogOpen}
              onOpenChange={setIsAddPropertyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>
                    Create a new property in your portfolio.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
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
                    <Label htmlFor="currentRent">Current Rent</Label>
                    <Input
                      id="currentRent"
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
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddPropertyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddProperty}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog> */}

            <Dialog
              open={isAddPropertyDialogOpen}
              onOpenChange={setIsAddPropertyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>
                    Create a new property in your portfolio.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
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
                    <Label htmlFor="currentRent">Current Rent</Label>
                    <Input
                      id="currentRent"
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
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddPropertyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddProperty}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isRegisterRenterDialogOpen}
              onOpenChange={setIsRegisterRenterDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Renter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register New Renter</DialogTitle>
                  <DialogDescription>
                    Add a new renter to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={renterFormData.name}
                      onChange={(e) =>
                        setRenterFormData({
                          ...renterFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={renterFormData.email}
                      onChange={(e) =>
                        setRenterFormData({
                          ...renterFormData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={renterFormData.phone}
                      onChange={(e) =>
                        setRenterFormData({
                          ...renterFormData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRegisterRenterDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleRegisterRenter}>Register</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties or renters..."
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

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property ID</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Assigned Renter</TableHead>
                      <TableHead>Rent Amount</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property._id}>
                        <TableCell className="font-medium">
                          {property._id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{property.address}</TableCell>
                        <TableCell>
                          {property.currentRenter?.username || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          ₹{property.currentRent.toLocaleString()}
                        </TableCell>
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
                        <TableCell>
                          <div className="flex gap-2">
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setAssignRenterData({
                                  propertyId: property._id,
                                  renterId: "",
                                });
                                setIsAssignRenterDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign
                            </Button> */}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenAssignRenterDialog(property)
                              }
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                setChangeRentData({
                                  propertyId: property._id,
                                  newRent: property.currentRent.toString(),
                                });
                                setIsChangeRentDialogOpen(true);
                              }}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Rent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No properties found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign Renter Dialog */}
        <Dialog
          open={isAssignRenterDialogOpen}
          onOpenChange={setIsAssignRenterDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Renter</DialogTitle>
              <DialogDescription>
                Assign a renter to the selected property.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Property</Label>
                <Input value={selectedProperty?.address || ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renter">Select Renter</Label>
                <Select
                  value={assignRenterData.renterId}
                  onValueChange={(value) =>
                    setAssignRenterData({
                      ...assignRenterData,
                      renterId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a renter" />
                  </SelectTrigger>
                  <SelectContent>
                    {renters.map((renter) => (
                      <SelectItem key={renter._id} value={renter._id}>
                        {renter.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignRenterDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignRenter}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Rent Dialog */}
        <Dialog
          open={isChangeRentDialogOpen}
          onOpenChange={setIsChangeRentDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Rent Amount</DialogTitle>
              <DialogDescription>
                Update the rent amount for the selected property.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Property</Label>
                <Input value={selectedProperty?.address || ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newRent">New Rent Amount</Label>
                <Input
                  id="newRent"
                  type="number"
                  value={changeRentData.newRent}
                  onChange={(e) =>
                    setChangeRentData({
                      ...changeRentData,
                      newRent: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsChangeRentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleChangeRent}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
