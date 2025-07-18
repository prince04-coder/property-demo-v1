// "use client";

// import { useState, useEffect } from "react";
// import DashboardLayout from "@/components/dashboard-layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   User,
//   Building,
//   Search,
//   CheckCircle,
//   XCircle,
//   Calendar,
//   Clock,
//   ChevronUp,
//   ChevronDown,
//   Home,
// } from "lucide-react";
// import Link from "next/link";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // Interface definitions
// interface Subordinate {
//   id: string;
//   name: string;
// }

// interface RenterProperty {
//   propertyId: string;
//   address: string;
//   currentRent: number;
//   isActive: boolean;
//   assignedFrom: string;
//   totalDue: number;
//   subordinate?: Subordinate;
// }

// interface Renter {
//   renterId: string;
//   username: string;
//   email: string;
//   password: string;
//   phone: string;
//   properties: RenterProperty[];
//   defaulter?: boolean;
// }

// interface PropertyTimelineItem {
//   month: string;
//   property: {
//     id: string;
//     address: string;
//   };
//   rent: number;
//   renter: string | null;
//   status: string;
//   paymentId: string | null;
// }

// interface RenterPayment {
//   property: {
//     address: string;
//     id: string;
//   };
//   month: string;
//   amount: number;
//   status: string;
//   paymentId: string | null;
// }

// export default function SubordinateTenantsPage() {
//   const [renters, setRenters] = useState<Renter[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortColumn, setSortColumn] = useState<string | null>(null);
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
//   const [propertyTimeline, setPropertyTimeline] = useState<
//     PropertyTimelineItem[]
//   >([]);
//   const [renterPayments, setRenterPayments] = useState<RenterPayment[]>([]);
//   const [loadingTimeline, setLoadingTimeline] = useState(false);
//   const [loadingPayments, setLoadingPayments] = useState(false);
//   const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<{
//     id: string;
//     address: string;
//   } | null>(null);

//   const { toast } = useToast();

//   useEffect(() => {
//     fetchRenters();
//   }, []);

//   const fetchRenters = async () => {
//     try {
//       if (typeof window === "undefined") return;

//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("Authentication token not found");
//       }

//       // Get current subordinate ID
//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       const subordinateId = user?._id;
//       if (!subordinateId) {
//         throw new Error("Subordinate ID not found");
//       }

//       setLoading(true);
//       const response = await fetch("https://property-demo-v1-backend.onrender.com/api/users/renters", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch renters data");
//       }

//       const data = await response.json();

//       // Filter renters to only include those with properties managed by this subordinate
//       const filteredRenters = data.renters.filter((renter: Renter) =>
//         renter.properties.some((prop) => prop.subordinate?.id === subordinateId)
//       );

//       // For each renter, filter their properties to only show properties managed by this subordinate
//       const processedRenters = filteredRenters.map((renter: Renter) => ({
//         ...renter,
//         properties: renter.properties.filter(
//           (prop) => prop.subordinate?.id === subordinateId
//         ),
//       }));

//       setRenters(processedRenters || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to fetch renters data",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPropertyTimeline = async (
//     propertyId: string,
//     propertyAddress: string
//   ) => {
//     setLoadingTimeline(true);
//     try {
//       if (typeof window === "undefined") return;

//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("Authentication token not found");
//       }

//       const response = await fetch(
//         `https://property-demo-v1-backend.onrender.com/api/properties/history/${propertyId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch property history");
//       }

//       const data = await response.json();
//       setPropertyTimeline(data.timeline || []);
//       setSelectedPropertyDetails({ id: propertyId, address: propertyAddress });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to fetch property history",
//         variant: "destructive",
//       });
//       setPropertyTimeline([]);
//     } finally {
//       setLoadingTimeline(false);
//     }
//   };

//   const fetchRenterPayments = async (renterId: string) => {
//     setLoadingPayments(true);
//     try {
//       if (typeof window === "undefined") return;

