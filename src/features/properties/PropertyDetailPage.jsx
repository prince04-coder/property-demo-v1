import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchPropertyHistory } from "@/services/propertyService";

export default function PropertyDetailPage() {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [propertyHistory, setPropertyHistory] = useState([]);
  const [propertyName, setPropertyName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadPropertyHistory = async () => {
      try {
        setLoading(true);
        console.log("Fetching property history for ID:", propertyId);

        const data = await fetchPropertyHistory(propertyId);
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
      loadPropertyHistory();
    } else {
      console.error("No property ID found in params");
      setLoading(false);
    }
  }, [propertyId, toast]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getStatusBadge = (status) => {
    // Handle null status
    if (status === null) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">N/A</Badge>
      );
    }

    switch (status.toLowerCase()) {
      case "success":
      case "true":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Paid
          </Badge>
        );
      case "not paid":
      case "false":
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

  const formatPaymentDateTime = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "—";
    }
  };

  return (
    <>
      <Helmet>
        <title>{propertyName ? `${propertyName} - Property Details` : 'Property Details'}</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {loading
                ? "Loading property..."
                : propertyName || "Property Details"}
            </h1>
          </div>
        </div>

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
                        (record) =>
                          // Handle null status
                          record.status?.toLowerCase() === "not paid" ||
                          record.status?.toLowerCase() === "false"
                      )
                      .reduce((total, record) => total + record.finalRent, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹
                    {propertyHistory
                      .filter(
                        (record) =>
                          record.status?.toLowerCase() === "success" ||
                          record.status?.toLowerCase() === "true"
                      )
                      .reduce((total, record) => total + record.finalRent, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-muted-foreground">Current Month</p>
                  <p className="text-2xl font-bold">
                    ₹
                    {propertyHistory.length > 0
                      ? propertyHistory[
                          propertyHistory.length - 1
                        ].finalRent.toLocaleString()
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
                            ₹{record.finalRent.toLocaleString()}
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
                          <p className="font-medium">
                            ₹{record.baseRent.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Renter
                          </p>
                          <p className="font-medium">
                            {record.hasRenter === false
                              ? "No Renter Assigned"
                              : record.renter || "—"}
                          </p>
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
                                        ₹{adj.amount.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                              <div className="flex justify-between text-sm font-medium border-t pt-1 mt-1">
                                <span>Total Adjustments</span>
                                <span>
                                  ₹
                                  {record.adjustmentBreakdown.totalAdjustmentAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {record.paymentId && (
                          <div className="col-span-1 md:col-span-2">
                            <p className="text-sm text-muted-foreground mb-1">
                              Payment Details
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-mono text-sm">
                                ID: {record.paymentId}
                              </p>
                              {record.paymentDate && (
                                <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                                  Paid on:{" "}
                                  {formatPaymentDateTime(record.paymentDate)}
                                </p>
                              )}
                            </div>
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
    </>
  );
}
