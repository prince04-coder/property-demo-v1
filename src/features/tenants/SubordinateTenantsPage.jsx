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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { fetchRenters, fetchRenterHomepage } from "@/services/userService";
import { fetchPropertyHistory } from "@/services/propertyService";

export default function SubordinateTenantsPage() {
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [propertyTimeline, setPropertyTimeline] = useState([]);
  const [renterPayments, setRenterPayments] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    hasDues: false,
    defaulter: false,
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadRenters();
  }, []);

  const loadRenters = async () => {
    try {
      const subordinateId = user?._id;
      if (!subordinateId) {
        throw new Error("Subordinate ID not found");
      }

      setLoading(true);
      const data = await fetchRenters();

      const filteredRenters = data.renters.filter((renter) =>
        renter.properties.some((prop) => prop.subordinate?.id === subordinateId)
      );

      const processedRenters = filteredRenters.map((renter) => ({
        ...renter,
        properties: renter.properties.filter(
          (prop) => prop.subordinate?.id === subordinateId
        ),
      }));

      setRenters(processedRenters || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch renters data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyTimeline = async (propertyId, propertyAddress) => {
    setLoadingTimeline(true);
    try {
      const data = await fetchPropertyHistory(propertyId);
      setPropertyTimeline(data.timeline || []);
      setSelectedPropertyDetails({ id: propertyId, address: propertyAddress });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch property history",
        variant: "destructive",
      });
      setPropertyTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const loadRenterPayments = async (renterId) => {
    setLoadingPayments(true);
    try {
      const data = await fetchRenterHomepage(renterId);
      setRenterPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching renter payments:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch renter payments",
        variant: "destructive",
      });
      setRenterPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSort = (column) => {
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

    const headers = [
      "Name",
      "Username",
      "Contact No.",
      "Properties",
      "Total Due",
    ];

    const rows = filteredData.map((renter) => [
      renter.username,
      renter.email,
      renter.phone,
      getPropertyCount(renter),
      getTotalDue(renter),
      renter.defaulter ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

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

  const getTotalDue = (renter) => {
    return renter.properties.reduce((total, prop) => total + prop.totalDue, 0);
  };

  const getPropertyCount = (renter) => {
    const uniquePropertyIds = new Set();
    renter.properties.forEach((prop) => {
      if (prop.isActive) {
        uniquePropertyIds.add(prop.propertyId);
      }
    });
    return uniquePropertyIds.size;
  };

  const getSortedAndFilteredRenters = () => {
    let filtered = renters.filter((renter) => {
      const matchesSearch =
        (renter.username?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (renter.email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (renter.phone || "").includes(searchTerm);

      let matchesDueFilter = true;
      if (filterOptions.hasDues) {
        matchesDueFilter = getTotalDue(renter) > 0;
      }

      let matchesDefaulterFilter = true;
      if (filterOptions.defaulter) {
        matchesDefaulterFilter = !!renter.defaulter;
      }

      return matchesSearch && matchesDueFilter && matchesDefaulterFilter;
    });

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let valueA;
        let valueB;

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

  const formatDate = (dateString) => {
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

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  const getStatusBadge = (status) => {
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

  const openUserDetails = (renter) => {
    setSelectedRenter(renter);
    setIsDetailsOpen(true);
    setPropertyTimeline([]);
    setSelectedPropertyDetails(null);
    loadRenterPayments(renter.renterId);
  };

  const handlePropertySelect = (propertyId, propertyAddress) => {
    loadPropertyTimeline(propertyId, propertyAddress);
  };

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
        <Helmet>
          <title>Renter Management</title>
        </Helmet>
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
      <Helmet>
        <title>Renter Management</title>
      </Helmet>
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
                          {filteredRenters.indexOf(renter) + 1}
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
                                  <TableCell>{property.address}</TableCell>
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
                                      to={`/property/${property.propertyId}`}
                                      className="text-blue-600 hover:underline flex items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
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
                                        (a, b) =>
                                          new Date(b.month).getTime() -
                                          new Date(a.month).getTime()
                                      )
                                      .map((payment, index) => (
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
                                              {formatDate(payment.paymentDate) || "—"}
                                            </code>
                                          </TableCell>
                                        </TableRow>
                                      ))}
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
