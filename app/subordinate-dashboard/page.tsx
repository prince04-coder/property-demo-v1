// "use client";

// import { useState, useEffect, useMemo } from "react";
// import DashboardLayout from "@/components/dashboard-layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useToast } from "@/components/ui/use-toast";
// import { Footer } from "@/components/ui/footer";
// import {
//   IndianRupee,
//   CalendarDays,
//   PieChart,
//   ArrowUpRight,
//   Building,
//   Home,
//   CheckCircle,
//   XCircle,
//   BarChart,
//   RefreshCw,
// } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { BarChart as Chart } from "@/components/ui/bar-chart";
// import { Button } from "@/components/ui/button";

// // Define interfaces
// interface AdjustmentDetail {
//   type: string;
//   percentage: number;
//   amount: number;
//   description: string;
// }

// interface AdjustmentBreakdown {
//   adjustments: AdjustmentDetail[];
//   totalAdjustmentPercentage: number;
//   totalAdjustmentAmount: number;
// }

// interface CurrentMonthRent {
//   baseRent: number;
//   finalAmount: number;
//   adjustments: AdjustmentBreakdown;
//   isPaid: boolean | null;
//   noRenter?: boolean;
//   calculation: string;
// }

// interface RentDetail {
//   month: string;
//   baseRent: number;
//   finalAmount: number;
//   adjustmentBreakdown: AdjustmentBreakdown;
//   isPaid: boolean | null;
//   noRenter?: boolean;
// }

// interface Renter {
//   id: string;
//   username: string;
// }

// interface Property {
//   propertyId: string;
//   address: string;
//   currentRent: number;
//   totalPending: number;
//   renter?: Renter;
//   currentMonthRent: CurrentMonthRent;
//   rentDetails: RentDetail[];
// }

// interface Subordinate {
//   subordinateId: string;
//   username: string;
//   employeeName?: string;
//   password?: string;
//   email?: string;
//   phone?: string;
//   properties: Property[];
//   subordinates: Subordinate[];
// }

// interface GlobalAdjustment {
//   id: string;
//   type: string;
//   percentage: number;
//   effectiveFrom: string;
// }

// interface UserData {
//   userId: string;
//   username: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   role: string;
// }

// interface HierarchyResponse {
//   globalAdjustments: GlobalAdjustment[];
//   hierarchy: Subordinate[];
//   user?: UserData;
//   properties?: Property[];
// }

