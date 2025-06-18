"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Search, Download, UserPlus, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Define types
interface Renter {
  id: string;
  username: string;
}

interface CurrentMonthRent {
  baseRent: number;
  finalAmount: number;
  adjustments: {
    adjustments: {
      type: string;
      percentage: number;
      amount: number;
      description: string;
    }[];
    totalAdjustmentPercentage: number;
    totalAdjustmentAmount: number;
  };
  isPaid: boolean;
  calculation: string;
}

interface RentDetail {
  month: string;
  baseRent: number;
  finalAmount: number;
  adjustmentBreakdown: {
    adjustments: {
      type: string;
      percentage: number;
      amount: number;
      description: string;
    }[];
    totalAdjustmentPercentage: number;
    totalAdjustmentAmount: number;
  };
  isPaid: boolean;
}

interface Property {
  propertyId: string;
  address: string;
  currentRent: number;
  totalPending: number;
  renter?: Renter;
  currentMonthRent: CurrentMonthRent;
  rentDetails: RentDetail[];
}

interface Subordinate {
  employeeName: string;
  subordinateId: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  properties: Property[];
  subordinates: Subordinate[];
}

interface GlobalAdjustment {
  id: string;
  type: string;
  percentage: number;
  effectiveFrom: string;
}

interface HierarchyData {
  globalAdjustments: GlobalAdjustment[];
  hierarchy: Subordinate[];
}

// SubordinateDetailsDialog component
// const SubordinateDetailsDialog: React.FC<{
//   subordinate: Subordinate | null;
//   isOpen: boolean;
//   onClose: () => void;
// }> = ({ subordinate, isOpen, onClose }) => {
//   if (!subordinate) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl flex items-center gap-2">
//             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-lg dark:bg-blue-900/30 dark:text-blue-300">
//               {subordinate.username.charAt(0).toUpperCase()}
//             </div>
//             {subordinate.username}
//           </DialogTitle>
//           <DialogDescription>
//             {subordinate.email} • {subordinate.phone}
//           </DialogDescription>
//         </DialogHeader>

//         {/* Properties Section */}
//         <div className="mt-4">
//           <h3 className="font-semibold mb-3">
//             Properties ({subordinate.properties.length})
//           </h3>

//           {subordinate.properties.length === 0 ? (
//             <div className="text-center py-4 bg-gray-50 rounded-md dark:bg-gray-800">
//               <p className="text-muted-foreground">No properties assigned</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {subordinate.properties.map((property) => (
//                 <div
//                   key={property.propertyId}
//                   className="bg-gray-50 p-4 rounded-md dark:bg-gray-800"
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <h4 className="font-medium">{property.address}</h4>
//                       <div className="text-sm text-gray-500 dark:text-gray-400">
//                         ID: {property.propertyId}
//                       </div>
//                       {property.renter && (
//                         <div className="text-sm mt-1">
//                           Rented to:{" "}
//                           <span className="font-medium">
//                             {property.renter.username}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                     <div className="text-right">
//                       <div className="font-medium">₹{property.currentRent}</div>
//                       <div
//                         className={`text-sm ${
//                           property.totalPending > 0
//                             ? "text-red-600 dark:text-red-400"
//                             : "text-green-600 dark:text-green-400"
//                         }`}
//                       >
//                         {property.totalPending > 0
//                           ? `₹${property.totalPending} pending`
//                           : "No pending amount"}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Current Month Rent */}
//                   <div className="bg-white p-3 rounded-md border border-gray-200 mb-3 dark:bg-gray-700 dark:border-gray-600">
//                     <div className="flex justify-between items-center mb-2">
//                       <h5 className="text-sm font-medium">
//                         Current Month Rent
//                       </h5>
//                       <span
//                         className={`text-xs px-2 py-0.5 rounded-full ${
//                           property.currentMonthRent.isPaid
//                             ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//                             : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//                         }`}
//                       >
//                         {property.currentMonthRent.isPaid ? "Paid" : "Unpaid"}
//                       </span>
//                     </div>
//                     <div className="text-sm">
//                       <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
//                         <span>Base Rent</span>
//                         <span>₹{property.currentMonthRent.baseRent}</span>
//                       </div>
//                       {property.currentMonthRent.adjustments.adjustments
//                         .length > 0 && (
//                         <div className="mt-1 space-y-1">
//                           {property.currentMonthRent.adjustments.adjustments.map(
//                             (adj, idx) => (
//                               <div
//                                 key={idx}
//                                 className="flex justify-between text-xs"
//                               >
//                                 <span>
//                                   {adj.type} ({adj.percentage}%)
//                                 </span>
//                                 <span>₹{adj.amount}</span>
//                               </div>
//                             )
//                           )}
//                           <div className="border-t border-dashed pt-1 mt-1"></div>
//                         </div>
//                       )}
//                       <div className="flex justify-between font-medium mt-1">
//                         <span>Final Amount</span>
//                         <span>₹{property.currentMonthRent.finalAmount}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Rent History */}
//                   <div>
//                     <h5 className="text-sm font-medium mb-2">
//                       Payment History
//                     </h5>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
//                       {property.rentDetails.map((rent, idx) => {
//                         const date = new Date(rent.month);
//                         const month = date.toLocaleString("default", {
//                           month: "short",
//                         });
//                         const year = date.getFullYear();

