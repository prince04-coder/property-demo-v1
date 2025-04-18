// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"
// import { useToast } from "@/components/ui/use-toast"
// import DashboardLayout from "@/components/dashboard-layout"
// import { Building, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
// import { PieChart as PieChartComponent, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"

// interface DashboardMetrics {
//   summary: {
//     totalProperties: number
//     totalRentDue: number
//     totalRentCollected: number
//     pendingRentAmount: number
//   }
//   paymentStatus: {
//     paid: number
//     pending: number
//     failed: number
//     notPaid: number
//   }
//   propertiesByManager: {
//     managerName: string
//     totalRentDue: number
//     totalRentCollected: number
//   }[]
// }

// export default function DashboardPage() {
//   const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
//   const [loading, setLoading] = useState(true)
//   const { toast } = useToast()

//   useEffect(() => {
//     const fetchDashboardMetrics = async () => {
//       try {
//         const token = localStorage.getItem("token")
//         if (!token) {
//           throw new Error("Authentication token not found")
//         }

//         const response = await fetch("http://localhost:3001/api/properties/dashboard/metrics", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         })

//         if (!response.ok) {
//           throw new Error("Failed to fetch dashboard metrics")
//         }

//         const data = await response.json()
//         setMetrics(data)
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: error instanceof Error ? error.message : "Failed to fetch dashboard data",
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardMetrics()
//   }, [toast])

//   // Prepare data for pie chart
//   const preparePaymentStatusData = () => {
//     if (!metrics) return []

//     return [
//       { name: "Paid", value: metrics.paymentStatus.paid },
//       { name: "Pending", value: metrics.paymentStatus.pending },
//       { name: "Failed", value: metrics.paymentStatus.failed },
//       { name: "Not Paid", value: metrics.paymentStatus.notPaid },
//     ]
//   }

//   const COLORS = ["#4ade80", "#facc15", "#f87171", "#94a3b8"]

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
//           <p className="text-muted-foreground">Overview of properties, rent collection, and management metrics</p>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {/* Total Properties */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
//               <Building className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">{metrics?.summary.totalProperties || 0}</div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Total Rent Due */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Rent Due</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">₹{metrics?.summary.totalRentDue.toLocaleString() || 0}</div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Total Rent Collected */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Rent Collected</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">₹{metrics?.summary.totalRentCollected.toLocaleString() || 0}</div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Pending Rent Amount */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pending Rent</CardTitle>
//               <AlertCircle className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">₹{metrics?.summary.pendingRentAmount.toLocaleString() || 0}</div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts */}
//         <div className="grid gap-4 md:grid-cols-2">
//           {/* Payment Status Pie Chart */}
//           <Card className="col-span-1">
//             <CardHeader>
//               <CardTitle className="text-lg">Payment Status</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80">
//               {loading ? (
//                 <div className="flex h-full items-center justify-center">
//                   <Skeleton className="h-64 w-64 rounded-full" />
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChartComponent>
//                     <Pie
//                       data={preparePaymentStatusData()}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {preparePaymentStatusData().map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <RechartsTooltip />
//                   </PieChartComponent>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>

//           {/* Properties by Manager Bar Chart */}
//           <Card className="col-span-1">
//             <CardHeader>
//               <CardTitle className="text-lg">Properties by Manager</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80">
//               {loading ? (
//                 <div className="space-y-2">
//                   <Skeleton className="h-64 w-full" />
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={metrics?.propertiesByManager || []}
//                     margin={{
//                       top: 5,
//                       right: 30,
//                       left: 20,
//                       bottom: 5,
//                     }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="managerName" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="totalRentDue" name="Rent Due" fill="#8884d8" />
//                     <Bar dataKey="totalRentCollected" name="Rent Collected" fill="#82ca9d" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// // }

// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"
// import { useToast } from "@/components/ui/use-toast"
// import DashboardLayout from "@/components/dashboard-layout"
// import { Building, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
// import { PieChart as PieChartComponent, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"