// export default function SubordinateDashboardPage() {
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [hierarchyData, setHierarchyData] = useState<HierarchyResponse | null>(
//     null
//   );
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [properties, setProperties] = useState<Property[]>([]);
//   const { toast } = useToast();

//   // Fetch data
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setRefreshing(true);

//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("Authentication token not found");
//       }

//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       const userId = user?._id;
//       if (!userId) {
//         throw new Error("User ID not found");
//       }

//       const response = await fetch(
//         "http://localhost:3001/api/users/hierarchy/per-month",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch data");
//       }

//       const data: HierarchyResponse = await response.json();
//       console.log("API Response:", data);

//       setHierarchyData(data);

//       // Set user data
//       if (data.user) {
//         setUserData(data.user);
//       }

//       // Set properties
//       if (data.properties && data.properties.length > 0) {
//         setProperties(data.properties);
//         toast({
//           title: "Data loaded successfully",
//           description: `Loaded ${data.properties.length} properties`,
//         });
//       } else {
//         toast({
//           title: "No properties found",
//           description: "You don't have any properties assigned to you",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Failed to fetch data",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Calculate metrics
//   const metrics = useMemo(() => {
//     if (!properties || properties.length === 0) return null;

//     const totalProperties = properties.length;
//     let totalRent = 0;
//     let totalPending = 0;
//     let paidCount = 0;
//     let unpaidCount = 0;

//     properties.forEach((property) => {
//       totalRent += property.currentMonthRent.finalAmount;
//       totalPending += property.totalPending;

//       // Handle isPaid being null
//       if (property.currentMonthRent.isPaid === true) {
//         paidCount++;
//       } else if (property.currentMonthRent.isPaid === false) {
//         unpaidCount++;
//       }
//     });

//     // Only count properties with actual payment status (not null)
//     const propertiesWithPaymentStatus = paidCount + unpaidCount;

//     const collectionRate =
//       propertiesWithPaymentStatus > 0
//         ? Math.round((paidCount / propertiesWithPaymentStatus) * 100)
//         : 0;

//     // Monthly collection data for chart
//     const monthlyData = [];
//     const currentDate = new Date();
//     const months = [];

//     // Get last 6 months
//     for (let i = 5; i >= 0; i--) {
//       const month = new Date(currentDate);
//       month.setMonth(currentDate.getMonth() - i);
//       months.push(month);
//     }

//     // Create chart data
//     months.forEach((month) => {
//       const monthStr = month.toLocaleDateString("default", {
//         month: "short",
//         year: "numeric",
//       });
//       let collected = 0;
//       let pending = 0;

//       // For each property, check the rent for this month
//       properties.forEach((property) => {
//         // Find the rent detail for this month
//         const rentDetail = property.rentDetails.find((detail) => {
//           const detailMonth = new Date(detail.month);
//           return (
//             detailMonth.getMonth() === month.getMonth() &&
//             detailMonth.getFullYear() === month.getFullYear()
//           );
//         });

//         if (rentDetail) {
//           if (rentDetail.isPaid === true) {
//             collected += rentDetail.finalAmount;
//           } else if (rentDetail.isPaid === false) {
//             pending += rentDetail.finalAmount;
//           }
//         }
//       });

//       monthlyData.push({
//         name: monthStr,
//         collected,
//         pending,
//       });
//     });

//     return {
//       totalProperties,
//       totalRent,
//       totalPending,
//       paidCount,
//       unpaidCount,
//       collectionRate,
//       monthlyData,
//     };
//   }, [properties]);

//   // Format currency
//   const formatCurrency = (amount: number) => {
//     return `₹${amount.toLocaleString("en-IN")}`;
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     }).format(date);
//   };

//   if (loading && !refreshing) {
//     return (
//       <DashboardLayout>
//         <div className="space-y-6">
//           <Skeleton className="h-12 w-48" />
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//             <Skeleton className="h-32" />
//             <Skeleton className="h-32" />
//             <Skeleton className="h-32" />
//             <Skeleton className="h-32" />
//           </div>
//           <Skeleton className="h-64" />
//           <Skeleton className="h-96" />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="flex flex-col min-h-[calc(100vh-64px)]">
//         <div className="space-y-6 flex-grow">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-2xl font-bold tracking-tight">
//                 Subordinate Dashboard
//               </h1>
//               <p className="text-muted-foreground">
//                 Welcome, {userData?.username || "User"}
//               </p>
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               className="flex items-center gap-2"
//               onClick={fetchData}
//               disabled={refreshing}
//             >
//               <RefreshCw
//                 className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
//               />
//               {refreshing ? "Refreshing..." : "Refresh Data"}
//             </Button>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-center">
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Total Properties
//                     </p>
//                     <h2 className="text-2xl font-bold">
//                       {metrics?.totalProperties || 0}
//                     </h2>
//                   </div>
//                   <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
//                     <Building className="h-6 w-6 text-primary" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-center">
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Current Month Rent
//                     </p>
//                     <h2 className="text-2xl font-bold">
//                       {formatCurrency(metrics?.totalRent || 0)}
//                     </h2>
//                   </div>
//                   <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
//                     <IndianRupee className="h-6 w-6 text-primary" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-center">
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Total Pending
//                     </p>
//                     <h2 className="text-2xl font-bold text-red-500">
//                       {formatCurrency(metrics?.totalPending || 0)}
//                     </h2>
//                   </div>
//                   <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
//                     <ArrowUpRight className="h-6 w-6 text-red-500" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-center">
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium text-muted-foreground">
//                       Collection Rate
//                     </p>
//                     <h2 className="text-2xl font-bold">
//                       {metrics?.collectionRate || 0}%
//                     </h2>
//                   </div>
//                   <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
//                     <PieChart className="h-6 w-6 text-green-500" />
//                   </div>
//                 </div>
//                 <Progress
//                   className="mt-3"
//                   value={metrics?.collectionRate || 0}
//                 />
//               </CardContent>
//             </Card>
//           </div>

