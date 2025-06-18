// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import DashboardLayout from "@/components/dashboard-layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   ArrowLeft,
//   Calendar,
//   DollarSign,
//   User,
//   Check,
//   X,
//   Clock,
// } from "lucide-react";
// import Link from "next/link";

// interface TimelineItem {
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

// export default function PropertyDetailPage() {
//   const params = useParams();
//   const propertyId = params.id as string;
//   const [timeline, setTimeline] = useState<TimelineItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [propertyName, setPropertyName] = useState<string>("");
//   const { toast } = useToast();

//   useEffect(() => {
//     const fetchPropertyHistory = async () => {
//       try {
//         if (typeof window === "undefined") return;

//         const token = localStorage.getItem("token");
//         if (!token) {
//           throw new Error("Authentication token not found");
//         }

//         setLoading(true);
//         const response = await fetch(
//           `https://renter-app-f0fc.onrender.com/api/properties/history/${propertyId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch property history");
//         }

//         const data = await response.json();
//         setTimeline(data.timeline || []);

//         // Set property name if available
//         if (data.timeline && data.timeline.length > 0) {
//           setPropertyName(data.timeline[0].property.address);
//         }
//       } catch (error) {
//         toast({
//           title: "Error",
//           description:
//             error instanceof Error
//               ? error.message
//               : "Failed to fetch property history",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPropertyHistory();
//   }, [propertyId, toast]);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "long",
//     }).format(date);
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "success":
//         return (
//           <Badge className="bg-green-500">
//             <Check className="h-3 w-3 mr-1" /> Paid
//           </Badge>
//         );
//       case "pending":
//         return (
//           <Badge className="bg-yellow-500">
//             <Clock className="h-3 w-3 mr-1" /> Pending
//           </Badge>
//         );
//       case "not paid":
//       default:
//         return (
//           <Badge className="bg-red-500">
//             <X className="h-3 w-3 mr-1" /> Not Paid
//           </Badge>
//         );
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <Link
//               href="/hierarchy"
//               className="text-sm flex items-center hover:underline mb-2"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" /> Back to Properties
//             </Link>
//             <h1 className="text-2xl font-bold tracking-tight">
//               {loading ? <Skeleton className="h-8 w-60" /> : propertyName}
//             </h1>
//             <p className="text-muted-foreground">
//               Property payment history and timeline
//             </p>
//           </div>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Payment Timeline</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="space-y-4">
//                 <Skeleton className="h-16 w-full" />
//                 <Skeleton className="h-16 w-full" />
//                 <Skeleton className="h-16 w-full" />
//               </div>
//             ) : timeline.length > 0 ? (
//               <div className="space-y-6">
//                 {timeline.map((item, index) => (
//                   <div
//                     key={index}
//                     className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-md ${
//                       item.status === "success"
//                         ? "bg-green-50 dark:bg-green-950/20"
//                         : item.status === "pending"
//                         ? "bg-yellow-50 dark:bg-yellow-950/20"
//                         : "bg-gray-50 dark:bg-gray-800/50"
//                     } border`}
//                   >
//                     <div className="flex items-start space-x-4">
//                       <div
//                         className={`p-2 rounded-full ${
//                           item.status === "success"
//                             ? "bg-green-100 text-green-700"
//                             : item.status === "pending"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         <Calendar className="h-5 w-5" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium">
//                           {formatDate(item.month)}
//                         </h3>
//                         <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
//                           <div className="flex items-center">
//                             <DollarSign className="h-3 w-3 mr-1" />
//                             Rent: ₹{item.rent}
//                           </div>
//                           <div className="hidden md:block">•</div>
//                           <div className="flex items-center">
//                             <User className="h-3 w-3 mr-1" />
//                             Renter: {item.renter || "None"}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="mt-2 md:mt-0">
//                       <div className="flex items-center justify-end space-x-2">
//                         {getStatusBadge(item.status)}
//                         {item.paymentId && (
//                           <span className="text-xs text-muted-foreground">
//                             ID: {item.paymentId.substring(0, 8)}...
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground">
//                   No payment history available
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdjustmentDetail {
  type: string;
  percentage: number;
  amount: number;
  description: string;
}