// interface DashboardMetrics {
//   summary: {
//     totalProperties: number
//     totalRentDue: number
//     totalRentCollected: number
//     pendingRentAmount: number
//   }
//   paymentStatus: {
//     paid: number
//     pending: number
//     failed: number
//     notPaid: number
//   }
//   propertiesByManager: {
//     managerName: string
//     totalRentDue: number
//     totalRentCollected: number
//   }[]
// }

// interface Property {
//   paymentStatus: string
//   paymentAmount: number
//   currentRent: number
//   currentManager: {
//     username: string
//   }
// }

// interface Subordinate {
//   username: string
//   properties: Property[]
// }

// interface ApiResponse {
//   subordinates: Subordinate[]
//   properties: Property[]
// }

// export default function DashboardPage() {
//   const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
//   const [loading, setLoading] = useState(true)
//   const { toast } = useToast()

//   useEffect(() => {
//     const fetchDashboardMetrics = async () => {
//       try {
//         const token = localStorage.getItem("token")
//         if (!token) {
//           throw new Error("Authentication token not found")
//         }

//         const response = await fetch("https://renter-app-f0fc.onrender.com/api/users/hierarchy", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         })

//         if (!response.ok) {
//           throw new Error(`Failed to fetch dashboard metrics: ${response.status} ${response.statusText}`)
//         }

//         const data: ApiResponse = await response.json()
//         const processedMetrics = processApiData(data)
//         setMetrics(processedMetrics)
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: error instanceof Error ? error.message : "Failed to fetch dashboard data",
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardMetrics()
//   }, [toast])

//   const processApiData = (data: ApiResponse): DashboardMetrics => {
//     const allProperties = data.subordinates.flatMap(sub => sub.properties)

//     const paymentStatus = {
//       paid: 0,
//       pending: 0,
//       failed: 0,
//       notPaid: 0
//     }

//     let totalRentDue = 0
//     let totalRentCollected = 0
//     let pendingRentAmount = 0

//     allProperties.forEach(prop => {
//       totalRentDue += prop.currentRent

//       switch (prop.paymentStatus.toLowerCase()) {
//         case "paid":
//           paymentStatus.paid++
//           totalRentCollected += prop.paymentAmount
//           break
//         case "pending":
//           paymentStatus.pending++
//           pendingRentAmount += prop.paymentAmount
//           break
//         case "failed":
//           paymentStatus.failed++
//           pendingRentAmount += prop.paymentAmount
//           break
//         case "not paid":
//           paymentStatus.notPaid++
//           pendingRentAmount += prop.paymentAmount
//           break
//       }
//     })

//     const managerMap = new Map<string, { totalRentDue: number; totalRentCollected: number }>()

//     allProperties.forEach(prop => {
//       const managerName = prop.currentManager.username
//       const current = managerMap.get(managerName) || { totalRentDue: 0, totalRentCollected: 0 }

//       current.totalRentDue += prop.currentRent
//       if (prop.paymentStatus.toLowerCase() === "paid") {
//         current.totalRentCollected += prop.paymentAmount
//       }
//       managerMap.set(managerName, current)
//     })

//     const propertiesByManager = Array.from(managerMap.entries()).map(([managerName, data]) => ({
//       managerName,
//       totalRentDue: data.totalRentDue,
//       totalRentCollected: data.totalRentCollected
//     }))

//     return {
//       summary: {
//         totalProperties: allProperties.length,
//         totalRentDue,
//         totalRentCollected,
//         pendingRentAmount
//       },
//       paymentStatus,
//       propertiesByManager
//     }
//   }

//   const preparePaymentStatusData = () => {
//     if (!metrics) return []

//     return [
//       { name: "Paid", value: metrics.paymentStatus.paid },
//       { name: "Pending", value: metrics.paymentStatus.pending },
//       { name: "Failed", value: metrics.paymentStatus.failed },
//       { name: "Not Paid", value: metrics.paymentStatus.notPaid },
//     ]
//   }