//           {refreshing && (
//             <div className="w-full bg-muted/30 py-2 px-4 rounded-md flex items-center justify-center">
//               <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//               <span className="text-sm">Refreshing data...</span>
//             </div>
//           )}

//           {/* Monthly Collection Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <BarChart className="h-5 w-5 mr-2" />
//                 Monthly Rent Collection
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-80">
//                 {metrics?.monthlyData && metrics.monthlyData.length > 0 ? (
//                   <Chart
//                     data={metrics.monthlyData}
//                     index="name"
//                     categories={["collected", "pending"]}
//                     colors={["emerald", "red"]}
//                     valueFormatter={(value) => `₹${value.toLocaleString()}`}
//                     yAxisWidth={60}
//                     showLegend
//                     showAnimation
//                   />
//                 ) : (
//                   <div className="h-full flex items-center justify-center">
//                     <p className="text-muted-foreground">
//                       No monthly collection data available
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Properties Table */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Home className="h-5 w-5 mr-2" />
//                 Properties
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {properties && properties.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Property</TableHead>
//                         <TableHead>Current Rent</TableHead>
//                         <TableHead>Renter</TableHead>
//                         <TableHead>Total Pending</TableHead>
//                         <TableHead>Current Month</TableHead>
//                         <TableHead>Status</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {properties.map((property) => (
//                         <TableRow key={property.propertyId}>
//                           <TableCell className="font-medium">
//                             {property.address}
//                           </TableCell>
//                           <TableCell>
//                             {formatCurrency(property.currentRent)}
//                           </TableCell>
//                           <TableCell>
//                             {property.renter?.username || "—"}
//                           </TableCell>
//                           <TableCell className="text-red-500">
//                             {formatCurrency(property.totalPending)}
//                           </TableCell>
//                           <TableCell>
//                             {formatCurrency(
//                               property.currentMonthRent.finalAmount
//                             )}
//                           </TableCell>
//                           <TableCell>
//                             {property.currentMonthRent.isPaid === true ? (
//                               <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
//                                 <CheckCircle className="h-3 w-3 mr-1" /> Paid
//                               </Badge>
//                             ) : property.currentMonthRent.isPaid === false ? (
//                               <Badge
//                                 variant="outline"
//                                 className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
//                               >
//                                 <XCircle className="h-3 w-3 mr-1" /> Unpaid
//                               </Badge>
//                             ) : (
//                               <Badge
//                                 variant="outline"
//                                 className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
//                               >
//                                 N/A
//                               </Badge>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               ) : (
//                 <div className="py-8 text-center">
//                   <p className="text-muted-foreground">No properties found</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Global Adjustments */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <CalendarDays className="h-5 w-5 mr-2" />
//                 Current Global Adjustments
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {hierarchyData &&
//               hierarchyData.globalAdjustments &&
//               hierarchyData.globalAdjustments.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {hierarchyData.globalAdjustments.map((adjustment) => (
//                     <div
//                       key={adjustment.id}
//                       className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800"
//                     >
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium capitalize">
//                           {adjustment.type}
//                         </span>
//                         <span className="text-primary font-bold">
//                           {adjustment.percentage}%
//                         </span>
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         Effective from {formatDate(adjustment.effectiveFrom)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="py-4 text-center">
//                   <p className="text-muted-foreground">
//                     No global adjustments found
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//         <Footer />
//       </div>
//     </DashboardLayout>
//   );
// }
"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/ui/footer";
import {
  IndianRupee,
  CalendarDays,
  PieChart,
  ArrowUpRight,
  Building,
  Home,
  CheckCircle,
  XCircle,
  BarChart,
  RefreshCw,
  User,
  ChevronRight,
  ChevronDown,
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
import { Progress } from "@/components/ui/progress";
import { BarChart as Chart } from "@/components/ui/bar-chart";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define interfaces
interface AdjustmentDetail {
  type: string;
  percentage: number;
  amount: number;
  description: string;
}

interface AdjustmentBreakdown {
  adjustments: AdjustmentDetail[];
  totalAdjustmentPercentage: number;
  totalAdjustmentAmount: number;
}

interface CurrentMonthRent {
  baseRent: number;
  finalAmount: number;
  adjustments: AdjustmentBreakdown;
  isPaid: boolean | null;
  noRenter?: boolean;
  calculation: string;
}

interface RentDetail {
  month: string;
  baseRent: number;
  finalAmount: number;
  adjustmentBreakdown: AdjustmentBreakdown;
  isPaid: boolean | null;
  noRenter?: boolean;
}

interface Renter {
  id: string;
  username: string;
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
  subordinateId: string;
  username: string;
  employeeName?: string;
  password?: string;
  email?: string;
  phone?: string;
  properties: Property[];
  subordinates: Subordinate[];
}

interface GlobalAdjustment {
  id: string;
  type: string;
  percentage: number;
  effectiveFrom: string;
}

interface UserData {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface HierarchyResponse {
  globalAdjustments: GlobalAdjustment[];
  hierarchy: Subordinate[];
  user?: UserData;
  properties?: Property[];
}

export default function SubordinateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hierarchyData, setHierarchyData] = useState<HierarchyResponse | null>(
    null
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] =
    useState<Subordinate | null>(null);
  const { toast } = useToast();

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?._id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await fetch(
        "http://localhost:3001/api/users/hierarchy/per-month",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: HierarchyResponse = await response.json();
      console.log("API Response:", data);

      setHierarchyData(data);

      // Set user data
      if (data.user) {
        setUserData(data.user);
      }

      // Set properties
      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties);
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${data.properties.length} properties`,
        });
      } else {
        toast({
          title: "No properties found",
          description: "You don't have any properties assigned to you",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openTeamDetails = (subordinate: Subordinate) => {
    setSelectedSubordinate(subordinate);
    setIsTeamModalOpen(true);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!properties || properties.length === 0) return null;

    const totalProperties = properties.length;
    let totalRent = 0;
    let totalPending = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    properties.forEach((property) => {
      totalRent += property.currentMonthRent.finalAmount;
      totalPending += property.totalPending;

      // Handle isPaid being null
      if (property.currentMonthRent.isPaid === true) {
        paidCount++;
      } else if (property.currentMonthRent.isPaid === false) {
        unpaidCount++;
      }
    });

    // Only count properties with actual payment status (not null)
    const propertiesWithPaymentStatus = paidCount + unpaidCount;

    const collectionRate =
      propertiesWithPaymentStatus > 0
        ? Math.round((paidCount / propertiesWithPaymentStatus) * 100)
        : 0;

    // Monthly collection data for chart
    const monthlyData = [];
    const currentDate = new Date();
    const months = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i);
      months.push(month);
    }

    // Create chart data
    months.forEach((month) => {
      const monthStr = month.toLocaleDateString("default", {
        month: "short",
        year: "numeric",
      });
      let collected = 0;
      let pending = 0;

      // For each property, check the rent for this month
      properties.forEach((property) => {
        // Find the rent detail for this month
        const rentDetail = property.rentDetails.find((detail) => {
          const detailMonth = new Date(detail.month);
          return (
            detailMonth.getMonth() === month.getMonth() &&
            detailMonth.getFullYear() === month.getFullYear()
          );
        });

        if (rentDetail) {
          if (rentDetail.isPaid === true) {
            collected += rentDetail.finalAmount;
          } else if (rentDetail.isPaid === false) {
            pending += rentDetail.finalAmount;
          }
        }
      });

      monthlyData.push({
        name: monthStr,
        collected,
        pending,
      });
    });

    return {
      totalProperties,
      totalRent,
      totalPending,
      paidCount,
      unpaidCount,
      collectionRate,
      monthlyData,
    };
  }, [properties]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading && !refreshing) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div className="space-y-6 flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Subdivision Dashboard
              </h1>
              {/* <p className="text-muted-foreground">
                Welcome, {userData?.username || "User"}
              </p> */}
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={fetchData}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button> */}
          </div>
          {userData && (
            <Card>
              <CardHeader>
                <CardTitle>Subdivision Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {userData.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {userData.fullName || userData.username}
                      </h3>
                      <p className="text-muted-foreground">
                        Subdivison Manager
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-25 text-muted-foreground">
                        Username:
                      </span>
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-muted-foreground">Phone:</span>
                      <span>{userData.phone}</span>
                    </div>
                    {/* <div className="flex">
                      <span className="w-20 text-muted-foreground">
                        User ID:
                      </span>
                      <span className="text-xs">{userData.userId}</span>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" />
                Tax and other expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hierarchyData &&
              hierarchyData.globalAdjustments &&
              hierarchyData.globalAdjustments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hierarchyData.globalAdjustments.map((adjustment) => (
                    <div
                      key={adjustment.id}
                      className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">
                          {adjustment.type}
                        </span>
                        <span className="text-primary font-bold">
                          {adjustment.percentage}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Effective from {formatDate(adjustment.effectiveFrom)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    No global adjustments found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Properties
                    </p>
                    <h2 className="text-2xl font-bold">
                      {metrics?.totalProperties || 0}
                    </h2>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Month Rent
                    </p>
                    <h2 className="text-2xl font-bold">
                      {formatCurrency(metrics?.totalRent || 0)}
                    </h2>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Pending
                    </p>
                    <h2 className="text-2xl font-bold text-red-500">
                      {formatCurrency(metrics?.totalPending || 0)}
                    </h2>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Collection Rate
                    </p>
                    <h2 className="text-2xl font-bold">
                      {metrics?.collectionRate || 0}%
                    </h2>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <Progress
                  className="mt-3"
                  value={metrics?.collectionRate || 0}
                />
              </CardContent>
            </Card>
          </div>

          {refreshing && (
            <div className="w-full bg-muted/30 py-2 px-4 rounded-md mb-4 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm">Refreshing data...</span>
            </div>
          )}

          {/* Monthly Collection Chart */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Monthly Rent Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {metrics?.monthlyData && metrics.monthlyData.length > 0 ? (
                  <Chart
                    data={metrics.monthlyData}
                    index="name"
                    categories={["collected", "pending"]}
                    colors={["emerald", "red"]}
                    valueFormatter={(value) => `₹${value.toLocaleString()}`}
                    yAxisWidth={60}
                    showLegend
                    showAnimation
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No monthly collection data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}

          {/* Properties Table */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {properties && properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Current Rent</TableHead>
                        <TableHead>Renter</TableHead>
                        <TableHead>Total Pending</TableHead>
                        <TableHead>Current Month</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.propertyId}>
                          <TableCell className="font-medium">
                            {property.address}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(property.currentRent)}
                          </TableCell>
                          <TableCell>
                            {property.renter?.username || "—"}
                          </TableCell>
                          <TableCell className="text-red-500">
                            {formatCurrency(property.totalPending)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(
                              property.currentMonthRent.finalAmount
                            )}
                          </TableCell>
                          <TableCell>
                            {property.currentMonthRent.isPaid === true ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Paid
                              </Badge>
                            ) : property.currentMonthRent.isPaid === false ? (
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                              >
                                <XCircle className="h-3 w-3 mr-1" /> Unpaid
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                              >
                                N/A
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No properties found</p>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Global Adjustments */}

          {/* Subordinate Hierarchy */}
          {/* <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  My Team
                </CardTitle>
                {hierarchyData?.hierarchy &&
                  hierarchyData.hierarchy.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTeamModalOpen(true)}
                    >
                      View Full Team
                    </Button>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              {hierarchyData?.hierarchy &&
              hierarchyData.hierarchy.length > 0 ? (
                <div>
                  <SubordinateTree
                    subordinates={hierarchyData.hierarchy}
                    level={0}
                  />
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No subordinates found in your hierarchy
                  </p>
                </div>
              )}
            </CardContent>
          </Card> */}
        </div>

        {/* Team Details Modal */}
        <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Team Structure
              </DialogTitle>
              <DialogDescription>
                View your complete team hierarchy
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Team Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hierarchyData?.hierarchy &&
                    hierarchyData.hierarchy.map((subordinate) => (
                      <TableRow key={subordinate.subordinateId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                            </div>
                            <span>
                              {subordinate.username ||
                                subordinate.employeeName ||
                                "Unnamed"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {subordinate.email && (
                              <div>{subordinate.email}</div>
                            )}
                            {subordinate.phone && (
                              <div>{subordinate.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {subordinate.properties?.length || 0}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subordinate.subordinates?.length || 0} members
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  {(!hierarchyData?.hierarchy ||
                    hierarchyData.hierarchy.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No team members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Complete Hierarchy</h3>
                <div className="border p-4 rounded-md">
                  <SubordinateTree
                    subordinates={hierarchyData?.hierarchy || []}
                    level={0}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTeamModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </DashboardLayout>
  );
}

interface SubordinateTreeProps {
  subordinates: Subordinate[];
  level: number;
}

function SubordinateTree({ subordinates, level }: SubordinateTreeProps) {
  return (
    <div className="space-y-3">
      {subordinates.map((subordinate) => {
        const hasSubordinates =
          subordinate.subordinates && subordinate.subordinates.length > 0;
        const totalProperties = subordinate.properties?.length || 0;
        const totalTeamSize = countTotalTeamMembers(subordinate);

        return (
          <div
            key={subordinate.subordinateId}
            style={{ marginLeft: level * 16 }} // Using style instead of className for dynamic margins
          >
            <Collapsible className="border rounded-md">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full 
                    ${hasSubordinates ? "bg-primary/20" : "bg-muted"} 
                    flex items-center justify-center`}
                  >
                    <User
                      className={`h-5 w-5 ${
                        hasSubordinates
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {subordinate.username ||
                        subordinate.employeeName ||
                        "Unnamed"}
                      {totalTeamSize > 0 && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-blue-50 text-blue-800 border-blue-200"
                        >
                          {totalTeamSize} team{" "}
                          {totalTeamSize === 1 ? "member" : "members"}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {totalProperties}{" "}
                        {totalProperties === 1 ? "property" : "properties"}
                      </span>
                      {subordinate.email && (
                        <span className="hidden sm:inline-flex items-center">
                          {subordinate.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {hasSubordinates && (
                  <CollapsibleTrigger className="rounded-full hover:bg-muted p-1">
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </CollapsibleTrigger>
                )}
              </div>

              {hasSubordinates && (
                <CollapsibleContent className="border-t bg-muted/20 pt-2">
                  <div className="px-4 pb-1 text-sm font-medium text-muted-foreground">
                    Direct reports ({subordinate.subordinates.length}):
                  </div>
                  <div className="pb-2 px-2">
                    <SubordinateTree
                      subordinates={subordinate.subordinates}
                      level={level + 1}
                    />
                  </div>
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to count total team members (recursively)
function countTotalTeamMembers(subordinate: Subordinate): number {
  if (!subordinate.subordinates || subordinate.subordinates.length === 0) {
    return 0;
  }

  let total = subordinate.subordinates.length;
  for (const sub of subordinate.subordinates) {
    total += countTotalTeamMembers(sub);
  }

  return total;
}
