"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/ui/footer";
type Adjustment = {
  type: string;
  percentage: number;
  amount: number;
  description: string;
};

type AdjustmentBreakdown = {
  adjustments: Adjustment[];
  totalAdjustmentPercentage: number;
  totalAdjustmentAmount: number;
};

type RentDetail = {
  month: string;
  baseRent: number;
  finalAmount: number;
  adjustmentBreakdown: AdjustmentBreakdown;
  isPaid: boolean;
};

type Renter = {
  id: string;
  username: string;
};

type Property = {
  propertyId: string;
  address: string;
  currentRent: number;
  totalPending: number;
  renter?: Renter;
  currentMonthRent: {
    baseRent: number;
    finalAmount: number;
    adjustments: AdjustmentBreakdown;
    isPaid: boolean;
    calculation: string;
  };
  rentDetails: RentDetail[];
};

type Subordinate = {
  subordinateId: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  properties: Property[];
  subordinates: Subordinate[];
};

type DashboardData = {
  globalAdjustments: {
    id: string;
    type: string;
    percentage: number;
    effectiveFrom: string;
  }[];
  hierarchy: Subordinate[];
};

type SubordinateMetrics = {
  subordinateId: string;
  name: string;
  email: string;
  phone: string;
  propertyCount: number;
  totalRentDue: number;
  totalRentCollected: number;
  totalPending: number;
  paidCount: number;
  unpaidCount: number;
  collectionRate: number;
  hasSubordinates: boolean;
  level: number;
};

type Notification = {
  _id: string;
  content: string;
  user: string;
  createdAt: string;
};

// Helper function to calculate collection rate
const calculateCollectionRate = (collected: number, due: number): number => {
  if (due === 0) return 0;
  return Math.round((collected / due) * 100);
};