//   const COLORS = ["#4ade80", "#facc15", "#f87171", "#94a3b8"]

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
//           <p className="text-muted-foreground">Overview of properties, rent collection, and management metrics</p>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
//               <Building className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">{metrics?.summary.totalProperties || 0}</div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Rent Due</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">₹{metrics?.summary.totalRentDue.toLocaleString() || 0}</div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Rent Collected</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">₹{metrics?.summary.totalRentCollected.toLocaleString() || 0}</div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pending Rent</CardTitle>
//               <AlertCircle className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-8 w-24" />
//               ) : (
//                 <div className="text-2xl font-bold">₹{metrics?.summary.pendingRentAmount.toLocaleString() || 0}</div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card className="col-span-1">
//             <CardHeader>
//               <CardTitle className="text-lg">Payment Status</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80">
//               {loading ? (
//                 <div className="flex h-full items-center justify-center">
//                   <Skeleton className="h-64 w-64 rounded-full" />
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChartComponent>
//                     <Pie
//                       data={preparePaymentStatusData()}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {preparePaymentStatusData().map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <RechartsTooltip />
//                   </PieChartComponent>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>

//           <Card className="col-span-1">
//             <CardHeader>
//               <CardTitle className="text-lg">Properties by Manager</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80">
//               {loading ? (
//                 <div className="space-y-2">
//                   <Skeleton className="h-64 w-full" />
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={metrics?.propertiesByManager || []}
//                     margin={{
//                       top: 5,
//                       right: 30,
//                       left: 20,
//                       bottom: 5,
//                     }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="managerName" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="totalRentDue" name="Rent Due" fill="#8884d8" />
//                     <Bar dataKey="totalRentCollected" name="Rent Collected" fill="#82ca9d" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// }

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Building, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import {
  PieChart as PieChartComponent,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";

interface DashboardMetrics {
  summary: {
    totalProperties: number;
    totalRentDue: number;
    totalRentCollected: number;
    pendingRentAmount: number;
    failedRentAmount: number;
    notPaidRentAmount: number;
    collectionRate: number;
    paymentStatus: {
      paid: number;
      pending: number;
      failed: number;
      notPaid: number;
    };
  };
  currentMonth: {
    month: number;
    year: number;
  };
  propertiesByManager: {
    managerName: string;
    totalRentDue: number;
    totalRentCollected: number;
    pendingAmount: number;
    failedAmount: number;
    notPaidAmount: number;
  }[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          "https://renter-app-f0fc.onrender.com/api/properties/dashboard/metrics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch dashboard metrics: ${response.status} ${response.statusText}`
          );
        }

        const data: DashboardMetrics = await response.json();
        setMetrics(data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [toast]);

  const preparePaymentStatusData = () => {
    if (!metrics) return [];

    return [
      { name: "Paid", value: metrics.summary.paymentStatus.paid },
      { name: "Pending", value: metrics.summary.paymentStatus.pending },
      { name: "Failed", value: metrics.summary.paymentStatus.failed },
      { name: "Not Paid", value: metrics.summary.paymentStatus.notPaid },
    ];
  };

  const COLORS = ["#4ade80", "#facc15", "#f87171", "#94a3b8"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of properties, rent collection, and management metrics
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {metrics?.summary.totalProperties || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rent Due
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  ₹{metrics?.summary.totalRentDue.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rent Collected
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  ₹{metrics?.summary.totalRentCollected.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Rent
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  ₹{metrics?.summary.pendingRentAmount.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-64 w-64 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChartComponent>
                    <Pie
                      data={preparePaymentStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePaymentStatusData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChartComponent>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Properties by Manager</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics?.propertiesByManager || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="managerName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="totalRentDue"
                      name="Rent Due"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="totalRentCollected"
                      name="Rent Collected"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </DashboardLayout>
  );
}