//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("Authentication token not found");
//       }

//       const response = await fetch(
//         `https://property-demo-v1-backend.onrender.com/api/users/renter/homepage/${renterId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch renter payments");
//       }

//       const data = await response.json();
//       setRenterPayments(data.payments || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to fetch renter payments",
//         variant: "destructive",
//       });
//       setRenterPayments([]);
//     } finally {
//       setLoadingPayments(false);
//     }
//   };

//   const handleSort = (column: string) => {
//     if (sortColumn === column) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(column);
//       setSortDirection("asc");
//     }
//   };

//   // Helper functions
//   const getTotalDue = (renter: Renter) => {
//     return renter.properties.reduce((total, prop) => total + prop.totalDue, 0);
//   };

//   const getPropertyCount = (renter: Renter) => {
//     // Count unique properties (by propertyId)
//     const uniquePropertyIds = new Set();
//     renter.properties.forEach((prop) => {
//       if (prop.isActive) {
//         uniquePropertyIds.add(prop.propertyId);
//       }
//     });
//     return uniquePropertyIds.size;
//   };

//   const getSortedRenters = () => {
//     // Apply search filter
//     let filtered = renters.filter((renter) => {
//       const matchesSearch =
//         (renter.username?.toLowerCase() || "").includes(
//           searchTerm.toLowerCase()
//         ) ||
//         (renter.email?.toLowerCase() || "").includes(
//           searchTerm.toLowerCase()
//         ) ||
//         (renter.phone || "").includes(searchTerm);

//       return matchesSearch;
//     });

//     // Apply sorting
//     if (sortColumn) {
//       filtered = [...filtered].sort((a, b) => {
//         let valueA: any;
//         let valueB: any;

//         switch (sortColumn) {
//           case "username":
//             valueA = a.username;
//             valueB = b.username;
//             break;
//           case "email":
//             valueA = a.email;
//             valueB = b.email;
//             break;
//           case "phone":
//             valueA = a.phone;
//             valueB = b.phone;
//             break;
//           case "properties":
//             valueA = getPropertyCount(a);
//             valueB = getPropertyCount(b);
//             break;
//           case "totalDue":
//             valueA = getTotalDue(a);
//             valueB = getTotalDue(b);
//             break;
//           default:
//             return 0;
//         }

//         // Compare values based on sort direction
//         if (valueA < valueB) {
//           return sortDirection === "asc" ? -1 : 1;
//         }
//         if (valueA > valueB) {
//           return sortDirection === "asc" ? 1 : -1;
//         }
//         return 0;
//       });
//     }

//     return filtered;
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     }).format(date);
//   };

//   const formatMonth = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "long",
//     }).format(date);
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "success":
//       case "paid":
//       case "true":
//         return (
//           <div className="flex items-center text-green-600">
//             <CheckCircle className="h-4 w-4 mr-1" />
//             <span>Paid</span>
//           </div>
//         );
//       case "pending":
//         return (
//           <div className="flex items-center text-yellow-600">
//             <Clock className="h-4 w-4 mr-1" />
//             <span>Pending</span>
//           </div>
//         );
//       case "not paid":
//       case "false":
//       default:
//         return (
//           <div className="flex items-center text-red-600">
//             <XCircle className="h-4 w-4 mr-1" />
//             <span>Not Paid</span>
//           </div>
//         );
//     }
//   };

//   const openUserDetails = (renter: Renter) => {
//     setSelectedRenter(renter);
//     setIsDetailsOpen(true);
//     // Reset timeline data when opening a new user
//     setPropertyTimeline([]);
//     setSelectedPropertyDetails(null);
//     // Fetch payments for this renter
//     fetchRenterPayments(renter.renterId);
//   };

//   const handlePropertySelect = (
//     propertyId: string,
//     propertyAddress: string
//   ) => {
//     fetchPropertyTimeline(propertyId, propertyAddress);
//   };

//   // Group payments by property for better display
//   const getPaymentsByProperty = () => {
//     const groupedPayments = new Map();