const GlobalAdjustmentForm: React.FC<{
  onAdjustmentAdded: () => void;
}> = ({ onAdjustmentAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: "tax",
    percentage: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "percentage" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "https://renter-app-f0fc.onrender.com/api/users/global-adjustments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            type: formData.type,
            percentage: formData.percentage,
            // The effectiveFrom date will be handled by the server (first day of next month)
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error: ${response.status} ${response.statusText}`
        );
      }

      toast({
        title: "Success",
        description: "Global adjustment has been created successfully",
        variant: "default",
      });

      // Reset form and close
      setFormData({ type: "tax", percentage: 0 });
      setIsAdding(false);

      // Tell parent component to refresh data
      onAdjustmentAdded();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create global adjustment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // return (
  //   <div className="mb-4">
  //     {!isAdding ? (
  //       <button
  //         onClick={() => setIsAdding(true)}
  //         className="flex items-center gap-2 text-blue-600 hover:underline text-sm dark:text-blue-400"
  //       >
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           width="16"
  //           height="16"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           stroke="currentColor"
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         >
  //           <circle cx="12" cy="12" r="10"></circle>
  //           <line x1="12" y1="8" x2="12" y2="16"></line>
  //           <line x1="8" y1="12" x2="16" y2="12"></line>
  //         </svg>
  //         Add New Global Adjustment
  //       </button>
  //     ) : (
  //       <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
  //         <h3 className="font-medium text-sm mb-3">
  //           Add New Global Adjustment
  //         </h3>
  //         <form onSubmit={handleSubmit}>
  //           <div className="grid gap-4 sm:grid-cols-2">
  //             <div className="space-y-2">
  //               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Type
  //               </label>
  //               <select
  //                 name="type"
  //                 value={formData.type}
  //                 onChange={handleChange}
  //                 className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
  //                 required
  //               >
  //                 <option value="tax">Tax</option>
  //                 <option value="expense">Expense</option>
  //               </select>
  //             </div>
  //             <div className="space-y-2">
  //               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Percentage (%)
  //               </label>
  //               <input
  //                 type="number"
  //                 name="percentage"
  //                 value={formData.percentage}
  //                 onChange={handleChange}
  //                 step="0.01"
  //                 min="0"
  //                 max="100"
  //                 className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
  //                 required
  //               />
  //             </div>
  //           </div>

  //           <div className="mt-4 flex justify-end gap-2">
  //             <button
  //               type="button"
  //               onClick={() => setIsAdding(false)}
  //               className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
  //               disabled={isSubmitting}
  //             >
  //               Cancel
  //             </button>
  //             <button
  //               type="submit"
  //               className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
  //               disabled={isSubmitting}
  //             >
  //               {isSubmitting ? (
  //                 <span className="flex items-center">
  //                   <svg
  //                     className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     fill="none"
  //                     viewBox="0 0 24 24"
  //                   >
  //                     <circle
  //                       className="opacity-25"
  //                       cx="12"
  //                       cy="12"
  //                       r="10"
  //                       stroke="currentColor"
  //                       strokeWidth="4"
  //                     ></circle>
  //                     <path
  //                       className="opacity-75"
  //                       fill="currentColor"
  //                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //                     ></path>
  //                   </svg>
  //                   Saving...
  //                 </span>
  //               ) : (
  //                 "Save Adjustment"
  //               )}
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     )}
  //   </div>
  // );
};

// New component for Global Adjustment Tabs
const GlobalAdjustmentTabs: React.FC<{
  globalAdjustments: any[];
  onAdjustmentUpdated: () => void;
  notifications: Notification[];
}> = ({ globalAdjustments, onAdjustmentUpdated, notifications }) => {
  // const [activeTab, setActiveTab] = useState("all");
  const activeTab = "all";
  const [editingAdjustment, setEditingAdjustment] = useState<{
    id: string;
    type: string;
    percentage: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdjustment) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `https://renter-app-f0fc.onrender.com/api/settings/${editingAdjustment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            percentage: editingAdjustment.percentage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error: ${response.status} ${response.statusText}`
        );
      }

      toast({
        title: "Success",
        description: "Adjustment has been updated successfully",
        variant: "default",
      });

      setEditingAdjustment(null);
      onAdjustmentUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update adjustment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter adjustments based on active tab
  const filteredAdjustments = globalAdjustments.filter((adj) => {
    if (activeTab === "all") return true;
    return adj.type === activeTab;
  });

  return (
    <div className="space-y-4">
      {/* Notification indicator */}
      {notifications.length > 0 && (
        <div
          className={`bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 dark:bg-amber-900/20 dark:border-amber-800 ${
            showNotifications ? "" : "cursor-pointer"
          }`}
          onClick={() => !showNotifications && setShowNotifications(true)}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-amber-800 flex items-center gap-2 dark:text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
              Notifications ({notifications.length})
            </h3>
            {showNotifications && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(false);
                }}
                className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {showNotifications && (
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="bg-white p-2 rounded border border-amber-100 text-sm dark:bg-gray-800 dark:border-amber-900/40"
                >
                  <p>{notification.content}</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      {/* <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("tax")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "tax"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Tax
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "expense"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Expense
        </button>
      </div> */}

      {/* Adjustments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdjustments.map((adj) => (
          <div
            key={adj.id}
            className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            {editingAdjustment && editingAdjustment.id === adj.id ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize dark:bg-blue-900/30 dark:text-blue-300">
                    {adj.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    from {new Date(adj.effectiveFrom).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block dark:text-gray-300">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={editingAdjustment.percentage}
                    onChange={(e) =>
                      setEditingAdjustment({
                        ...editingAdjustment,
                        percentage: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAdjustment(null)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <span className="inline-block mb-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize dark:bg-blue-900/30 dark:text-blue-300">
                    {adj.type}
                  </span>
                  <button
                    onClick={() =>
                      setEditingAdjustment({
                        id: adj.id,
                        type: adj.type,
                        percentage: adj.percentage,
                      })
                    }
                    className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      <path d="m15 5 4 4"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">{adj.percentage}%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    from {new Date(adj.effectiveFrom).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredAdjustments.length === 0 && (
          <div className="col-span-full bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
            <p>
              No {activeTab !== "all" ? activeTab : "global"} adjustments
              defined yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SubordinateCard: React.FC<{
  metrics: SubordinateMetrics;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ metrics, onClick, isExpanded }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 hover:shadow-md ${
        metrics.level > 0 ? `ml-${Math.min(metrics.level * 4, 12)}` : ""
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center">
          <div className="mr-3 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-lg dark:bg-blue-900/30 dark:text-blue-300">
            {metrics.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-lg">{metrics.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {metrics.email} • {metrics.phone}
            </div>
          </div>
        </div>

        {metrics.hasSubordinates && (
          <button
            className="text-blue-600 hover:bg-blue-50 rounded-full p-1.5 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={onClick}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isExpanded ? (
                <polyline points="18 15 12 9 6 15"></polyline>
              ) : (
                <polyline points="6 9 12 15 18 9"></polyline>
              )}
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-700/30">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Properties
          </div>
          <div className="font-semibold">{metrics.propertyCount}</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-700/30">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Due
          </div>
          <div className="font-semibold">
            ₹{metrics.totalRentDue.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-md dark:bg-green-900/10">
          <div className="text-xs text-green-600 dark:text-green-400">
            Collected
          </div>
          <div className="font-semibold text-green-600 dark:text-green-400">
            ₹{metrics.totalRentCollected.toLocaleString()}
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-md dark:bg-red-900/10">
          <div className="text-xs text-red-600 dark:text-red-400">Pending</div>
          <div className="font-semibold text-red-600 dark:text-red-400">
            ₹{metrics.totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Collection Rate</span>
          <span className="font-medium">{metrics.collectionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
          <div
            className={`h-2 rounded-full ${
              metrics.collectionRate < 50
                ? "bg-red-500"
                : metrics.collectionRate < 75
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${metrics.collectionRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{metrics.paidCount} paid</span>
          <span>{metrics.unpaidCount} unpaid</span>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubordinates, setExpandedSubordinates] = useState<Set<string>>(
    new Set()
  );
  const [allSubordinateMetrics, setAllSubordinateMetrics] = useState<
    SubordinateMetrics[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const toggleSubordinate = (id: string) => {
    setExpandedSubordinates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Add this function to refresh data when a new adjustment is added or updated
  const handleAdjustmentAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Fetch dashboard data
        const response = await fetch(
          "https://renter-app-f0fc.onrender.com/api/users/hierarchy/per-month",
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        setData(responseData);

        // Process all subordinates metrics
        const metrics = processSubordinateMetrics(responseData);
        setAllSubordinateMetrics(metrics);

        // Fetch notifications
        try {
          const notificationResponse = await fetch(
            "https://renter-app-f0fc.onrender.com/api/notifications",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (notificationResponse.ok) {
            const notificationsData = await notificationResponse.json();
            setNotifications(notificationsData);
          }
        } catch (notificationError) {
          console.error("Error fetching notifications:", notificationError);
          // We don't want to fail the whole page load if notifications fail
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  // Process subordinate metrics
  const processSubordinateMetrics = (
    data: DashboardData
  ): SubordinateMetrics[] => {
    const allMetrics: SubordinateMetrics[] = [];

    const processSubordinate = (subordinate: Subordinate, level = 0) => {
      // Calculate metrics for this subordinate
      let totalRentDue = 0;
      let totalRentCollected = 0;
      let paidCount = 0;
      let unpaidCount = 0;

      subordinate.properties.forEach((property) => {
        const currentRent = property.currentMonthRent;
        totalRentDue += currentRent.finalAmount;

        if (currentRent.isPaid) {
          totalRentCollected += currentRent.finalAmount;
          paidCount++;
        } else {
          unpaidCount++;
        }
      });

      const metrics: SubordinateMetrics = {
        subordinateId: subordinate.subordinateId,
        name: subordinate.username,
        email: subordinate.email,
        phone: subordinate.phone,
        propertyCount: subordinate.properties.length,
        totalRentDue,
        totalRentCollected,
        totalPending: totalRentDue - totalRentCollected,
        paidCount,
        unpaidCount,
        collectionRate: calculateCollectionRate(
          totalRentCollected,
          totalRentDue
        ),
        hasSubordinates: subordinate.subordinates.length > 0,
        level,
      };

      allMetrics.push(metrics);

      // Process nested subordinates
      subordinate.subordinates.forEach((sub) => {
        processSubordinate(sub, level + 1);
      });
    };

    // Start processing from top-level subordinates
    data.hierarchy.forEach((sub) => {
      processSubordinate(sub);
    });

    return allMetrics;
  };

  // Summary metrics calculation
  const getMetrics = () => {
    if (!data) return null;

    const metrics = {
      totalSubordinates: 0,
      totalProperties: 0,
      totalRentDue: 0,
      totalRentCollected: 0,
      totalPending: 0,
      paidCount: 0,
      unpaidCount: 0,
    };

    // Count all subordinates recursively
    const countSubordinates = (subs: Subordinate[]): number => {
      let count = subs.length;
      subs.forEach((sub) => {
        count += countSubordinates(sub.subordinates);
      });
      return count;
    };

    // Process all properties and their payment data
    const processProperties = (properties: Property[]) => {
      metrics.totalProperties += properties.length;

      properties.forEach((property) => {
        const currentRent = property.currentMonthRent;
        metrics.totalRentDue += currentRent.finalAmount;

        if (currentRent.isPaid) {
          metrics.totalRentCollected += currentRent.finalAmount;
          metrics.paidCount++;
        } else {
          metrics.totalPending += currentRent.finalAmount;
          metrics.unpaidCount++;
        }
      });
    };

    // Process subordinate hierarchy recursively
    const processHierarchy = (subordinates: Subordinate[]) => {
      subordinates.forEach((sub) => {
        // Process properties for this subordinate
        processProperties(sub.properties);

        // Recursively process nested subordinates
        if (sub.subordinates.length > 0) {
          processHierarchy(sub.subordinates);
        }
      });
    };

    metrics.totalSubordinates = countSubordinates(data.hierarchy);
    processHierarchy(data.hierarchy);

    return metrics;
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6 dark:bg-gray-700"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"
              ></div>
            ))}
          </div>
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6 dark:bg-gray-700"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <h3 className="text-lg font-medium mb-2">
              Error loading dashboard
            </h3>
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        {/* <p className="text-gray-500 dark:text-gray-400 mb-6">
          Overview of your subordinates' financial performance
        </p> */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tax and Other expenses</h2>
            <GlobalAdjustmentForm onAdjustmentAdded={handleAdjustmentAdded} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded-md animate-pulse dark:bg-gray-700"
                ></div>
              ))}
            </div>
          ) : data &&
            data.globalAdjustments &&
            data.globalAdjustments.length > 0 ? (
            <GlobalAdjustmentTabs
              globalAdjustments={data.globalAdjustments}
              onAdjustmentUpdated={handleAdjustmentAdded}
              notifications={notifications}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
              <p>No global adjustments defined yet.</p>
              <p className="text-sm mt-1">
                Create one using the "Add New Global Adjustment" button above.
              </p>
            </div>
          )}
        </div>
        {/* Summary metrics */}
        {metrics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Properties
              </div>
              <div className="text-2xl font-bold">
                {metrics.totalProperties}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Across {metrics.totalSubordinates} subordinates
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Due
              </div>
              <div className="text-2xl font-bold">
                ₹{metrics.totalRentDue.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Due this month
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
                  {metrics.paidCount + metrics.unpaidCount} payments
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Collected
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{metrics.totalRentCollected.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {calculateCollectionRate(
                    metrics.totalRentCollected,
                    metrics.totalRentDue
                  )}
                  % collected
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
                  {metrics.paidCount} payments
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Pending
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{metrics.totalPending.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {100 -
                    calculateCollectionRate(
                      metrics.totalRentCollected,
                      metrics.totalRentDue
                    )}
                  % pending
                </span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded dark:bg-red-900/30 dark:text-red-300">
                  {metrics.unpaidCount} payments
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global adjustments */}
        {/* <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tax and Other expenses</h2>
            <GlobalAdjustmentForm onAdjustmentAdded={handleAdjustmentAdded} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded-md animate-pulse dark:bg-gray-700"
                ></div>
              ))}
            </div>
          ) : data &&
            data.globalAdjustments &&
            data.globalAdjustments.length > 0 ? (
            <GlobalAdjustmentTabs
              globalAdjustments={data.globalAdjustments}
              onAdjustmentUpdated={handleAdjustmentAdded}
              notifications={notifications}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
              <p>No global adjustments defined yet.</p>
              <p className="text-sm mt-1">
                Create one using the "Add New Global Adjustment" button above.
              </p>
            </div>
          )}
        </div> */}

        {/* Subordinate Financial Summary */}
        <div className="mb-8">
          {/* <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Subordinate Financial Summary
            </h2>
            <button
              className="text-blue-600 text-sm hover:underline dark:text-blue-400"
              onClick={() => {
                if (
                  expandedSubordinates.size === allSubordinateMetrics.length
                ) {
                  setExpandedSubordinates(new Set());
                } else {
                  setExpandedSubordinates(
                    new Set(allSubordinateMetrics.map((m) => m.subordinateId))
                  );
                }
              }}
            >
              {expandedSubordinates.size === allSubordinateMetrics.length
                ? "Collapse All"
                : "Expand All"}
            </button>
          </div> */}

          {allSubordinateMetrics.length > 0 ? (
            <div className="space-y-4">
              {allSubordinateMetrics.map((subMetrics) => (
                <SubordinateCard
                  key={subMetrics.subordinateId}
                  metrics={subMetrics}
                  onClick={() => toggleSubordinate(subMetrics.subordinateId)}
                  isExpanded={expandedSubordinates.has(
                    subMetrics.subordinateId
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
              No subordinates found in your hierarchy.
            </div>
          )}
        </div>

        {/* View Detailed Report Link */}
        {/* <div className="flex justify-center mt-8">
          <a
            href="/subordinates"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            View Full Subordinates Report
          </a>
        </div> */}
      </div>
      <Footer />
    </DashboardLayout>
  );
}