interface AdjustmentBreakdown {
  details: AdjustmentDetail[];
  totalAdjustmentPercentage: number;
  totalAdjustmentAmount: number;
}

interface PropertyInfo {
  id: string;
  address: string;
}

interface RentHistory {
  month: string;
  property: PropertyInfo;
  baseRent: number;
  finalRent: number;
  renter: string | null;
  status: string;
  paymentId: string | null;
  adjustmentBreakdown: AdjustmentBreakdown;
  calculation: string;
}

interface PropertyHistoryResponse {
  timeline: RentHistory[];
}

export default function PropertyDetailPage() {
  const params = useParams();
  // Fix: Use 'id' instead of 'propertyId' to match your route parameter
  const propertyId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [propertyHistory, setPropertyHistory] = useState<RentHistory[]>([]);
  const [propertyName, setPropertyName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPropertyHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        console.log("Fetching property history for ID:", propertyId);

        const response = await fetch(
          `https://renter-app-f0fc.onrender.com/api/properties/history/${propertyId}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(
            `Failed to fetch property history: ${response.status}`
          );
        }

        const data: PropertyHistoryResponse = await response.json();
        console.log("Received property data:", data);

        setPropertyHistory(data.timeline);

        // Set the property name from the first item
        if (data.timeline && data.timeline.length > 0) {
          setPropertyName(data.timeline[0].property.address);
        }
      } catch (error) {
        console.error("Error fetching property history:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyHistory();
    } else {
      console.error("No property ID found in params");
      setLoading(false);
    }
  }, [propertyId, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Paid
          </Badge>
        );
      case "not paid":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Not Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/hierarchy">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              {loading
                ? "Loading property..."
                : propertyName || "Property Details"}
            </h1>
          </div>
        </div>

        {/* Debug info during development */}
        {process.env.NODE_ENV !== "production" && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
            <p>Property ID: {propertyId || "Not found"}</p>
            <p>Loading state: {loading ? "Loading" : "Done"}</p>
            <p>History items: {propertyHistory?.length || 0}</p>
          </div>
        )}

        {/* Summary Card */}
        {!loading && propertyHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹
                    {propertyHistory
                      .filter(
                        (record) => record.status.toLowerCase() === "not paid"
                      )
                      .reduce((total, record) => total + record.finalRent, 0)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹
                    {propertyHistory
                      .filter(
                        (record) => record.status.toLowerCase() === "success"
                      )
                      .reduce((total, record) => total + record.finalRent, 0)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-muted-foreground">Current Month</p>
                  <p className="text-2xl font-bold">
                    ₹
                    {propertyHistory.length > 0
                      ? propertyHistory[propertyHistory.length - 1].finalRent
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Rent History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : propertyHistory.length > 0 ? (
              <div className="space-y-4">
                {propertyHistory.map((record, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="p-4 bg-white dark:bg-gray-800 border-b">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(record.month)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div>{getStatusBadge(record.status)}</div>
                          <div className="font-semibold">
                            ₹{record.finalRent}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Base Rent
                          </p>
                          <p className="font-medium">₹{record.baseRent}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Renter
                          </p>
                          <p className="font-medium">{record.renter || "—"}</p>
                        </div>

                        {record.adjustmentBreakdown?.totalAdjustmentAmount >
                          0 && (
                          <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center">
                              <p className="text-sm text-muted-foreground mb-1 mr-2">
                                Adjustments
                              </p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-blue-500" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{record.calculation}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="mt-1 space-y-1">
                              {record.adjustmentBreakdown.details.map(
                                (adj, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="capitalize">
                                      {adj.type}
                                    </span>
                                    <div>
                                      <span className="mr-2">
                                        {adj.percentage}%
                                      </span>
                                      <span className="text-muted-foreground">
                                        ₹{adj.amount}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                              <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                                <span>Total Adjustments</span>
                                <span>
                                  ₹
                                  {
                                    record.adjustmentBreakdown
                                      .totalAdjustmentAmount
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {record.paymentId && (
                          <div className="col-span-1 md:col-span-2">
                            <p className="text-sm text-muted-foreground mb-1">
                              Payment ID
                            </p>
                            <p className="font-mono text-sm">
                              {record.paymentId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No rent history available for this property
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