//     renterPayments.forEach((payment) => {
//       const key = payment.property.id;
//       if (!groupedPayments.has(key)) {
//         groupedPayments.set(key, {
//           propertyId: payment.property.id,
//           address: payment.property.address,
//           payments: [],
//         });
//       }
//       groupedPayments.get(key).payments.push(payment);
//     });

//     return Array.from(groupedPayments.values());
//   };

//   const filteredRenters = getSortedRenters();

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="space-y-6">
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-bold tracking-tight">My Tenants</h1>
//           </div>
//           <div className="grid gap-6">
//             <Skeleton className="h-12" />
//             <Skeleton className="h-96" />
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold tracking-tight">My Tenants</h1>
//         </div>

//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-xl">Tenant List</CardTitle>
//               <div className="flex items-center space-x-2">
//                 <div className="relative">
//                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     type="search"
//                     placeholder="Search tenants..."
//                     className="w-[250px] pl-8"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {filteredRenters.length > 0 ? (
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead
//                         className="cursor-pointer"
//                         onClick={() => handleSort("username")}
//                       >
//                         <div className="flex items-center">
//                           Name
//                           {sortColumn === "username" &&
//                             (sortDirection === "asc" ? (
//                               <ChevronUp className="ml-1 h-4 w-4" />
//                             ) : (
//                               <ChevronDown className="ml-1 h-4 w-4" />
//                             ))}
//                         </div>
//                       </TableHead>
//                       <TableHead
//                         className="cursor-pointer"
//                         onClick={() => handleSort("email")}
//                       >
//                         <div className="flex items-center">
//                           Username
//                           {sortColumn === "email" &&
//                             (sortDirection === "asc" ? (
//                               <ChevronUp className="ml-1 h-4 w-4" />
//                             ) : (
//                               <ChevronDown className="ml-1 h-4 w-4" />
//                             ))}
//                         </div>
//                       </TableHead>
//                       <TableHead
//                         className="cursor-pointer"
//                         onClick={() => handleSort("phone")}
//                       >
//                         <div className="flex items-center">
//                           Contact No.
//                           {sortColumn === "phone" &&
//                             (sortDirection === "asc" ? (
//                               <ChevronUp className="ml-1 h-4 w-4" />
//                             ) : (
//                               <ChevronDown className="ml-1 h-4 w-4" />
//                             ))}
//                         </div>
//                       </TableHead>
//                       <TableHead
//                         className="cursor-pointer"
//                         onClick={() => handleSort("properties")}
//                       >
//                         <div className="flex items-center">
//                           Properties
//                           {sortColumn === "properties" &&
//                             (sortDirection === "asc" ? (
//                               <ChevronUp className="ml-1 h-4 w-4" />
//                             ) : (
//                               <ChevronDown className="ml-1 h-4 w-4" />
//                             ))}
//                         </div>
//                       </TableHead>
//                       <TableHead
//                         className="cursor-pointer"
//                         onClick={() => handleSort("totalDue")}
//                       >
//                         <div className="flex items-center">
//                           Total Due
//                           {sortColumn === "totalDue" &&
//                             (sortDirection === "asc" ? (
//                               <ChevronUp className="ml-1 h-4 w-4" />
//                             ) : (
//                               <ChevronDown className="ml-1 h-4 w-4" />
//                             ))}
//                         </div>
//                       </TableHead>
//                       <TableHead>Defaulter Status</TableHead>
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {filteredRenters.map((renter) => (
//                       <TableRow
//                         key={renter.renterId}
//                         className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
//                           renter.defaulter ? "bg-red-50 dark:bg-red-900/10" : ""
//                         }`}
//                         onClick={() => openUserDetails(renter)}
//                       >
//                         <TableCell className="font-medium">
//                           <div className="flex items-center">
//                             <User className="h-4 w-4 mr-2 text-muted-foreground" />
//                             {renter.username}
//                           </div>
//                         </TableCell>
//                         <TableCell>{renter.email}</TableCell>
//                         <TableCell>{renter.phone}</TableCell>
//                         <TableCell>
//                           <Badge variant="outline" className="font-normal">
//                             {getPropertyCount(renter)}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <span className="text-red-500">
//                             ₹{getTotalDue(renter)}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <div className="relative">
//                             <div
//                               className={`h-6 px-2 rounded-full flex items-center justify-center text-xs ${
//                                 renter.defaulter
//                                   ? "bg-red-100 text-red-700"
//                                   : "bg-green-100 text-green-700"
//                               }`}
//                             >
//                               <div
//                                 className={`${
//                                   renter.defaulter
//                                     ? "text-red-700"
//                                     : "text-green-700"
//                                 }`}
//                               >
//                                 {renter.defaulter ? "Yes" : "No"}
//                               </div>
//                             </div>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : (
//               <div className="py-8 text-center">
//                 <p className="text-muted-foreground">
//                   {searchTerm
//                     ? "No tenants match your search criteria"
//                     : "No tenants found"}
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Tenant Details Dialog */}
//         <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
//           <DialogContent className="max-w-4xl h-[80vh] flex flex-col overflow-hidden">
//             <DialogHeader>
//               <DialogTitle className="text-xl">Tenant Details</DialogTitle>
//               <DialogDescription>
//                 View tenant information and payment history
//               </DialogDescription>
//             </DialogHeader>

//             {selectedRenter && (
//               <Tabs defaultValue="details" className="flex-1 overflow-hidden">
//                 <TabsList className="mb-4">
//                   <TabsTrigger value="details">Personal Details</TabsTrigger>
//                   <TabsTrigger value="properties">Properties</TabsTrigger>
//                   <TabsTrigger value="payments">Payment History</TabsTrigger>
//                   {selectedPropertyDetails && (
//                     <TabsTrigger value="timeline">
//                       Property Timeline
//                     </TabsTrigger>
//                   )}
//                 </TabsList>

//                 <div className="flex-1 overflow-auto px-1">
//                   <TabsContent value="details">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground">
//                           Name
//                         </h3>
//                         <p className="text-lg">{selectedRenter.username}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground">
//                           Username
//                         </h3>
//                         <p className="text-lg">{selectedRenter.email}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground">
//                           Contact No.
//                         </h3>
//                         <p className="text-lg">{selectedRenter.phone}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground">
//                           Password
//                         </h3>
//                         <p className="text-lg">{selectedRenter.password}</p>
//                       </div>
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground">
//                           Total Properties
//                         </h3>
//                         <p className="text-lg">
//                           {getPropertyCount(selectedRenter)}
//                         </p>
//                       </div>
//                       <div>
//                         <h3 className="text-sm font-medium text-muted-foreground">
//                           Total Due Amount
//                         </h3>
//                         <p className="text-lg text-red-500">
//                           ₹{getTotalDue(selectedRenter)}
//                         </p>
//                       </div>
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="properties" className="mt-4">
//                     <div className="space-y-4">
//                       {selectedRenter.properties.length > 0 ? (
//                         <div className="rounded-md border">
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Property</TableHead>
//                                 <TableHead>Current Rent</TableHead>
//                                 <TableHead>Assigned From</TableHead>
//                                 <TableHead>Due Amount</TableHead>
//                                 <TableHead>Property Payment History</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {/* Group by propertyId and show only the latest assignment */}
//                               {Array.from(
//                                 selectedRenter.properties.reduce(
//                                   (map, property) => {
//                                     const existing = map.get(
//                                       property.propertyId
//                                     );
//                                     if (
//                                       !existing ||
//                                       new Date(property.assignedFrom) >
//                                         new Date(existing.assignedFrom)
//                                     ) {
//                                       map.set(property.propertyId, property);
//                                     }
//                                     return map;
//                                   },
//                                   new Map()
//                                 )
//                               ).map(([_, property]) => (
//                                 <TableRow key={property.propertyId}>
//                                   <TableCell>
//                                     <Link
//                                       href={`/property/${property.propertyId}`}
//                                       className="text-blue-500 hover:underline flex items-center"
//                                     >
//                                       <Home className="h-3.5 w-3.5 mr-1.5" />
//                                       {property.address}
//                                     </Link>
//                                   </TableCell>
//                                   <TableCell>₹{property.currentRent}</TableCell>
//                                   <TableCell>
//                                     {formatDate(property.assignedFrom)}
//                                   </TableCell>
//                                   <TableCell className="text-red-500">
//                                     ₹{property.totalDue}
//                                   </TableCell>
//                                   <TableCell>
//                                     <div className="flex items-center">
//                                       <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={(e) => {
//                                           e.stopPropagation(); // Prevent opening the user details modal
//                                           handlePropertySelect(
//                                             property.propertyId,
//                                             property.address
//                                           );
//                                         }}
//                                       >
//                                         <Calendar className="h-4 w-4 mr-2" />
//                                         View History
//                                       </Button>
//                                     </div>
//                                   </TableCell>
//                                 </TableRow>
//                               ))}
//                             </TableBody>
//                           </Table>
//                         </div>
//                       ) : (
//                         <div className="text-center py-8">
//                           <p className="text-muted-foreground">
//                             No properties assigned to this tenant
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="payments" className="mt-4">
//                     {loadingPayments ? (
//                       <div className="space-y-4">
//                         <Skeleton className="h-12 w-full" />
//                         <Skeleton className="h-12 w-full" />
//                         <Skeleton className="h-12 w-full" />
//                       </div>
//                     ) : getPaymentsByProperty().length > 0 ? (
//                       <div className="space-y-8">
//                         {getPaymentsByProperty().map((group) => (
//                           <div key={group.propertyId}>
//                             <h3 className="font-medium text-lg flex items-center mb-3">
//                               <Building className="h-4 w-4 mr-2" />
//                               {group.address}
//                             </h3>
//                             <div className="rounded-md border">
//                               <Table>
//                                 <TableHeader>
//                                   <TableRow>
//                                     <TableHead>Month</TableHead>
//                                     <TableHead>Amount</TableHead>
//                                     <TableHead>Status</TableHead>
//                                     <TableHead>Payment ID</TableHead>
//                                   </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                   {group.payments
//                                     .sort(
//                                       (a, b) =>
//                                         new Date(b.month).getTime() -
//                                         new Date(a.month).getTime()
//                                     )
//                                     .map((payment, idx) => (
//                                       <TableRow key={idx}>
//                                         <TableCell>
//                                           {formatMonth(payment.month)}
//                                         </TableCell>
//                                         <TableCell>₹{payment.amount}</TableCell>
//                                         <TableCell>
//                                           {getStatusBadge(payment.status)}
//                                         </TableCell>
//                                         <TableCell>
//                                           <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
//                                             {payment.paymentId || "—"}
//                                           </code>
//                                         </TableCell>
//                                       </TableRow>
//                                     ))}
//                                 </TableBody>
//                               </Table>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8">
//                         <p className="text-muted-foreground">
//                           No payment history found
//                         </p>
//                       </div>
//                     )}
//                   </TabsContent>

//                   {selectedPropertyDetails && (
//                     <TabsContent value="timeline" className="mt-4">
//                       <div className="mb-4">
//                         <h3 className="font-medium text-lg flex items-center">
//                           <Building className="h-4 w-4 mr-2" />
//                           {selectedPropertyDetails.address} Timeline
//                         </h3>
//                       </div>

//                       {loadingTimeline ? (
//                         <div className="space-y-4">
//                           <Skeleton className="h-12 w-full" />
//                           <Skeleton className="h-12 w-full" />
//                           <Skeleton className="h-12 w-full" />
//                         </div>
//                       ) : propertyTimeline.length > 0 ? (
//                         <div className="rounded-md border">
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Month</TableHead>
//                                 <TableHead>Rent</TableHead>
//                                 <TableHead>Renter</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead>Payment ID</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {propertyTimeline
//                                 .sort(
//                                   (a, b) =>
//                                     new Date(b.month).getTime() -
//                                     new Date(a.month).getTime()
//                                 )
//                                 .map((item, idx) => (
//                                   <TableRow key={idx}>
//                                     <TableCell>
//                                       {formatMonth(item.month)}
//                                     </TableCell>
//                                     <TableCell>₹{item.rent}</TableCell>
//                                     <TableCell>{item.renter || "—"}</TableCell>
//                                     <TableCell>
//                                       {getStatusBadge(item.status)}
//                                     </TableCell>
//                                     <TableCell>
//                                       <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
//                                         {item.paymentId || "—"}
//                                       </code>
//                                     </TableCell>
//                                   </TableRow>
//                                 ))}
//                             </TableBody>
//                           </Table>
//                         </div>
//                       ) : (
//                         <div className="text-center py-8">
//                           <p className="text-muted-foreground">
//                             No timeline data available for this property
//                           </p>
//                         </div>
//                       )}
//                     </TabsContent>
//                   )}
//                 </div>
//               </Tabs>
//             )}

//             <DialogFooter>
//               <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/ui/footer";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface definitions
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
  subordinate?: Subordinate;
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

// Type for filters
type FilterKey = "username" | "email" | "phone" | "defaulter" | "totalDue";

interface FilterValue {
  value: string;
  checked: boolean;
}

export default function SubordinateTenantsPage() {
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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

  // Filter states
  const [filterOptions, setFilterOptions] = useState({
    hasDues: false,
    defaulter: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchRenters();
  }, []);

  const fetchRenters = async () => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Get current subordinate ID
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const subordinateId = user?._id;
      if (!subordinateId) {
        throw new Error("Subordinate ID not found");
      }

      setLoading(true);
      const response = await fetch(
        "https://property-demo-v1-backend.onrender.com/api/users/renters",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch renters data");
      }

      const data = await response.json();

      // Filter renters to only include those with properties managed by this subordinate
      const filteredRenters = data.renters.filter((renter: Renter) =>
        renter.properties.some((prop) => prop.subordinate?.id === subordinateId)
      );

      // For each renter, filter their properties to only show properties managed by this subordinate
      const processedRenters = filteredRenters.map((renter: Renter) => ({
        ...renter,
        properties: renter.properties.filter(
          (prop) => prop.subordinate?.id === subordinateId
        ),
      }));

      setRenters(processedRenters || []);
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
        `https://property-demo-v1-backend.onrender.com/api/properties/history/${propertyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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

  //   const fetchRenterPayments = async (renterId: string) => {
  //     setLoadingPayments(true);
  //     try {
  //       if (typeof window === "undefined") return;

  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         throw new Error("Authentication token not found");
  //       }

  //       const response = await fetch(
  //         `https://property-demo-v1-backend.onrender.com/api/users/renter/homepage/${renterId}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch renter payments");
  //       }

  //       const data = await response.json();
  //       setRenterPayments(data.payments || []);
  //     } catch (error) {
  //       toast({
  //         title: "Error",
  //         description:
  //           error instanceof Error
  //             ? error.message
  //             : "Failed to fetch renter payments",
  //         variant: "destructive",
  //       });
  //       setRenterPayments([]);
  //     } finally {
  //       setLoadingPayments(false);
  //     }
  //   };
  // Add this in the fetchRenterPayments function
  const fetchRenterPayments = async (renterId: string) => {
    setLoadingPayments(true);
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `https://property-demo-v1-backend.onrender.com/api/users/renter/homepage/${renterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch renter payments");
      }

      const data = await response.json();
      console.log("API Response - Renter Payments:", data);
      console.log("Payments array:", data.payments);

      setRenterPayments(data.payments || []);

      // Log after setting state
      console.log("State after update - renterPayments:", data.payments);
    } catch (error) {
      console.error("Error fetching renter payments:", error);
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

  // // Add this in the getPaymentsByProperty function
  // const getPaymentsByProperty = () => {
  //   console.log("Current renterPayments in getPaymentsByProperty:", renterPayments);

  //   const groupedPayments = new Map();

  //   renterPayments.forEach((payment) => {
  //     console.log("Processing payment:", payment);
  //     const key = payment.property.id;
  //     if (!groupedPayments.has(key)) {
  //       groupedPayments.set(key, {
  //         propertyId: payment.property.id,
  //         address: payment.property.address,
  //         payments: [],
  //       });
  //     }
  //     groupedPayments.get(key).payments.push(payment);
  //   });

  //   const result = Array.from(groupedPayments.values());
  //   console.log("Grouped payments result:", result);
  //   return result;
  // };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

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
      "Properties",
      "Total Due",
    ];

    // Create rows
    const rows = filteredData.map((renter) => [
      renter.username,
      renter.email,
      renter.phone,
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
    link.setAttribute("download", "my_tenants_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filteredData.length} tenants exported to CSV`,
    });
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

  const getSortedAndFilteredRenters = () => {
    // Apply search filter
    let filtered = renters.filter((renter) => {
      const matchesSearch =
        (renter.username?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (renter.email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (renter.phone || "").includes(searchTerm);

      // Due amount filter
      let matchesDueFilter = true;
      if (filterOptions.hasDues) {
        matchesDueFilter = getTotalDue(renter) > 0;
      }

      // Defaulter status filter
      let matchesDefaulterFilter = true;
      if (filterOptions.defaulter) {
        matchesDefaulterFilter = !!renter.defaulter;
      }

      return matchesSearch && matchesDueFilter && matchesDefaulterFilter;
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
        if (valueA < valueB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "Invalid Date";
    }
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
      case "true":
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
      case "false":
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

    return Array.from(groupedPayments.values());
  };

  const filteredRenters = getSortedAndFilteredRenters();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Renter Management
          </h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex items-center"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" /> Export File
            </Button>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Renters</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search renters..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuCheckboxItem
                        checked={filterOptions.hasDues}
                        onCheckedChange={(checked) =>
                          setFilterOptions({
                            ...filterOptions,
                            hasDues: checked,
                          })
                        }
                      >
                        Has Dues
                      </DropdownMenuCheckboxItem>
                      {/* <DropdownMenuCheckboxItem
                        checked={filterOptions.defaulter}
                        onCheckedChange={(checked) =>
                          setFilterOptions({
                            ...filterOptions,
                            defaulter: checked,
                          })
                        }
                      >
                        Defaulters
                      </DropdownMenuCheckboxItem> */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setFilterOptions({
                            hasDues: false,
                            defaulter: false,
                          })
                        }
                        className="justify-center text-center"
                      >
                        Reset Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRenters.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-[100px] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="flex items-center">S.No.</div>
                      </TableHead>
                      <TableHead
                        className="w-[200px] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort("username");
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort("email");
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort("phone");
                        }}
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
                      <TableHead
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort("properties");
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort("totalDue");
                        }}
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
                      {/* <TableHead>Defaulter Status</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRenters.map((renter) => (
                      <TableRow
                        key={renter.renterId}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                          renter.defaulter ? "bg-red-50 dark:bg-red-900/10" : ""
                        }`}
                        onClick={() => openUserDetails(renter)}
                      >
                        <TableCell className="font-medium">
                          {renters.indexOf(renter) + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {renter.username}
                          </div>
                        </TableCell>
                        <TableCell>{renter.email}</TableCell>
                        <TableCell>{renter.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {getPropertyCount(renter)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              getTotalDue(renter) > 0
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            ₹{getTotalDue(renter)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-medium text-lg">No tenants found</h3>
                  <p className="mt-1">
                    {searchTerm ||
                    filterOptions.defaulter ||
                    filterOptions.hasDues
                      ? "Try adjusting your search or filter settings"
                      : "You don't have any tenants assigned to you yet"}
                  </p>
                </div>
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
                  <TabsTrigger
                    value="payments"
                    onClick={() => {
                      console.log("Property Timeline:", propertyTimeline);
                    }}
                  >
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
                        <p
                          className={`text-lg ${
                            getTotalDue(selectedRenter) > 0
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          ₹{getTotalDue(selectedRenter)}
                        </p>
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
                                <TableHead>Payment History</TableHead>
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
                                  <TableCell>₹{property.address}</TableCell>
                                  <TableCell>₹{property.currentRent}</TableCell>
                                  <TableCell>
                                    {formatDate(property.assignedFrom)}
                                  </TableCell>
                                  <TableCell
                                    className={
                                      property.totalDue > 0
                                        ? "text-red-500 font-medium"
                                        : ""
                                    }
                                  >
                                    ₹{property.totalDue}
                                  </TableCell>
                                  <TableCell>
                                    <Link
                                      href={`/property/${property.propertyId}`}
                                      className="text-blue-600 hover:underline flex items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePropertySelect(
                                            property.propertyId,
                                            property.address
                                          );
                                        }}
                                      >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View History
                                      </Button>
                                    </Link>
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
                      ) : getPaymentsByProperty().length > 0 ? (
                        <>
                          {/* Payment Summary */}
                          <div className="grid grid-cols-4 gap-4">
                            {(() => {
                              const counts = {
                                paid: 0,
                                pending: 0,
                                notPaid: 0,
                                total: 0,
                              };

                              renterPayments.forEach((payment) => {
                                counts.total++;
                                if (
                                  payment.status === "success" ||
                                  payment.status === "paid"
                                ) {
                                  counts.paid++;
                                } else if (payment.status === "pending") {
                                  counts.pending++;
                                } else {
                                  counts.notPaid++;
                                }
                              });

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
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Month</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Payment date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {propertyGroup.payments
                                      .sort(
                                        (a: RenterPayment, b: RenterPayment) =>
                                          new Date(b.month).getTime() -
                                          new Date(a.month).getTime()
                                      )
                                      .map(
                                        (
                                          payment: RenterPayment,
                                          index: number
                                        ) => {
                                          console.log(
                                            "Rendering payment:",
                                            payment
                                          );
                                          console.log(
                                            "Payment amount:",
                                            payment.finalAmount
                                          );
                                          return (
                                            <TableRow key={index}>
                                              <TableCell>
                                                {formatMonth(payment.month)}
                                              </TableCell>
                                              <TableCell>
                                                ₹{payment.finalAmount || "N/A"}
                                              </TableCell>
                                              <TableCell>
                                                {getStatusBadge(payment.status)}
                                              </TableCell>
                                              <TableCell>
                                                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                                  {formatDate(
                                                    payment.paymentDate
                                                  ) || "—"}
                                                </code>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        }
                                      )}
                                  </TableBody>
                                </Table>
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
                      {selectedPropertyDetails &&
                        propertyTimeline.length > 0 && (
                          <div className="mt-8">
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-medium flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                {selectedPropertyDetails.address} Timeline
                              </h3>
                            </div>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Rent Amount</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment ID</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {propertyTimeline
                                    .sort(
                                      (a, b) =>
                                        new Date(b.month).getTime() -
                                        new Date(a.month).getTime()
                                    )
                                    .map((record, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {formatMonth(record.month)}
                                        </TableCell>
                                        <TableCell>
                                          ₹{record.rentAmount || record.rent}
                                        </TableCell>
                                        <TableCell>
                                          {record.renter || "—"}
                                        </TableCell>
                                        <TableCell>
                                          {getStatusBadge(record.status)}
                                        </TableCell>
                                        <TableCell>
                                          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                            {record.paymentId || "—"}
                                          </code>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
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