//                         return (
//                           <div
//                             key={idx}
//                             className={`text-center p-1 text-xs rounded ${
//                               rent.isPaid
//                                 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//                                 : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//                             }`}
//                             title={`${month} ${year}: ₹${rent.finalAmount} - ${
//                               rent.isPaid ? "Paid" : "Unpaid"
//                             }`}
//                           >
//                             {month} {year.toString().slice(2)}
//                             <div className="font-medium mt-1">
//                               ₹{rent.finalAmount}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Subordinates Section (if any) */}
//         {subordinate.subordinates && subordinate.subordinates.length > 0 && (
//           <div className="mt-6">
//             <h3 className="font-semibold mb-3">
//               Sub-subordinates ({subordinate.subordinates.length})
//             </h3>
//             <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
//               {subordinate.subordinates.map((sub) => (
//                 <div
//                   key={sub.subordinateId}
//                   className="border p-3 rounded-md dark:border-gray-700"
//                 >
//                   <div className="font-medium">{sub.username}</div>
//                   <div className="text-sm text-gray-500 dark:text-gray-400">
//                     {sub.email} • {sub.phone}
//                   </div>
//                   <div className="mt-1 text-sm">
//                     <span className="text-gray-500 dark:text-gray-400">
//                       Properties:{" "}
//                     </span>
//                     <span className="font-medium">{sub.properties.length}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* <DialogFooter>
//           <Button onClick={onClose}>Close</Button>
//         </DialogFooter> */}
//       </DialogContent>
//     </Dialog>
//   );
// };
// SubordinateDetailsDialog component
const SubordinateDetailsDialog: React.FC<{
  subordinate: Subordinate | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ subordinate, isOpen, onClose }) => {
  if (!subordinate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-lg dark:bg-blue-900/30 dark:text-blue-300">
              {subordinate.username.charAt(0).toUpperCase()}
            </div>
            {subordinate.username}
          </DialogTitle>
          <DialogDescription>
            {subordinate.employeeName} • {subordinate.phone}
          </DialogDescription>
        </DialogHeader>

        {/* User Credentials Section - Add this new section */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-2">Account Credentials</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Username
              </div>
              <div className="font-medium">{subordinate.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Password
              </div>
              <div className="font-medium">{subordinate.password || "—"}</div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mt-4">
          <h3 className="font-semibold mb-3">
            Properties ({subordinate.properties.length})
          </h3>

          {subordinate.properties.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-md dark:bg-gray-800">
              <p className="text-muted-foreground">No properties assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subordinate.properties.map((property) => (
                <div
                  key={property.propertyId}
                  className="bg-gray-50 p-4 rounded-md dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{property.address}</h4>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {property.propertyId}
                      </div>
                      {property.renter && (
                        <div className="text-sm mt-1">
                          Rented to:{" "}
                          <span className="font-medium">
                            {property.renter.username}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{property.currentRent}</div>
                      <div
                        className={`text-sm ${
                          property.totalPending > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {property.totalPending > 0
                          ? `₹${property.totalPending} pending`
                          : "No pending amount"}
                      </div>
                    </div>
                  </div>

                  {/* Current Month Rent */}
                  <div className="bg-white p-3 rounded-md border border-gray-200 mb-3 dark:bg-gray-700 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-medium">
                        Current Month Rent
                      </h5>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          property.currentMonthRent.isPaid
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {property.currentMonthRent.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Base Rent</span>
                        <span>₹{property.currentMonthRent.baseRent}</span>
                      </div>
                      {property.currentMonthRent.adjustments.adjustments
                        .length > 0 && (
                        <div className="mt-1 space-y-1">
                          {property.currentMonthRent.adjustments.adjustments.map(
                            (adj, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs"
                              >
                                <span>
                                  {adj.type} ({adj.percentage}%)
                                </span>
                                <span>₹{adj.amount}</span>
                              </div>
                            )
                          )}
                          <div className="border-t border-dashed pt-1 mt-1"></div>
                        </div>
                      )}
                      <div className="flex justify-between font-medium mt-1">
                        <span>Final Amount</span>
                        <span>₹{property.currentMonthRent.finalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rent History */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Payment History
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {property.rentDetails.map((rent, idx) => {
                        const date = new Date(rent.month);
                        const month = date.toLocaleString("default", {
                          month: "short",
                        });
                        const year = date.getFullYear();

                        return (
                          <div
                            key={idx}
                            className={`text-center p-1 text-xs rounded ${
                              rent.isPaid
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                            title={`${month} ${year}: ₹${rent.finalAmount} - ${
                              rent.isPaid ? "Paid" : "Unpaid"
                            }`}
                          >
                            {month} {year.toString().slice(2)}
                            <div className="font-medium mt-1">
                              ₹{rent.finalAmount}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subordinates Section (if any) */}
        {subordinate.subordinates && subordinate.subordinates.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">
              Sub-subordinates ({subordinate.subordinates.length})
            </h3>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {subordinate.subordinates.map((sub) => (
                <div
                  key={sub.subordinateId}
                  className="border p-3 rounded-md dark:border-gray-700"
                >
                  <div className="font-medium">{sub.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sub.email} • {sub.phone}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Properties:{" "}
                    </span>
                    <span className="font-medium">{sub.properties.length}</span>
                  </div>
                  {sub.password && (
                    <div className="mt-1 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Password:{" "}
                      </span>
                      <span className="font-medium">{sub.password}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function SubordinatesOverviewPage() {
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [flattenedSubordinates, setFlattenedSubordinates] = useState<
    Subordinate[]
  >([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Subordinate | "propertiesCount" | "totalPending";
    direction: "asc" | "desc";
  }>({
    key: "username",
    direction: "asc",
  });
  // State for details dialog
  const [selectedSubordinate, setSelectedSubordinate] =
    useState<Subordinate | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchHierarchyData();
  }, []);

  useEffect(() => {
    if (hierarchyData) {
      const subordinates = flattenHierarchy(hierarchyData.hierarchy);
      setFlattenedSubordinates(subordinates);
    }
  }, [hierarchyData]);

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/hierarchy/per-month",
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch hierarchy data");

      const data: HierarchyData = await response.json();
      setHierarchyData(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to flatten hierarchy into a single array of subordinates
  const flattenHierarchy = (subordinates: Subordinate[]): Subordinate[] => {
    let result: Subordinate[] = [];

    for (const subordinate of subordinates) {
      // Add current subordinate to result
      result.push(subordinate);

      // Recursively add child subordinates
      if (subordinate.subordinates && subordinate.subordinates.length > 0) {
        result = result.concat(flattenHierarchy(subordinate.subordinates));
      }
    }

    return result;
  };

  const handleSort = (
    key: keyof Subordinate | "propertiesCount" | "totalPending"
  ) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSubordinates = [...flattenedSubordinates].sort((a, b) => {
    if (sortConfig.key === "propertiesCount") {
      const aValue = a.properties.length;
      const bValue = b.properties.length;
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    } else if (sortConfig.key === "totalPending") {
      const aValue = a.properties.reduce(
        (sum, prop) => sum + prop.totalPending,
        0
      );
      const bValue = b.properties.reduce(
        (sum, prop) => sum + prop.totalPending,
        0
      );
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    }
  });

  const filteredSubordinates = sortedSubordinates.filter(
    (subordinate) =>
      subordinate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subordinate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subordinate.phone?.includes(searchTerm)
  );

  const calculateTotalPending = (subordinate: Subordinate) => {
    return subordinate.properties.reduce(
      (total, property) => total + property.totalPending,
      0
    );
  };

  const handleAddSubordinate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      // Get current user ID
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id;
      if (!userId) throw new Error("User ID not found");

      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "subordinate",
        parentId: userId,
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

      // Reset form and close dialog
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
      });
      setIsAddDialogOpen(false);

      // Refresh data
      fetchHierarchyData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add subordinate",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (filteredSubordinates.length === 0) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV headers
    const headers = [
      "Subordinate",
      "Subordinate Head",
      "User id",
      "Contact No.",
      "Properties",
      "Total Pending",
    ];

    // Create CSV rows
    const rows = filteredSubordinates.map((subordinate) => [
      subordinate.username,
      subordinate.employeeName || "—",
      subordinate.email || "",
      subordinate.phone || "",
      subordinate.properties.length,
      calculateTotalPending(subordinate),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "subordinates_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to show subordinate details
  const showSubordinateDetails = (subordinate: Subordinate) => {
    setSelectedSubordinate(subordinate);
    setIsDetailsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(95vh-64px)]">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Subordinates Management
              </h1>
              {/* <p className="text-muted-foreground">
              Manage and monitor all your subordinates in one place
            </p> */}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search subordinates..."
                  className="pl-8  pl-8 border-2 border-gray-400 dark:border-gray-500 focus:border-gray-600 dark:focus:border-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Subordinate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subordinate</DialogTitle>
                    <DialogDescription>
                      Create a new subordinate account under your management.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubordinate}>
                      Add Subordinate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            {/* <CardHeader className="pb-5">
            <CardTitle>All Subordinates</CardTitle>
            
          </CardHeader> */}
            {loading ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        onClick={() => handleSort("username")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Subordinate
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("email")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Subordinate Head
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("email")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          User id
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("phone")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Contact No.
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("propertiesCount")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Properties
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("totalPending")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Total Pending
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubordinates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No subordinates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubordinates.map((subordinate) => (
                        <TableRow
                          key={subordinate.subordinateId}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => showSubordinateDetails(subordinate)}
                        >
                          <TableCell className="font-medium">
                            {subordinate.username}
                          </TableCell>
                          <TableCell>{subordinate.email || "—"}</TableCell>
                          <TableCell>{subordinate.employeeName}</TableCell>
                          <TableCell>{subordinate.phone || "—"}</TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {subordinate.properties.length}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600 font-medium dark:text-red-400">
                              ₹{calculateTotalPending(subordinate)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {/* Subordinate Details Dialog */}
          <SubordinateDetailsDialog
            subordinate={selectedSubordinate}
            isOpen={isDetailsDialogOpen}
            onClose={() => setIsDetailsDialogOpen(false)}
          />
        </div>

        <Footer />
      </div>
    </DashboardLayout>
  );
}
