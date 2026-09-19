
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";

import DashboardLayout from "@/components/dashboard-layout";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Plus, Edit, ChevronRight, ChevronDown, Info } from "lucide-react";
import { Search, Filter, UserPlus, DollarSign, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { fetchHierarchy, fetchAllRenters, createUser, updateUser } from "@/services/userService";
import { createProperty, assignRenter, updateRent } from "@/services/propertyService";
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





















export default function HierarchyPage() {
  const [properties, setProperties] = useState([]);
  const [renters, setRenters] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [isAssignRenterDialogOpen, setIsAssignRenterDialogOpen] =
    useState(false);
  const [isChangeRentDialogOpen, setIsChangeRentDialogOpen] = useState(false);
  const [isRegisterRenterDialogOpen, setIsRegisterRenterDialogOpen] =
    useState(false);

  const [propertyFormData, setPropertyFormData] = useState({
    address: "",
    currentRent: "",
    currentManager: "",
  });
  const [renterFormData, setRenterFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "renter",
  });
  const [assignRenterData, setAssignRenterData] = useState({
    propertyId: "",
    renterId: "",
    startDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    endDate: "", // Optional
    annualIncreasePercentage: "0", // Default to 0
  });
  const [changeRentData, setChangeRentData] = useState({
    propertyId: "",
    newRent: "",
  });

  const [hierarchyData, setHierarchyData] = useState([]);
  const [globalAdjustments, setGlobalAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] =
    useState(null);
  const [subordinateFormData, setSubordinateFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "subordinate",
    parentId: "",
    fullName: "", // Add this new field
  });

  const [selectedProperty, setSelectedProperty] = useState(
    null
  );
  const [isPropertyEditDialogOpen, setIsPropertyEditDialogOpen] =
    useState(false);

  // New state to track dialog type
  const [dialogType, setDialogType] = useState("both");
  // Add these state variables in your component
  const [startDateDisplay, setStartDateDisplay] = useState("");
  const [endDateDisplay, setEndDateDisplay] = useState("");

  // In your useEffect or when dialog opens, initialize them:
  useEffect(() => {
    if (assignRenterData.startDate) {
      setStartDateDisplay(formatDateForDisplay(assignRenterData.startDate));
    }
    if (assignRenterData.endDate) {
      setEndDateDisplay(formatDateForDisplay(assignRenterData.endDate));
    }
  }, [assignRenterData.startDate, assignRenterData.endDate]);
  const { toast } = useToast();

  const { user } = useAuth();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (user) {
      setUserId(user._id);
    }
  }, [user]);


  //     // Set initial values for changeRentData

  //     // Set initial values for assignRenterData

  //     // Fetch renters
  //     );



  //         error instanceof Error ? error.message : "Failed to fetch renters",
  const handleOpenPropertyEditDialog = async (property) => {
    try {

      setSelectedProperty(property);

      // Set initial values for changeRentData
      setChangeRentData({
        propertyId: property.propertyId,
        newRent: "",
      });

      // Set initial values for assignRenterData with the new fields
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1); // First day of next month

      const nextYear = new Date(nextMonth);
      nextYear.setFullYear(nextMonth.getFullYear() + 1);
      nextYear.setDate(0); // Last day of the month

      setAssignRenterData({
        propertyId: property.propertyId,
        renterId: property.renter?.id || "",
        startDate: nextMonth.toISOString().split("T")[0],
        endDate: nextYear.toISOString().split("T")[0],
        annualIncreasePercentage: "0",
      });

      // Fetch renters
      const rentersData = await fetchAllRenters();
      setRenters(rentersData);

      setIsPropertyEditDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch renters",
        variant: "destructive",
      });
    }
  };
  const handleAddSubordinateTwo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) {
        throw new Error("Authentication token or user ID not found");
      }

      const payload = {
        username: subordinateFormData.username,
        email: subordinateFormData.email,
        phone: subordinateFormData.phone,
        password: subordinateFormData.password,
        role: "subordinate",
        parentId: userId,
        fullName: subordinateFormData.fullName, // Add this line
      };

      await createUser(payload);

      toast({
        title: "Success",
        description: "Subdivision added successfully",
        variant: "default",
      });

      setSubordinateFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "subordinate",
        parentId: "",
        fullName: "", // Reset this field as well
      });

      // Refresh hierarchy data
      fetchHierarchyData();

      // // Close the dialog
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add subordinate",
        variant: "destructive",
      });
    }
  };

  // Function to export hierarchy data to CSV
  const exportHierarchyToCSV = () => {
    try {
      // Prepare headers for CSV
      const headers = [
        "Manager Name",
        "Property Address",
        "Assigned To",
        "Base Rent",
        "Current Month Rent",
        "Total Pending",
        "Status",
      ];

      // Process hierarchy data into flat array for CSV
      const rows = [];

      const processSubordinate = (subordinate, level = 0) => {
        // Process each property under this subordinate
        subordinate.properties.forEach((property) => {
          rows.push([
            subordinate.username,
            property.address,
            property.renter?.username || "—",
            property.currentRent.toString(),
            property.currentMonthRent.finalAmount.toString(),
            property.totalPending.toString(),
            property.currentMonthRent.isPaid ? "Paid" : "Unpaid",
          ]);
        });

        // Process nested subordinates recursively
        subordinate.subordinates.forEach((sub) =>
          processSubordinate(sub, level + 1)
        );
      };

      // Process all hierarchy data
      hierarchyData.forEach((subordinate) => processSubordinate(subordinate));

      // If no data found
      if (rows.length === 0) {
        toast({
          title: "Nothing to export",
          description: "No property data found to export",
          variant: "destructive",
        });
        return;
      }

      // Convert to CSV format
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `property_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${rows.length} properties exported to CSV`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleAddPropertyTwo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) {
        throw new Error("Authentication token or user ID not found");
      }

      const payload = {
        address: propertyFormData.address,
        currentRent: Number(propertyFormData.currentRent),
        currentManager: userId,
      };

      await createProperty(payload);

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

      // Refresh hierarchy data
      fetchHierarchyData();

      // Close the dialog
      setIsAddDialogOpen(false);
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
    try {const payload = {
        username: subordinateFormData.username,
        email: subordinateFormData.email,
        phone: subordinateFormData.phone,
        password: subordinateFormData.password,
        role: "subordinate",
        parentId: subordinateFormData.parentId,
        fullName: subordinateFormData.fullName, // Add this line
      };

      await createUser(payload);

      toast({
        title: "Success",
        description: "Subdivision added successfully",
        variant: "default",
      });

      setSubordinateFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "subordinate",
        parentId: "",
        fullName: "", // Reset this field as well
      });

      // Refresh hierarchy data
      fetchHierarchyData();

      // Close the dialog
      setIsAddDialogOpen(false);
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
    try {const payload = {
        address: propertyFormData.address,
        currentRent: Number(propertyFormData.currentRent),
        currentManager: propertyFormData.currentManager,
      };

      await createProperty(payload);

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

      // Refresh hierarchy data
      fetchHierarchyData();

      // Close the dialog
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add property",
        variant: "destructive",
      });
    }
  };

  const fetchHierarchyData = async () => {
    try {
      const data = await fetchHierarchy();
      setHierarchyData(data.hierarchy);
      setGlobalAdjustments(data.globalAdjustments);
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


  //     );



  //     setIsAssignRenterDialogOpen(true);
  //         error instanceof Error ? error.message : "Failed to fetch renters",

  const handleAssignRenter = async () => {
    try {

      // Show loading toast
      // Show loading toast and capture the toast ID for later dismissal
      const { id: loadingToastId } = toast({
        title: "Processing",
        description: "Assigning renter to property...",
        variant: "default",
      });

      // Update request body to match new API requirements
      await assignRenter({
        propertyId: assignRenterData.propertyId,
        newRenterId: assignRenterData.renterId,
        startDate: assignRenterData.startDate,
        endDate: assignRenterData.endDate || undefined,
        annualIncreasePercentage: Number(assignRenterData.annualIncreasePercentage) || 0,
      });

      // Find the assigned renter's name for better feedback
      const assignedRenter = renters.find(
        (r) => r._id === assignRenterData.renterId
      );
      const renterName = assignedRenter?.username || "New renter";

      // Update hierarchyData in real-time
      setHierarchyData((prev) => {
        // Create a deep copy of the hierarchy data
        const updatedHierarchy = JSON.parse(JSON.stringify(prev));

        const updatePropertyInHierarchy = (nodes) => {
          for (const node of nodes) {
            // Check properties in this node
            for (let i = 0; i < node.properties.length; i++) {
              if (
                node.properties[i].propertyId === assignRenterData.propertyId
              ) {
                // Update the property with new renter info
                node.properties[i].renter = {
                  id: assignRenterData.renterId,
                  username: renterName,
                };
                return true;
              }
            }

            // Check in subordinates recursively
            if (node.subordinates.length > 0) {
              if (updatePropertyInHierarchy(node.subordinates)) {
                return true;
              }
            }
          }
          return false;
        };

        updatePropertyInHierarchy(updatedHierarchy);
        return updatedHierarchy;
      });

      // Success toast with specific details
      toast({
        title: "Success",
        description: `Renter "${renterName}" successfully assigned to property`,
        variant: "default",
      });

      // Close the dialog
      setIsPropertyEditDialogOpen(false);
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

      if (!selectedProperty?.propertyId || !changeRentData.newRent) {
        throw new Error("Property ID or new rent amount is missing");
      }

      // Make sure the rent is a positive number
      const newRentValue = Number(changeRentData.newRent);
      if (isNaN(newRentValue) || newRentValue <= 0) {
        throw new Error("Rent amount must be a positive number");
      }

      await updateRent({ propertyId: selectedProperty.propertyId, newRent: newRentValue });

      toast({
        title: "Success",
        description: "Rent updated successfully",
        variant: "default",
      });

      // Refresh hierarchy data to show updated values
      fetchHierarchyData();

      // Close the dialog
      setIsPropertyEditDialogOpen(false);
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

      const newRenterData = await createUser(renterFormData);

      toast({
        title: "Success",
        description: "Renter registered successfully",
      });

      const newRenter = {
        _id: newRenterData._id,
        username: newRenterData.username,
        email: newRenterData.email,
        phone: newRenterData.phone,
      };
      setRenters([...renters, newRenter]);

      setRenterFormData({
        username: "",
        email: "",
        phone: "",
        role: "renter",
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

  useEffect(() => {
    fetchHierarchyData();
  }, [toast]);

  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateRentStats = (subordinate) => {
    let totalDue = 0;
    let totalCollected = 0;
    let totalProperties = 0;

    const processSubordinate = (sub) => {
      (sub?.properties || []).forEach((prop) => {
        totalProperties++;
        totalDue += (prop?.totalPending || 0);
      });
      (sub?.subordinates || []).forEach(processSubordinate);
    };

    if (subordinate) {
      processSubordinate(subordinate);
    }
    return { totalDue, totalCollected, totalProperties };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const PropertyTable = ({
    properties,
    onEdit,
  }) => (
    <div className="overflow-x-auto mt-2 mb-4">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Property Name</th>
            <th className="px-4 py-2 text-left">Assigned to</th>
            <th className="px-4 py-2 text-left">Base Rent</th>
            <th className="px-4 py-2 text-left">This Month</th>
            <th className="px-4 py-2 text-left">Total Pending</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Edit Property</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.propertyId}>
              <td className="px-4 py-2">
                <Link
                  to={`/property/${property.propertyId}`}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  {property.address}
                </Link>
              </td>
              <td className="px-4 py-2">{property.renter?.username || "—"}</td>
              <td className="px-4 py-2">₹{property.currentRent}</td>
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <span className="font-medium">
                    ₹{property.currentMonthRent.finalAmount}
                  </span>
                  {property.currentMonthRent.adjustments.totalAdjustmentAmount >
                    0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Info className="h-4 w-4 ml-1.5 text-blue-500" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1 text-xs">
                            <p>{property.currentMonthRent.calculation} </p>
                            <div>
                              {property.currentMonthRent.adjustments.adjustments.map(
                                (adj, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between"
                                  >
                                    <span>{adj.type}:</span>
                                    <span>{adj.percentage}%</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">
                <span className="text-red-500">₹{property.totalPending}</span>
              </td>
              <td className="px-4 py-2">
                {property.currentMonthRent.isPaid === true ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                  >
                    Paid
                  </Badge>
                ) : property.currentMonthRent.isPaid === false ? (
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                  >
                    Unpaid
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                  >
                    N/A
                  </Badge>
                )}
              </td>
              <td className="px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(property)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderHierarchyTree = (node, level = 0) => {
    const isExpanded = expandedNodes[node.subordinateId];
    const { totalDue } = calculateRentStats(node);

    return (
      <div key={node.subordinateId} className="mb-2">
        <div
          className={`p-4 rounded-md ${
            level === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700"
          } shadow-sm flex items-center justify-between`}
          style={{ marginLeft: `${level * 1.5}rem` }}
        >
          <div className="flex items-center">
            {((node.subordinates?.length || 0) > 0 || (node.properties?.length || 0) > 0) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleNode(node.subordinateId)}
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
              <p className="text-xs text-muted-foreground">Subdivison</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-red-500 mr-1">Total Pending:</span>
              <span>₹{totalDue}</span>
            </div>
            <div className="text-sm">
              <span className="text-blue-500 mr-1">Properties:</span>
              <span>{node.properties?.length || 0}</span>
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(node)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit Subdivision
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubordinateFormData((prev) => ({
                  ...prev,
                  parentId: node.subordinateId,
                }));
                setPropertyFormData((prev) => ({
                  ...prev,
                  currentManager: node.subordinateId,
                }));
                setDialogType("property"); // Set to show subordinate section

                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Property
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div
            className="mt-2"
            style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
          >
            {/* Render the property table */}
            {(node.properties?.length || 0) > 0 && (
              <PropertyTable
                properties={node.properties}
                onEdit={(property) => handleOpenPropertyEditDialog(property)}
              />
            )}

            {/* Render subordinates recursively */}
            {(node.subordinates || []).map((subordinate) =>
              renderHierarchyTree(subordinate, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render the global adjustments section
  const renderGlobalAdjustments = () => {
    if (globalAdjustments.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2" />
            Current Global Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalAdjustments.map((adjustment) => (
              <div
                key={adjustment.id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">
                    {adjustment.type}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {adjustment.percentage}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Effective from {formatDate(adjustment.effectiveFrom)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateFromDisplay = (displayDate) => {
    if (!displayDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(displayDate)) return "";
    const [day, month, year] = displayDate.split("/");
    return `${year}-${month}-${day}`;
  };
  // Updated handleEditSubordinate to call the API
  const handleEditSubordinate = async () => {
    try {
      if (!selectedSubordinate) {
        throw new Error("No subordinate selected");
      }

      // Show a loading toast
      toast({
        title: "Processing",
        description: "Updating subordinate information...",
        variant: "default",
      });

      // Prepare payload with only the fields that are filled in
      const payload = {};

      if (subordinateFormData.username.trim()) {
        payload.username = subordinateFormData.username;
      }

      if (subordinateFormData.email.trim()) {
        payload.email = subordinateFormData.email;
      }

      if (subordinateFormData.phone.trim()) {
        payload.phone = subordinateFormData.phone;
      }

      if (subordinateFormData.fullName?.trim()) {
        payload.fullName = subordinateFormData.fullName;
      }
      if (subordinateFormData.password.trim()) {
        payload.password = subordinateFormData.password;
      }

      // Only make API call if we have fields to update
      if (Object.keys(payload).length === 0) {
        throw new Error("No changes to update");
      }

      console.log("sdfghgfd", subordinateFormData);
      await updateUser(selectedSubordinate.subordinateId, payload);

      // Handle successful response
      toast({
        title: "Success",
        description: "Subordinate updated successfully",
        variant: "default",
      });

      // Update UI by refreshing hierarchy data
      fetchHierarchyData();

      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update subordinate",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subordinate) => {
    setSelectedSubordinate(subordinate);

    // Populate the form with existing data
    setSubordinateFormData({
      username: subordinate.username || "",
      email: subordinate.email || "",
      phone: subordinate.phone || "",
      password: "", // Don't populate password for security reasons
      role: "subordinate",
      parentId: "",
      fullName: "", // We might not have this field from the API
    });

    // Optional: Fetch additional details if needed
    fetchSubordinateDetails(subordinate.subordinateId);

    setIsEditDialogOpen(true);
  };

  const fetchSubordinateDetails = async (subordinateId) => {
    try {

      // We don't have a fetchSubordinateDetails service, so ignoring this optional fetch.
      const data = {};
      // Add this inside fetchSubordinateDetails after the data is fetched
      console.log("Subordinate details from API:", data);
      // Update form with additional details if available
      setSubordinateFormData((prev) => ({
        ...prev,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        fullName: data.fullName || prev.fullName,
      }));
    } catch (error) {
      // Handle silently - we'll use whatever data we have
      console.error("Failed to fetch subordinate details:", error);
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Property Management | Property Management</title>
      </Helmet>
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Property Management
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubordinateFormData((prev) => ({
                        ...prev,
                        parentId: userId || "",
                      }));
                      setPropertyFormData((prev) => ({
                        ...prev,
                        currentManager: userId || "",
                      }));
                      setDialogType("subordinate"); // Only show subordinate section
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Subdivision
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                  <VisuallyHidden>
                    {" "}
                    <DialogHeader>
                      <DialogTitle>
                        {dialogType === "both"
                          ? "Add New Item"
                          : dialogType === "subordinate"
                          ? "Add New Subdivision"
                          : "Add New Property"}
                      </DialogTitle>
                      <DialogDescription>
                        {dialogType === "both"
                          ? "Add a new subordinate or property under the selected manager."
                          : dialogType === "subordinate"
                          ? "Add a new subdivision under the selected manager."
                          : "Add a new property under the selected manager."}
                      </DialogDescription>
                    </DialogHeader>
                  </VisuallyHidden>
                  <div className="grid gap-6 py-4">
                    {/* Subordinate Section - only shown when dialogType is "subordinate" or "both" */}
                    {(dialogType === "subordinate" ||
                      dialogType === "both") && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Add Subdivision
                        </h3>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="sub-username">
                              Subdivision Name
                            </Label>
                            <Input
                              id="sub-username"
                              placeholder="Login username"
                              value={subordinateFormData.username}
                              onChange={(e) =>
                                setSubordinateFormData({
                                  ...subordinateFormData,
                                  username: e.target.value,
                                })
                              }
                            />
                          </div>
                          <Button
                            onClick={
                              subordinateFormData.parentId === userId
                                ? handleAddSubordinateTwo
                                : handleAddSubordinate
                            }
                          >
                            Add Subordinate
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Property Section - only shown when dialogType is "property" or "both" */}
                    {(dialogType === "property" || dialogType === "both") && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Add Property
                        </h3>
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
                              propertyFormData.currentManager === userId
                                ? handleAddPropertyTwo
                                : handleAddProperty
                            }
                          >
                            Add Property
                          </Button>
                        </div>
                      </div>
                    )}
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
              <Button onClick={exportHierarchyToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export Files
              </Button>

              {/* <Button
                variant="default" // Change to filled variant for visibility
                onClick={() => {
                  console.log("Test toast button clicked");
                  try {
                    const { id } = toast({
                      title: "Test Toast",
                      description:
                        "This is a test notification to verify toast functionality",
                      variant: "destructive", // Try the destructive variant to be more visible
                      duration: 10000, // Extra long duration (10 seconds)
                      className: "z-[9999]", // Force high z-index
                    });
                    console.log("Toast triggered with ID:", id);
                  } catch (error) {
                    console.error("Toast error:", error);
                  }
                }}
              >
                Test Toast
              </Button> */}
              <Dialog
                open={isRegisterRenterDialogOpen}
                onOpenChange={setIsRegisterRenterDialogOpen}
              >
                <DialogTrigger asChild>
                  {/* <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Renter
                </Button> */}
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
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={renterFormData.username}
                        onChange={(e) =>
                          setRenterFormData({
                            ...renterFormData,
                            username: e.target.value,
                          })
                        }
                        required
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
                        required
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
                        pattern="\+?\d{10,15}"
                        required
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

          {/* Global Adjustments Section */}
          {/* {renderGlobalAdjustments()} */}

          <Card>
            <CardHeader>
              <CardTitle>Subdivisions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : hierarchyData.length ? (
                <div>
                  {hierarchyData.map((subordinate) =>
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
        {/* Subordinate Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subdivision</DialogTitle>
              <VisuallyHidden>
                <DialogDescription>
                  Update information for {selectedSubordinate?.username}
                </DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-fullname">Manager Name</Label>
                <Input
                  id="edit-fullname"
                  value={subordinateFormData.fullName}
                  onChange={(e) =>
                    setSubordinateFormData({
                      ...subordinateFormData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
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
        {/* Property Edit Dialog */}
        <Dialog
          open={isPropertyEditDialogOpen}
          onOpenChange={setIsPropertyEditDialogOpen}
        >
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
              <DialogDescription>
                Manage property details, assign renters, and update rent amount.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label>Property Name</Label>
                <Input value={selectedProperty?.address || ""} readOnly />
              </div>

              {/* Property Details Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Rent</Label>
                  <Input
                    value={`₹${selectedProperty?.currentRent || 0}`}
                    readOnly
                  />
                </div>
                {/* <h3 className="text-lg font-medium mb-2">Update Rent</h3> */}
                <div className="grid gap-2">
                  <Label htmlFor="newRent">New Base Rent Amount</Label>
                  <Input
                    id="newRent"
                    type="number"
                    value={changeRentData.newRent}
                    onChange={(e) =>
                      setChangeRentData({
                        ...changeRentData,
                        propertyId: selectedProperty?.propertyId || "",
                        newRent: e.target.value,
                      })
                    }
                  />
                  {/* <div className="text-xs text-muted-foreground mt-1">
                  Note: Global adjustments will be applied on top of this base
                  rent amount.
                </div> */}
                </div>
                {/* <div>
                <Label>Current Month Rent</Label>
                <div className="flex items-center mt-2">
                  <span className="font-medium">
                    ₹{selectedProperty?.currentMonthRent?.finalAmount || 0}
                  </span>
                  {selectedProperty?.currentMonthRent?.adjustments
                    ?.totalAdjustmentAmount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Info className="h-4 w-4 ml-1.5 text-blue-500" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1 text-xs">
                            <p>
                              {selectedProperty?.currentMonthRent?.calculation}
                            </p>
                            <div>
                              {selectedProperty?.currentMonthRent?.adjustments?.adjustments.map(
                                (adj, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between"
                                  >
                                    <span>{adj.type}:</span>
                                    <span>{adj.percentage}%</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div> */}
              </div>

              {/* Total Pending Section */}
              {/* <div>
              <Label>Total Pending</Label>
              <Input
                value={`₹${selectedProperty?.totalPending || 0}`}
                className="text-red-500"
                readOnly
              />
            </div> */}

              {/* Change Rent Section */}
              <div className="grid gap-2">
                <Button onClick={handleChangeRent} className="mt-2">
                  Update Rent
                </Button>
              </div>

              {/* Assign Renter Section */}
              <div>
                <div>
                  <Label>Current Renter</Label>
                  <Input
                    value={selectedProperty?.renter?.username || "—"}
                    readOnly
                    className="mb-2"
                  />
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="renter">Select New Renter</Label>
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

                  {/* Add new fields for start date, end date, and annual increase percentage */}
                  {/* <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={assignRenterData.startDate}
                        onChange={(e) =>
                          setAssignRenterData({
                            ...assignRenterData,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={assignRenterData.endDate}
                        onChange={(e) =>
                          setAssignRenterData({
                            ...assignRenterData,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div> */}
                  {/* Replace the current Start Date input */}
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      placeholder="DD/MM/YYYY"
                      value={startDateDisplay || ""}
                      onChange={(e) => {
                        setStartDateDisplay(e.target.value);
                        // Only convert to backend format if it's a valid date
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(e.target.value)) {
                          const backendDate = parseDateFromDisplay(
                            e.target.value
                          );
                          setAssignRenterData({
                            ...assignRenterData,
                            startDate: backendDate,
                          });
                        }
                      }}
                      onBlur={() => {
                        // When input loses focus, format the date for display
                        if (assignRenterData.startDate) {
                          setStartDateDisplay(
                            formatDateForDisplay(assignRenterData.startDate)
                          );
                        }
                      }}
                    />
                  </div>

                  {/* Replace the current End Date input */}
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      placeholder="DD/MM/YYYY"
                      value={endDateDisplay || ""}
                      onChange={(e) => {
                        setEndDateDisplay(e.target.value);
                        // Only convert to backend format if it's a valid date
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(e.target.value)) {
                          const backendDate = parseDateFromDisplay(
                            e.target.value
                          );
                          setAssignRenterData({
                            ...assignRenterData,
                            endDate: backendDate,
                          });
                        }
                      }}
                      onBlur={() => {
                        // When input loses focus, format the date for display
                        if (assignRenterData.endDate) {
                          setEndDateDisplay(
                            formatDateForDisplay(assignRenterData.endDate)
                          );
                        }
                      }}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="annualIncrease">
                      Annual Increase Percentage
                    </Label>
                    <Input
                      id="annualIncrease"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={assignRenterData.annualIncreasePercentage}
                      onChange={(e) =>
                        setAssignRenterData({
                          ...assignRenterData,
                          annualIncreasePercentage: e.target.value,
                        })
                      }
                    />
                    <div className="text-xs text-muted-foreground">
                      The rent will automatically increase by this percentage
                      each year.
                    </div>
                  </div>

                  <Button onClick={handleAssignRenter} className="mt-2">
                    Assign Renter
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Footer />
      </div>
    </DashboardLayout>
  );
}
