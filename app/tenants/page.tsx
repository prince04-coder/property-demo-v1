"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  User,
  Home,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Check,
  Building,
  UserPlus,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subordinate {
  id: string;
  name: string;
}

interface RenterProperty {
  propertyId: string;
  address: string;
  currentRent: number;
  isActive: boolean;
  assignedFrom: string;
  totalDue: number;
  subordinate?: Subordinate; // New field for subordinate info
}

interface Renter {
  renterId: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  properties: RenterProperty[];
  defaulter?: boolean;
}

interface RenterPayment {
  property: {
    address: string;
    id: string;
  };
  month: string;
  amount: number;
  status: string;
  paymentId: string | null;
}

interface PropertyTimelineItem {
  month: string;
  property: {
    id: string;
    address: string;
  };
  rent: number;
  renter: string | null;
  status: string;
  paymentId: string | null;
}

// Type for filters
type FilterKey =
  | "username"
  | "email"
  | "phone"
  | "subordinate"
  | "defaulter"
  | "totalDue";

interface FilterValue {
  value: string;
  checked: boolean;
}

export default function UsersPage() {
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [propertyTimeline, setPropertyTimeline] = useState<
    PropertyTimelineItem[]
  >([]);
  const [renterPayments, setRenterPayments] = useState<RenterPayment[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<{
    id: string;
    address: string;
  } | null>(null);
  const [isRegisterRenterDialogOpen, setIsRegisterRenterDialogOpen] =
    useState(false);
  const [updatingDefaulter, setUpdatingDefaulter] = useState<string | null>(
    null
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filtersOpen, setFiltersOpen] = useState<{
    [key in FilterKey]?: boolean;
  }>({});
  const [filters, setFilters] = useState<{
    [key in FilterKey]?: FilterValue[];
  }>({});
  const [subordinateFilters, setSubordinateFilters] = useState<FilterValue[]>(
    []
  );

  // Add the missing renterFormData state
  const [renterFormData, setRenterFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "renter",
  });

  const { toast } = useToast();

  // Export to CSV function
  const exportToCSV = () => {
    const filteredData = getSortedAndFilteredRenters();

    if (filteredData.length === 0) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    // Define headers
    const headers = [
      "Name",
      "Username",
      "Contact No.",
      "Subordinate",
      "Properties",
      "Total Due",
      "Defaulter Status",
    ];

    // Create rows
    const rows = filteredData.map((renter) => [
      renter.username,
      renter.email,
      renter.phone,
      getRenterSubordinates(renter).join(", "),
      getPropertyCount(renter),
      getTotalDue(renter),
      renter.defaulter ? "Yes" : "No",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tenants_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filteredData.length} tenants exported to CSV`,
    });
  };

  // Add the handleRegisterRenter function
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register renter");
      }

      const newRenterData = await response.json();

      toast({
        title: "Success",
        description: "Renter registered successfully",
      });

      // Format the new renter to match your Renter interface
      const newRenter: Renter = {
        renterId: newRenterData._id,
        username: newRenterData.username,
        email: newRenterData.email,
        phone: newRenterData.phone,
        password: newRenterData.password || "",
        properties: [],
      };

      setRenters([...renters, newRenter]);

      // Reset form data
      setRenterFormData({
        username: "",
        email: "",
        phone: "",
        role: "renter",
      });

      setIsRegisterRenterDialogOpen(false);

      // Optionally refresh the full renter list to ensure data consistency
      fetchRenters();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to register renter",
        variant: "destructive",
      });
    }
  };

  const fetchRenters = async () => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      setLoading(true);
      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/renters",
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch renters data");
      }

      const data = await response.json();
      setRenters(data.renters || []);

      // Extract unique subordinates for filters
      const allSubordinates = new Set<string>();
      data.renters.forEach((renter: Renter) => {
        renter.properties.forEach((prop) => {
          if (prop.subordinate?.name) {
            allSubordinates.add(prop.subordinate.name);
          }
        });
      });

      // Set subordinate filters
      setSubordinateFilters(
        Array.from(allSubordinates).map((name) => ({
          value: name,
          checked: false,
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch renters data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenters();
  }, []);

  const fetchPropertyTimeline = async (
    propertyId: string,
    propertyAddress: string
  ) => {
    setLoadingTimeline(true);
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `https://renter-app-f0fc.onrender.com/api/properties/history/${propertyId}`,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch property history");
      }

      const data = await response.json();
      setPropertyTimeline(data.timeline || []);
      setSelectedPropertyDetails({ id: propertyId, address: propertyAddress });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch property history",
        variant: "destructive",
      });
      setPropertyTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const fetchRenterPayments = async (renterId: string) => {
    setLoadingPayments(true);
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `https://renter-app-f0fc.onrender.com/api/users/renter/homepage/${renterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch renter payments");
      }

      const data = await response.json();
      setRenterPayments(data.payments || []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch renter payments",
        variant: "destructive",
      });
      setRenterPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // New function to toggle defaulter status
  const toggleDefaulterStatus = async (
    renterId: string,
    currentStatus: boolean | undefined
  ) => {
    try {
      setUpdatingDefaulter(renterId);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const newStatus = !currentStatus;

      const response = await fetch(
        `https://renter-app-f0fc.onrender.com/api/users/update/${renterId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ defaulter: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update defaulter status");
      }

      const data = await response.json();

      // Update the renter in the local state
      setRenters((prev) =>
        prev.map((renter) =>
          renter.renterId === renterId
            ? { ...renter, defaulter: newStatus }
            : renter
        )
      );

      toast({
        title: "Success",
        description: `User marked as ${
          newStatus ? "defaulter" : "non-defaulter"
        }`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingDefaulter(null);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Helper functions

  const getTotalDue = (renter: Renter) => {
    return renter.properties.reduce((total, prop) => total + prop.totalDue, 0);
  };

  const getPropertyCount = (renter: Renter) => {
    // Count unique properties (by propertyId)
    const uniquePropertyIds = new Set();
    renter.properties.forEach((prop) => {
      if (prop.isActive) {
        uniquePropertyIds.add(prop.propertyId);
      }
    });
    return uniquePropertyIds.size;
  };

  const getRenterSubordinates = (renter: Renter): string[] => {
    const subordinateNames = new Set<string>();

    renter.properties.forEach((property) => {
      if (property.subordinate?.name) {
        subordinateNames.add(property.subordinate.name);
      }
    });

    return Array.from(subordinateNames);
  };

  const getSortedAndFilteredRenters = () => {
    // Apply search filter
    let filtered = renters.filter((renter) => {
      const matchesSearch =
        renter.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renter.phone.includes(searchTerm) ||
        renter.properties.some((prop) =>
          prop.subordinate?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );

      // Check subordinate filters
      let matchesSubordinateFilter = true;
      const activeSubordinateFilters = subordinateFilters.filter(
        (f) => f.checked
      );

      if (activeSubordinateFilters.length > 0) {
        matchesSubordinateFilter = renter.properties.some(
          (prop) =>
            prop.subordinate &&
            activeSubordinateFilters.some(
              (filter) => filter.value === prop.subordinate!.name
            )
        );
      }

      // Check defaulter filter
      let matchesDefaulterFilter = true;
      const defaulterFilter = filters.defaulter?.find((f) => f.checked);
      if (defaulterFilter) {
        matchesDefaulterFilter =
          defaulterFilter.value === "true"
            ? !!renter.defaulter
            : !renter.defaulter;
      }

      return (
        matchesSearch && matchesSubordinateFilter && matchesDefaulterFilter
      );
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortColumn) {
          case "username":
            valueA = a.username;
            valueB = b.username;
            break;
          case "email":
            valueA = a.email;
            valueB = b.email;
            break;
          case "phone":
            valueA = a.phone;
            valueB = b.phone;
            break;
          case "properties":
            valueA = getPropertyCount(a);
            valueB = getPropertyCount(b);
            break;
          case "totalDue":
            valueA = getTotalDue(a);
            valueB = getTotalDue(b);
            break;
          default:
            return 0;
        }

        // Compare values based on sort direction
        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return sortDirection === "asc"
            ? valueA > valueB
              ? 1
              : -1
            : valueB > valueA
            ? 1
            : -1;
        }
      });
    }

    return filtered;
  };

  const toggleSubordinateFilter = (name: string) => {
    setSubordinateFilters((prev) =>
      prev.map((filter) =>
        filter.value === name ? { ...filter, checked: !filter.checked } : filter
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "paid":
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Paid</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Pending</span>
          </div>
        );
      case "not paid":
      default:
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="h-4 w-4 mr-1" />
            <span>Not Paid</span>
          </div>
        );
    }
  };

  const openUserDetails = (renter: Renter) => {
    setSelectedRenter(renter);
    setIsDetailsOpen(true);
    // Reset timeline data when opening a new user
    setPropertyTimeline([]);
    setSelectedPropertyDetails(null);
    // Fetch payments for this renter
    fetchRenterPayments(renter.renterId);
  };

  const handlePropertySelect = (
    propertyId: string,
    propertyAddress: string
  ) => {
    fetchPropertyTimeline(propertyId, propertyAddress);
  };

  // Group payments by property for better display
  const getPaymentsByProperty = () => {
    const groupedPayments = new Map();

    renterPayments.forEach((payment) => {
      const key = payment.property.id;
      if (!groupedPayments.has(key)) {
        groupedPayments.set(key, {
          propertyId: payment.property.id,
          address: payment.property.address,
          payments: [],
        });
      }
      groupedPayments.get(key).payments.push(payment);
    });

    // Sort payments by date for each property
    groupedPayments.forEach((group) => {
      group.payments.sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
      );
    });

    return Array.from(groupedPayments.values());
  };

  // Get counts of payment statuses
  const getPaymentStatusCounts = () => {
    const counts = {
      paid: 0,
      pending: 0,
      notPaid: 0,
      total: 0,
    };

    renterPayments.forEach((payment) => {
      counts.total++;
      if (payment.status === "success") {
        counts.paid++;
      } else if (payment.status === "pending") {
        counts.pending++;
      } else {
        counts.notPaid++;
      }
    });

    return counts;
  };

  const filteredRenters = getSortedAndFilteredRenters();

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(95vh-64px)]">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Tenant Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users, locations..."
                  className="pl-8 border-2 border-gray-400 dark:border-gray-500 focus:border-gray-600 dark:focus:border-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog
                open={isRegisterRenterDialogOpen}
                onOpenChange={setIsRegisterRenterDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register Tenants
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register New Tenant</DialogTitle>
                    {/* <DialogDescription>
                    Add a new renter to the system.
                  </DialogDescription> */}
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

              <Button size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export Tenants
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button> */}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem className="font-medium text-sm py-2">
                    Filter by Subordinate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {subordinateFilters.map((filter) => (
                    <DropdownMenuCheckboxItem
                      key={filter.value}
                      checked={filter.checked}
                      onCheckedChange={() =>
                        toggleSubordinateFilter(filter.value)
                      }
                    >
                      {filter.value}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-medium text-sm py-2">
                    Filter by Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={
                      filters.defaulter?.find((f) => f.value === "true")
                        ?.checked
                    }
                    onCheckedChange={() => {
                      setFilters((prev) => ({
                        ...prev,
                        defaulter: [
                          {
                            value: "true",
                            checked: !prev.defaulter?.find(
                              (f) => f.value === "true"
                            )?.checked,
                          },
                          {
                            value: "false",
                            checked: false,
                          },
                        ],
                      }));
                    }}
                  >
                    Defaulters Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={
                      filters.defaulter?.find((f) => f.value === "false")
                        ?.checked
                    }
                    onCheckedChange={() => {
                      setFilters((prev) => ({
                        ...prev,
                        defaulter: [
                          {
                            value: "true",
                            checked: false,
                          },
                          {
                            value: "false",
                            checked: !prev.defaulter?.find(
                              (f) => f.value === "false"
                            )?.checked,
                          },
                        ],
                      }));
                    }}
                  >
                    Non-Defaulters Only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Card>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("username")}
                      >
                        <div className="flex items-center">
                          Name
                          {sortColumn === "username" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Username
                          {sortColumn === "email" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("phone")}
                      >
                        <div className="flex items-center">
                          Contact No.
                          {sortColumn === "phone" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead>Subordinate</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("properties")}
                      >
                        <div className="flex items-center">
                          Properties
                          {sortColumn === "properties" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("totalDue")}
                      >
                        <div className="flex items-center">
                          Total Due
                          {sortColumn === "totalDue" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        Defaulter Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRenters.length > 0 ? (
                      filteredRenters.map((renter) => (
                        <TableRow
                          key={renter.renterId}
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            renter.defaulter
                              ? "bg-red-50 dark:bg-red-900/10"
                              : ""
                          }`}
                          onClick={() => openUserDetails(renter)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              {renter.username}
                            </div>
                          </TableCell>
                          <TableCell>{renter.email}</TableCell>
                          <TableCell>{renter.phone}</TableCell>
                          <TableCell>
                            {getRenterSubordinates(renter).map((name) => (
                              <Badge
                                key={name}
                                variant="outline"
                                className="mr-1 mb-1"
                              >
                                <Building className="h-3 w-3 mr-1" />
                                {name}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {getPropertyCount(renter)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-500">
                              ₹{getTotalDue(renter)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDefaulterStatus(
                                  renter.renterId,
                                  renter.defaulter
                                );
                              }}
                              disabled={updatingDefaulter === renter.renterId}
                              className="relative p-2 h-auto w-auto rounded-full"
                            >
                              {updatingDefaulter === renter.renterId ? (
                                <div className="flex items-center justify-center h-8 w-8">
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                              ) : (
                                <div className="relative">
                                  <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                      renter.defaulter
                                        ? "bg-red-100 text-red-700"
                                        : "bg-slate-300 text-white"
                                    }`}
                                  >
                                    <div
                                      className={`h-4 w-4 rounded-full ${
                                        renter.defaulter
                                          ? "bg-red-500"
                                          : "bg-white"
                                      }`}
                                    ></div>
                                  </div>

                                  <span className="absolute -top-2 -right-2">
                                    {renter.defaulter ? (
                                      <Badge className="h-5 px-1 bg-red-500 text-white text-xs">
                                        !
                                      </Badge>
                                    ) : null}
                                  </span>
                                </div>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No users found matching your search or filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                User Details
                {selectedRenter?.defaulter && (
                  <Badge className="ml-2 bg-red-100 text-red-800 border-red-200">
                    Defaulter
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedRenter && (
              <Tabs
                defaultValue="info"
                className="flex flex-col flex-1 overflow-hidden"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">User Information</TabsTrigger>
                  <TabsTrigger value="properties">
                    Properties Details
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    User Payment History
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto pr-1">
                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Name
                        </h3>
                        <p className="text-lg font-medium">
                          {selectedRenter.username}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Username
                        </h3>
                        <p className="text-lg">{selectedRenter.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Contact No.
                        </h3>
                        <p className="text-lg">{selectedRenter.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Access Key
                        </h3>
                        <p className="text-lg font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded inline-block">
                          {selectedRenter.password}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Total Properties
                        </h3>
                        <p className="text-lg">
                          {getPropertyCount(selectedRenter)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Total Due Amount
                        </h3>
                        <p className="text-lg text-red-500">
                          ₹{getTotalDue(selectedRenter)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Properties rented in
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getRenterSubordinates(selectedRenter).map((name) => (
                            <Badge
                              key={name}
                              variant="outline"
                              className="flex items-center"
                            >
                              <Building className="h-3 w-3 mr-1" />
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="properties" className="mt-4">
                    <div className="space-y-4">
                      {selectedRenter.properties.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Property</TableHead>
                                <TableHead>Current Rent</TableHead>
                                <TableHead>Assigned From</TableHead>
                                <TableHead>Due Amount</TableHead>
                                <TableHead>Subordinate</TableHead>
                                <TableHead>Property Payment History</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* Group by propertyId and show only the latest assignment */}
                              {Array.from(
                                selectedRenter.properties.reduce(
                                  (map, property) => {
                                    const existing = map.get(
                                      property.propertyId
                                    );
                                    if (
                                      !existing ||
                                      new Date(property.assignedFrom) >
                                        new Date(existing.assignedFrom)
                                    ) {
                                      map.set(property.propertyId, property);
                                    }
                                    return map;
                                  },
                                  new Map()
                                )
                              ).map(([_, property]) => (
                                <TableRow key={property.propertyId}>
                                  <TableCell>
                                    <Link
                                      href={`/property/${property.propertyId}`}
                                      className="text-blue-500 hover:underline flex items-center"
                                    >
                                      <Home className="h-3.5 w-3.5 mr-1.5" />
                                      {property.address}
                                    </Link>
                                  </TableCell>
                                  <TableCell>₹{property.currentRent}</TableCell>
                                  <TableCell>
                                    {formatDate(property.assignedFrom)}
                                  </TableCell>
                                  <TableCell className="text-red-500">
                                    ₹{property.totalDue}
                                  </TableCell>
                                  <TableCell>
                                    {property.subordinate ? (
                                      <Badge
                                        variant="outline"
                                        className="flex items-center"
                                      >
                                        <Building className="h-3 w-3 mr-1" />
                                        {property.subordinate.name}
                                      </Badge>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent opening the user details modal
                                          handlePropertySelect(
                                            property.propertyId,
                                            property.address
                                          );
                                        }}
                                      ></Button>
                                      <Link
                                        href={`/property/${property.propertyId}`}
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => e.stopPropagation()} // Prevent opening the user details modal
                                      >
                                        <Calendar className="h-4 w-4 mr-2" />
                                      </Link>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No properties assigned
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="mt-4 pb-4">
                    <div className="space-y-4">
                      {loadingPayments ? (
                        <div className="space-y-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : renterPayments.length > 0 ? (
                        <>
                          {/* Payment Summary */}
                          <div className="grid grid-cols-4 gap-4">
                            {(() => {
                              const counts = getPaymentStatusCounts();
                              return (
                                <>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="text-sm text-muted-foreground">
                                        Total Payments
                                      </div>
                                      <div className="text-2xl font-bold">
                                        {counts.total}
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="text-sm text-muted-foreground">
                                        Paid
                                      </div>
                                      <div className="text-2xl font-bold text-green-500">
                                        {counts.paid}
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="text-sm text-muted-foreground">
                                        Pending
                                      </div>
                                      <div className="text-2xl font-bold text-yellow-500">
                                        {counts.pending}
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="text-sm text-muted-foreground">
                                        Not Paid
                                      </div>
                                      <div className="text-2xl font-bold text-red-500">
                                        {counts.notPaid}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </>
                              );
                            })()}
                          </div>

                          {/* Payment Details */}
                          {getPaymentsByProperty().map((propertyGroup) => (
                            <div
                              key={propertyGroup.propertyId}
                              className="mt-6"
                            >
                              <div className="flex items-center mb-3">
                                <Home className="h-4 w-4 mr-2" />
                                <h3 className="font-medium">
                                  {propertyGroup.address}
                                </h3>
                              </div>
                              <div className="space-y-3">
                                {propertyGroup.payments.map((payment, idx) => (
                                  <div
                                    key={`${payment.property.id}-${idx}`}
                                    className={`flex justify-between items-center border rounded-md p-3 ${
                                      payment.status === "success"
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                                        : payment.status === "pending"
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"
                                        : "bg-gray-50 dark:bg-gray-800/40"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <Calendar
                                        className={`h-4 w-4 mr-2 ${
                                          payment.status === "success"
                                            ? "text-green-500"
                                            : payment.status === "pending"
                                            ? "text-yellow-500"
                                            : "text-gray-500"
                                        }`}
                                      />
                                      <span>{formatMonth(payment.month)}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <span className="font-medium">
                                        ₹{payment.amount}
                                      </span>
                                      {getStatusBadge(payment.status)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                          <h3 className="font-medium mb-1">
                            No payment records found
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            This user doesn't have any payment records yet
                          </p>
                        </div>
                      )}

                      {/* Property Timeline (if a property is selected) */}
                      {propertyTimeline.length > 0 &&
                        selectedPropertyDetails && (
                          <div className="mt-8">
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-medium">
                                Detailed History:{" "}
                                {selectedPropertyDetails.address}
                              </h3>
                            </div>
                            <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800/40">
                              <div className="flex flex-col space-y-4">
                                {propertyTimeline.map((item, index) => (
                                  <div
                                    key={index}
                                    className={`flex flex-col sm:flex-row justify-between border rounded-md p-3 ${
                                      item.status === "success"
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                                        : item.status === "pending"
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"
                                        : "bg-white dark:bg-gray-900/40"
                                    }`}
                                  >
                                    <div className="flex items-start space-x-4">
                                      <div>
                                        <p className="font-medium">
                                          {formatMonth(item.month)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Renter:{" "}
                                          {item.renter || "None assigned"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium mr-3">
                                          ₹{item.rent}
                                        </span>
                                        {getStatusBadge(item.status)}
                                      </div>
                                      {item.paymentId && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Payment ID:{" "}
                                          {item.paymentId.substring(0, 8)}
                                          ...
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
        <Footer />
      </div>
    </DashboardLayout>
  );
}
