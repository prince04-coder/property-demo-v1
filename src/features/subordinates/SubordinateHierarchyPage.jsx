import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/ui/footer";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  CalendarDays,
  User,
  Info,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { fetchHierarchy } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

export default function SubordinateHierarchyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("address");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [globalAdjustments, setGlobalAdjustments] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    withPendingDues: false,
    withRenter: false,
    withoutRenter: false,
    rentPaid: false,
    rentUnpaid: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchPropertiesData();
    }
  }, [isMounted]);

  const fetchPropertiesData = async () => {
    try {
      setRefreshing(true);
      if (!user) {
        navigate("/login");
        return;
      }

      const data = await fetchHierarchy();

      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties);
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${data.properties.length} properties`,
        });
      } else {
        setProperties([]);
        toast({
          title: "No properties found",
          description: "You don't have any properties assigned",
        });
      }

      if (data.user) {
        setUserData(data.user);
      }

      if (data.hierarchy) {
        setHierarchyData(data.hierarchy);

        const initialExpandedState = {};
        data.hierarchy.forEach((sub) => {
          initialExpandedState[sub.subordinateId] = true;
        });
        setExpandedNodes(initialExpandedState);
      } else {
        setHierarchyData([]);
      }

      if (data.globalAdjustments) {
        setGlobalAdjustments(data.globalAdjustments);
      } else {
        setGlobalAdjustments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  const metrics = useMemo(() => {
    if (!properties.length) return null;

    const totalRent = properties.reduce(
      (sum, prop) => sum + prop.currentMonthRent.finalAmount,
      0
    );
    const totalPending = properties.reduce(
      (sum, prop) => sum + prop.totalPending,
      0
    );
    const paidCount = properties.filter(
      (p) => p.currentMonthRent.isPaid === true
    ).length;
    const unpaidCount = properties.filter(
      (p) => p.currentMonthRent.isPaid === false
    ).length;

    const propertiesWithStatus = paidCount + unpaidCount;
    const collectionRate =
      propertiesWithStatus > 0
        ? Math.round((paidCount / propertiesWithStatus) * 100)
        : 0;

    return {
      totalProperties: properties.length,
      totalRent,
      totalPending,
      paidCount,
      unpaidCount,
      collectionRate,
    };
  }, [properties]);

  const exportToCSV = () => {
    if (!properties || properties.length === 0) {
      toast({
        title: "No data to export",
        description: "No property data available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Property Address",
      "Base Rent",
      "Current Month Rent",
      "Total Pending",
      "Renter",
      "Status",
      "Adjustments",
    ];

    const rows = [];

    properties.forEach((property) => {
      rows.push([
        property.address,
        property.currentRent.toString(),
        property.currentMonthRent.finalAmount.toString(),
        property.totalPending.toString(),
        property.renter?.username || "—",
        property.currentMonthRent.isPaid === true
          ? "Paid"
          : property.currentMonthRent.isPaid === false
          ? "Unpaid"
          : "N/A",
        property.currentMonthRent.adjustments.totalAdjustmentPercentage.toString() +
          "%",
      ]);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `properties_${new Date().toISOString().split("T")[0]}.csv`
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
  };

  const getSortedAndFilteredProperties = () => {
    let filtered = properties.filter((property) => {
      const matchesSearch = property.address
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesFilters = true;

      if (filterOptions.withPendingDues) {
        matchesFilters = matchesFilters && property.totalPending > 0;
      }

      if (filterOptions.withRenter) {
        matchesFilters = matchesFilters && !!property.renter;
      }

      if (filterOptions.withoutRenter) {
        matchesFilters = matchesFilters && !property.renter;
      }

      if (filterOptions.rentPaid) {
        matchesFilters =
          matchesFilters && property.currentMonthRent.isPaid === true;
      }

      if (filterOptions.rentUnpaid) {
        matchesFilters =
          matchesFilters && property.currentMonthRent.isPaid === false;
      }

      return matchesSearch && matchesFilters;
    });

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let valueA;
        let valueB;

        switch (sortColumn) {
          case "address":
            valueA = a.address.toLowerCase();
            valueB = b.address.toLowerCase();
            break;
          case "currentRent":
            valueA = a.currentRent;
            valueB = b.currentRent;
            break;
          case "renter":
            valueA = a.renter?.username?.toLowerCase() || "";
            valueB = b.renter?.username?.toLowerCase() || "";
            break;
          case "totalPending":
            valueA = a.totalPending;
            valueB = b.totalPending;
            break;
          case "currentMonthRent":
            valueA = a.currentMonthRent.finalAmount;
            valueB = b.currentMonthRent.finalAmount;
            break;
          case "status":
            valueA =
              a.currentMonthRent.isPaid === true
                ? 2
                : a.currentMonthRent.isPaid === false
                ? 1
                : 0;
            valueB =
              b.currentMonthRent.isPaid === true
                ? 2
                : b.currentMonthRent.isPaid === false
                ? 1
                : 0;
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

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const calculateSubordinateStats = (subordinate) => {
    let totalProperties = 0;
    let totalDue = 0;
    let totalTeamSize = 0;
    let totalRent = 0;

    const processSubordinate = (sub) => {
      totalProperties += sub.properties.length;

      sub.properties.forEach((prop) => {
        totalDue += prop.totalPending;
        totalRent += prop.currentMonthRent.finalAmount;
      });

      if (sub.subordinates.length > 0) {
        totalTeamSize += sub.subordinates.length;
        sub.subordinates.forEach(processSubordinate);
      }
    };

    processSubordinate(subordinate);

    return { totalProperties, totalDue, totalTeamSize, totalRent };
  };

  const navigateToPropertyDetails = (property, e) => {
    e.stopPropagation();
    navigate(`/property/${property.propertyId}`);
  };

  const renderHierarchyTree = (node, level = 0) => {
    const isExpanded = expandedNodes[node.subordinateId] || false;
    const stats = calculateSubordinateStats(node);

    return (
      <div key={node.subordinateId} className="mb-2">
        <div
          className={`p-4 rounded-md ${
            level === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700/30"
          } border shadow-sm flex items-center justify-between`}
          style={{ marginLeft: `${level * 1.5}rem` }}
        >
          <div className="flex items-center">
            {(node.subordinates.length > 0 || node.properties.length > 0) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleNode(node.subordinateId)}
                className="mr-2"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
            <div>
              <h3 className="font-medium">{node.username}</h3>
              <p className="text-xs text-muted-foreground">
                {node.email && <span>{node.email}</span>}
                {node.phone && <span> • {node.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-red-500 mr-1">Total Pending:</span>
              <span>{formatCurrency(stats.totalDue)}</span>
            </div>
            <div className="text-sm">
              <span className="text-blue-500 mr-1">Properties:</span>
              <span>{stats.totalProperties}</span>
            </div>
            {stats.totalTeamSize > 0 && (
              <div className="text-sm">
                <span className="text-green-500 mr-1">Team:</span>
                <span>{stats.totalTeamSize}</span>
              </div>
            )}
          </div>
        </div>

        {isExpanded && (
          <div
            className="mt-2"
            style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
          >
            {node.properties.length > 0 && (
              <div className="overflow-x-auto mt-2 mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Base Rent</TableHead>
                      <TableHead>This Month</TableHead>
                      <TableHead>Total Pending</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {node.properties.map((property) => (
                      <TableRow key={property.propertyId}>
                        <TableCell className="font-medium">
                          {property.address}
                        </TableCell>
                        <TableCell>
                          {property.renter?.username || "—"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(property.currentRent)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {formatCurrency(
                                property.currentMonthRent.finalAmount
                              )}
                            </span>
                            {property.currentMonthRent.adjustments
                              .totalAdjustmentAmount > 0 && (
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
                                        {property.currentMonthRent.calculation}
                                      </p>
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
                        </TableCell>
                        <TableCell className="text-red-500">
                          {formatCurrency(property.totalPending)}
                        </TableCell>
                        <TableCell>
                          {property.currentMonthRent.isPaid === true ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" /> Paid
                            </Badge>
                          ) : property.currentMonthRent.isPaid === false ? (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-800 border-red-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Unpaid
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-800 border-gray-200"
                            >
                              N/A
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPropertyDetails(property)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {node.subordinates.map((subordinate) =>
              renderHierarchyTree(subordinate, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGlobalAdjustments = () => {
    if (!globalAdjustments.length) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Global Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalAdjustments.map((adjustment) => (
              <div
                key={adjustment.id}
                className="bg-muted p-4 rounded-lg flex flex-col"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium capitalize">
                    {adjustment.type}
                  </span>
                  <Badge
                    variant={adjustment.percentage > 0 ? "default" : "outline"}
                  >
                    {adjustment.percentage}%
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Effective from {formatDate(adjustment.effectiveFrom)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const activeFiltersCount =
    Object.values(filterOptions).filter(Boolean).length;
  const filteredProperties = getSortedAndFilteredProperties();

  if (!isMounted) {
    return (
      <DashboardLayout>
        <Helmet>
          <title>Subordinate Hierarchy | Property Management</title>
        </Helmet>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (loading && !refreshing) {
    return (
      <DashboardLayout>
        <Helmet>
          <title>Subordinate Hierarchy | Property Management</title>
        </Helmet>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Subordinate Hierarchy | Property Management</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                My Properties
              </CardTitle>
              <Badge variant="outline" className="ml-2">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search properties..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                size="sm"
                onClick={exportToCSV}
                disabled={filteredProperties.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Files
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {activeFiltersCount > 0 && (
                      <Badge
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground"
                        variant="secondary"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuCheckboxItem
                    checked={filterOptions.withPendingDues}
                    onCheckedChange={(checked) =>
                      setFilterOptions({
                        ...filterOptions,
                        withPendingDues: checked,
                      })
                    }
                  >
                    With Pending Dues
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterOptions.withRenter}
                    onCheckedChange={(checked) =>
                      setFilterOptions({
                        ...filterOptions,
                        withRenter: checked,
                        withoutRenter: false,
                      })
                    }
                  >
                    With Renter
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterOptions.withoutRenter}
                    onCheckedChange={(checked) =>
                      setFilterOptions({
                        ...filterOptions,
                        withoutRenter: checked,
                        withRenter: false,
                      })
                    }
                  >
                    Without Renter
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterOptions.rentPaid}
                    onCheckedChange={(checked) =>
                      setFilterOptions({
                        ...filterOptions,
                        rentPaid: checked,
                        rentUnpaid: false,
                      })
                    }
                  >
                    Rent Paid
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterOptions.rentUnpaid}
                    onCheckedChange={(checked) =>
                      setFilterOptions({
                        ...filterOptions,
                        rentUnpaid: checked,
                        rentPaid: false,
                      })
                    }
                  >
                    Rent Unpaid
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setFilterOptions({
                        withPendingDues: false,
                        withRenter: false,
                        withoutRenter: false,
                        rentPaid: false,
                        rentUnpaid: false,
                      })
                    }
                    className="justify-center text-center"
                    disabled={activeFiltersCount === 0}
                  >
                    Reset Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Total Properties
                  </h3>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Total Rent (This Month)
                  </h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      properties.reduce(
                        (sum, prop) => sum + prop.currentMonthRent.finalAmount,
                        0
                      )
                    )}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Total Pending
                  </h3>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(
                      properties.reduce(
                        (sum, prop) => sum + prop.totalPending,
                        0
                      )
                    )}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Status
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {
                        properties.filter(
                          (p) => p.currentMonthRent.isPaid === true
                        ).length
                      }{" "}
                      Paid
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {
                        properties.filter(
                          (p) => p.currentMonthRent.isPaid === false
                        ).length
                      }{" "}
                      Unpaid
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                      {
                        properties.filter(
                          (p) => p.currentMonthRent.isPaid === null
                        ).length
                      }{" "}
                      N/A
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("address")}
                      >
                        <div className="flex items-center">S.No.</div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("address")}
                      >
                        <div className="flex items-center">Property</div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("renter")}
                      >
                        <div className="flex items-center">Renter</div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("currentRent")}
                      >
                        <div className="flex items-center">Base Rent</div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("totalPending")}
                      >
                        <div className="flex items-center">Total Pending</div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("currentMonthRent")}
                      >
                        <div className="flex items-center">Current Month</div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">Status</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow
                        key={property.propertyId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => navigateToPropertyDetails(property, e)}
                      >
                        <TableCell className="font-medium">
                          {properties.indexOf(property) + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {property.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          {property.renter ? (
                            <div className="flex items-center">
                              {property.renter.username}
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-800 border-yellow-200"
                            >
                              No Renter
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(property.currentRent)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              property.totalPending > 0
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            {formatCurrency(property.totalPending)}
                          </span>
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
            </>
          ) : (
            <div className="text-center py-10">
              <Building className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No properties found</h3>
              <p className="text-muted-foreground">
                You don't have any properties assigned yet
              </p>
            </div>
          )}
        </CardContent>
        {isMounted && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Property Details
                </DialogTitle>
                <DialogDescription>
                  {selectedProperty?.address || "Property information"}
                </DialogDescription>
              </DialogHeader>

              {selectedProperty && (
                <Tabs
                  defaultValue="details"
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Property Details</TabsTrigger>
                    <TabsTrigger value="renter">Renter Information</TabsTrigger>
                    <TabsTrigger value="history">Payment History</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto pr-1 mt-4">
                    <TabsContent value="details" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">
                            Property Address
                          </Label>
                          <div className="font-medium text-lg flex items-start">
                            <MapPin className="h-5 w-5 mr-1 mt-0.5 text-muted-foreground" />
                            {selectedProperty.address}
                          </div>
                        </div>

                        <div>
                          <Label className="text-muted-foreground">
                            Property ID
                          </Label>
                          <div className="font-medium">
                            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                              {selectedProperty.propertyId}
                            </code>
                          </div>
                        </div>

                        <div>
                          <Label className="text-muted-foreground">
                            Base Rent
                          </Label>
                          <div className="font-medium text-lg text-primary">
                            {formatCurrency(selectedProperty.currentRent)}
                          </div>
                        </div>

                        <div>
                          <Label className="text-muted-foreground">
                            Total Pending Amount
                          </Label>
                          <div
                            className={`font-medium text-lg ${
                              selectedProperty.totalPending > 0
                                ? "text-red-500"
                                : ""
                            }`}
                          >
                            {formatCurrency(selectedProperty.totalPending)}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-muted-foreground mb-2 block">
                            Current Month Rent Calculation
                          </Label>
                          <Card className="bg-slate-50 dark:bg-slate-800/50">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Base Rent
                                  </p>
                                  <p className="font-medium">
                                    {formatCurrency(
                                      selectedProperty.currentMonthRent.baseRent
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Adjustments
                                  </p>
                                  <p className="font-medium">
                                    {formatCurrency(
                                      selectedProperty.currentMonthRent
                                        .adjustments.totalAdjustmentAmount
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Final Amount
                                  </p>
                                  <p className="font-medium text-primary">
                                    {formatCurrency(
                                      selectedProperty.currentMonthRent
                                        .finalAmount
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Adjustments Breakdown:
                                </p>
                                <div className="space-y-1">
                                  {selectedProperty.currentMonthRent.adjustments.adjustments.map(
                                    (adjustment, idx) => (
                                      <div
                                        key={idx}
                                        className="text-sm flex justify-between"
                                      >
                                        <span className="capitalize">
                                          {adjustment.type} (
                                          {adjustment.percentage}%)
                                        </span>
                                        <span>
                                          {formatCurrency(adjustment.amount)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="text-sm mt-2 text-muted-foreground">
                                  {
                                    selectedProperty.currentMonthRent
                                      .calculation
                                  }
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="renter" className="mt-0">
                      {selectedProperty.renter ? (
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium">
                                {selectedProperty.renter.username}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Current Tenant
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">
                                Tenant ID
                              </Label>
                              <div className="font-medium">
                                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                                  {selectedProperty.renter.id}
                                </code>
                              </div>
                            </div>

                            <div>
                              <Label className="text-muted-foreground">
                                Current Payment Status
                              </Label>
                              <div className="font-medium">
                                {selectedProperty.currentMonthRent.isPaid ===
                                true ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                    Paid
                                  </Badge>
                                ) : selectedProperty.currentMonthRent.isPaid ===
                                  false ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-100 text-red-800 border-red-200"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" /> Unpaid
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-gray-100 text-gray-800 border-gray-200"
                                  >
                                    N/A
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <h3 className="text-lg font-medium">
                            No Renter Assigned
                          </h3>
                          <p className="text-muted-foreground">
                            This property currently has no tenant assigned to it
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Payment History</h3>

                        {selectedProperty.rentDetails.length > 0 ? (
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Month</TableHead>
                                  <TableHead>Base Rent</TableHead>
                                  <TableHead>Final Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProperty.rentDetails
                                  .sort(
                                    (a, b) =>
                                      new Date(b.month).getTime() -
                                      new Date(a.month).getTime()
                                  )
                                  .map((detail, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="flex items-center">
                                        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {formatDate(detail.month)}
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(detail.baseRent)}
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(detail.finalAmount)}
                                      </TableCell>
                                      <TableCell>
                                        {detail.isPaid === true ? (
                                          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                            Paid
                                          </Badge>
                                        ) : detail.isPaid === false ? (
                                          <Badge
                                            variant="outline"
                                            className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />{" "}
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
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-md">
                            <p className="text-muted-foreground">
                              No payment history found for this property
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Footer />
      </div>
    </DashboardLayout>
  );
}
