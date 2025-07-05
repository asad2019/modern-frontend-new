import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePageData } from "@/hooks/usePageData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/components/ui/use-toast";
import PageLoader from "@/components/common/PageLoader";

const YarnManagement = () => {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { data, isLoading } = usePageData([
    "yarnStock",
    "yarnQualities",
    "suppliers",
    "stockLocations",
    "contracts",
  ]);
  const { receiveYarn, purchaseYarn, issueYarn, receiveSizing, issueSizing } = useData();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [formData, setFormData] = useState({
    // Common fields
    receive_from: "",
    issue_to: "",
    contract_id: "",
    sizing_account_id: "",
    supplier_id: "",
    location_id: "",

    // Warp yarn fields
    warp_quality_id: "",
    warp_bags_quantity: "",
    warp_rate: "",
    warp_amount: "",

    // Weft yarn fields
    weft_quality_id: "",
    weft_bags_quantity: "",
    weft_rate: "",
    weft_amount: "",

    // Calculated fields
    total_weight: "",
    total_amount: "",

    // Additional fields
    invoice_number: "",
    received_date: new Date().toISOString().split("T")[0],
    issued_date: new Date().toISOString().split("T")[0],
    purpose: "",
    issued_to: "",
    remarks: "",

    // Sizing specific fields from provided code
    quality_id: "",
    loom_id: "",
    wires: "",
    yarn_count_warp: "",
    qty_bag: "",
    per_bag: "",
    kones: "",
    weight: "",
    quality_set: "",
    length_set: "",
    length_yarn: "",
    qty_gulle: "",
    weight_gulle: "",
    qty_paper: "",
    weight_paper: "",
    empty_bag: "",
    bag_weight: "",
    gole_waste: "",
    reed: "",
    g5: "",
    g6: "",
    warp: "",
    pick: "",
    weft: "",
    QTY: "",
    weight_warp: "",
    weight_weft: "",
    count: "",
    rate: "",
    warp_poly: "",
    weft_poly: "",
    warp_cotton: "",
    weft_cotton: "",
    wrap_bag: "",
    total_bag: "",
    wrap_rate: "",
    bilty_number: "",
    bilty_date: new Date().toISOString().split("T")[0],
    transporter: "",
    received_by: "",
    last_five_prices: "",
    contract_qty: "",
    issued: "",
    balance_qty: "",
    beam_name: "",
    qty: "",
    amount: "",
    income_tax_rate: "",
    income_tax_amount: "",
    net_amount: "",
  });

  // Weight calculation function from costing module
  const calculateWeight = (quality) => {
    if (!quality || !quality.reed || !quality.g5 || !quality.count) return 0;
    return (
      (parseFloat(quality.reed) * parseFloat(quality.g5) * 1.0936) /
      (parseFloat(quality.count) * 800)
    );
  };

  // Sizing calculation functions from provided code
  const calculateWeightWarp = () => {
    const reed = parseFloat(formData.reed) || 0;
    const g5 = parseFloat(formData.g5) || 0;
    const warp = parseFloat(formData.warp) || 1;
    if (warp === 0) return 0;
    return (reed * g5 * 1.0936) / (warp * 800);
  };

  const calculateWeightWeft = () => {
    const reed = parseFloat(formData.pick) || 0;
    const g5 = parseFloat(formData.g5) || 0;
    const weft = parseFloat(formData.weft) || 1;
    if (weft === 0) return 0;
    return (reed * g5 * 1.0936) / (weft * 800);
  };

  const calculateTotalWarpWeft = () => {
    const weightWarp = calculateWeightWarp();
    const weightWeft = calculateWeightWeft();
    return weightWarp + weightWeft;
  };

  const calculateTotalWeight = () => {
    const wires = parseFloat(formData.wires) || 0;
    const length = parseFloat(formData.length_set) || 0;
    const warpCount = parseFloat(formData.yarn_count_warp) || 1;
    if (warpCount === 0) return 0;
    return (wires * length) / 786.1 / warpCount / 2.2046 / 1.0936;
  };

  const calculatePoly = () => {
    const warp = calculateWeightWarp() || 0;
    const weft = calculateWeightWeft() || 0;
    const total = calculateTotalWarpWeft() || 1;
    const warpPoly = parseFloat(formData.warp_poly) || 0;
    const weftPoly = parseFloat(formData.weft_poly) || 0;
    return (warp * warpPoly + weft * weftPoly) / total;
  };

  const calculateCotton = () => {
    const warp = calculateWeightWarp() || 0;
    const weft = calculateWeightWeft() || 0;
    const total = calculateTotalWarpWeft() || 1;
    const warpCotton = parseFloat(formData.warp_cotton) || 0;
    const weftCotton = parseFloat(formData.weft_cotton) || 0;
    return (warp * warpCotton + weft * weftCotton) / total;
  };

  // Auto-calculate amounts and weights
  useEffect(() => {
    const warpQty = parseFloat(formData.warp_bags_quantity) || 0;
    const warpRate = parseFloat(formData.warp_rate) || 0;
    const weftQty = parseFloat(formData.weft_bags_quantity) || 0;
    const weftRate = parseFloat(formData.weft_rate) || 0;

    const warpAmount = warpQty * warpRate;
    const weftAmount = weftQty * weftRate;
    const totalAmount = warpAmount + weftAmount;

    // Calculate total weight using costing formula
    const warpQuality = data.yarnQualities?.find(
      (q) => q.id.toString() === formData.warp_quality_id,
    );
    const weftQuality = data.yarnQualities?.find(
      (q) => q.id.toString() === formData.weft_quality_id,
    );

    let totalWeight = 0;
    if (warpQuality && warpQty) {
      totalWeight += calculateWeight(warpQuality) * warpQty;
    }
    if (weftQuality && weftQty) {
      totalWeight += calculateWeight(weftQuality) * weftQty;
    }

    // Calculate sizing total weight using the provided formula
    const sizingTotalWeight = calculateTotalWeight();

    setFormData((prev) => ({
      ...prev,
      warp_amount: warpAmount.toFixed(2),
      weft_amount: weftAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      total_weight: (dialogType.includes("sizing")
        ? sizingTotalWeight
        : totalWeight
      ).toFixed(3),
      weight_warp: calculateWeightWarp().toFixed(4),
      weight_weft: calculateWeightWeft().toFixed(4),
    }));
  }, [
    formData.warp_bags_quantity,
    formData.warp_rate,
    formData.weft_bags_quantity,
    formData.weft_rate,
    formData.warp_quality_id,
    formData.weft_quality_id,
    formData.wires,
    formData.length_set,
    formData.yarn_count_warp,
    formData.reed,
    formData.g5,
    formData.warp,
    formData.pick,
    formData.weft,
    data.yarnQualities,
    dialogType,
  ]);

  // NOW CHECK FOR LOADING AFTER ALL HOOKS ARE DECLARED
  if (isLoading) {
    return <PageLoader />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload with proper data types
      const payload = {
        ...formData,
        // Convert string IDs to numbers where needed
        contract_id: formData.contract_id ? parseInt(formData.contract_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        warp_quality_id: formData.warp_quality_id ? parseInt(formData.warp_quality_id) : null,
        weft_quality_id: formData.weft_quality_id ? parseInt(formData.weft_quality_id) : null,
        yarn_count_warp: formData.yarn_count_warp ? parseInt(formData.yarn_count_warp) : null,
      };

      if (dialogType === "receive") {
        await receiveYarn(payload);
        toast({
          title: "Success",
          description: "Yarn received successfully",
        });
      } else if (dialogType === "purchase") {
        await purchaseYarn(payload);
        toast({
          title: "Success",
          description: "Yarn purchased successfully",
        });
      } else if (dialogType === "issue") {
        await issueYarn(payload);
        toast({
          title: "Success",
          description: "Yarn issued successfully",
        });
      } else if (dialogType === "sizing-receive") {
        await receiveSizing({ ...payload, receive_from: "sizing" });
        toast({
          title: "Success",
          description: "Yarn received from sizing successfully",
        });
      } else if (dialogType === "sizing-issue") {
        await issueSizing({ ...payload, issue_to: "sizing" });
        toast({
          title: "Success",
          description: "Yarn issued to sizing successfully",
        });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Operation failed. Please try again.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      receive_from: "",
      issue_to: "",
      contract_id: "",
      sizing_account_id: "",
      supplier_id: "",
      location_id: "",
      warp_quality_id: "",
      warp_bags_quantity: "",
      warp_rate: "",
      warp_amount: "",
      weft_quality_id: "",
      weft_bags_quantity: "",
      weft_rate: "",
      weft_amount: "",
      total_weight: "",
      total_amount: "",
      invoice_number: "",
      received_date: new Date().toISOString().split("T")[0],
      issued_date: new Date().toISOString().split("T")[0],
      purpose: "",
      issued_to: "",
      remarks: "",
      quality_id: "",
      loom_id: "",
      wires: "",
      yarn_count_warp: "",
      qty_bag: "",
      per_bag: "",
      kones: "",
      weight: "",
      quality_set: "",
      length_set: "",
      length_yarn: "",
      qty_gulle: "",
      weight_gulle: "",
      qty_paper: "",
      weight_paper: "",
      empty_bag: "",
      bag_weight: "",
      gole_waste: "",
      reed: "",
      g5: "",
      g6: "",
      warp: "",
      pick: "",
      weft: "",
      QTY: "",
      weight_warp: "",
      weight_weft: "",
      count: "",
      rate: "",
      warp_poly: "",
      weft_poly: "",
      warp_cotton: "",
      weft_cotton: "",
      wrap_bag: "",
      total_bag: "",
      wrap_rate: "",
      bilty_number: "",
      bilty_date: new Date().toISOString().split("T")[0],
      transporter: "",
      received_by: "",
      last_five_prices: "",
      contract_qty: "",
      issued: "",
      balance_qty: "",
      beam_name: "",
      qty: "",
      amount: "",
      income_tax_rate: "",
      income_tax_amount: "",
      net_amount: "",
    });
  };

  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    resetForm();
  };

  const getContractsWithClients = () => {
    return (
      data.contracts
        ?.filter((contract) => !contract.is_internal)
        .map((contract) => ({
          ...contract,
          display_name: `${contract.contract_number} - ${contract.client_name || "Unknown Client"}`,
        })) || []
    );
  };

  const totalStock = Array.isArray(data.yarnStock)
    ? data.yarnStock.reduce(
        (sum, yarn) => sum + parseFloat(yarn.quantity_kg || 0),
        0,
      )
    : 0;
  const totalValue = Array.isArray(data.yarnStock)
    ? data.yarnStock.reduce(
        (sum, yarn) =>
          sum +
          parseFloat(yarn.quantity_kg || 0) * parseFloat(yarn.rate_per_kg || 0),
        0,
      )
    : 0;
  const lowStockItems = Array.isArray(data.yarnStock)
    ? data.yarnStock.filter((yarn) => parseFloat(yarn.quantity_kg || 0) < 100)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yarn Management</h2>
          <p className="text-muted-foreground">
            Manage yarn inventory, purchases, and issues
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => openDialog("receive")}>
            <Plus className="mr-2 h-4 w-4" />
            Receive Yarn
          </Button>
          <Button onClick={() => openDialog("purchase")} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Purchase Yarn
          </Button>
          <Button onClick={() => openDialog("issue")} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Issue Yarn
          </Button>
          <Button
            onClick={() => openDialog("sizing-receive")}
            variant="secondary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Receive from Sizing
          </Button>
          <Button
            onClick={() => openDialog("sizing-issue")}
            variant="secondary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Issue to Sizing
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">All yarn qualities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yarn Qualities
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(data.yarnQualities)
                ? data.yarnQualities.length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Available qualities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alert
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below 100kg</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Yarn Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quality</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Rate (per kg)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.yarnStock) &&
                data.yarnStock.map((yarn) => {
                  const quality = Array.isArray(data.yarnQualities)
                    ? data.yarnQualities.find((q) => q.id === yarn.quality_id)
                    : null;
                  const supplier = Array.isArray(data.suppliers)
                    ? data.suppliers.find((s) => s.id === yarn.supplier_id)
                    : null;
                  const location = Array.isArray(data.stockLocations)
                    ? data.stockLocations.find((l) => l.id === yarn.location_id)
                    : null;
                  const quantity = parseFloat(yarn.quantity_kg || 0);
                  const rate = parseFloat(yarn.rate_per_kg || 0);

                  return (
                    <TableRow key={yarn.id}>
                      <TableCell className="font-medium">
                        {quality?.count || "Unknown"}
                      </TableCell>
                      <TableCell>{supplier?.name || "Unknown"}</TableCell>
                      <TableCell>{location?.name || "Unknown"}</TableCell>
                      <TableCell>{quantity.toFixed(2)}</TableCell>
                      <TableCell>${rate.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            quantity < 100
                              ? "destructive"
                              : quantity < 500
                                ? "secondary"
                                : "default"
                          }
                        >
                          {quantity < 100
                            ? "Low Stock"
                            : quantity < 500
                              ? "Medium"
                              : "Good Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-hidden flex flex-col" description="Yarn management form">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {dialogType === "receive" && "Receive Yarn"}
              {dialogType === "purchase" && "Purchase Yarn"}
              {dialogType === "issue" && "Issue Yarn"}
              {dialogType === "sizing-receive" && "Receive Yarn from Sizing"}
              {dialogType === "sizing-issue" && "Issue Yarn to Sizing"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <form id="yarn-form" onSubmit={handleSubmit} className="space-y-4">
              {/* RECEIVE YARN FORM */}
              {dialogType === "receive" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="receive_from">Receive From</Label>
                    <Select
                      value={formData.receive_from}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          receive_from: value,
                          contract_id: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.receive_from === "contract" ||
                    formData.receive_from === "production") && (
                    <div className="space-y-2">
                      <Label htmlFor="contract_id">Select Contract</Label>
                      <Select
                        value={formData.contract_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, contract_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract with client" />
                        </SelectTrigger>
                        <SelectContent>
                          {getContractsWithClients().map((contract) => (
                            <SelectItem
                              key={contract.id}
                              value={contract.id.toString()}
                            >
                              {contract}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="location_id">
                      Stock Location (Where it will be received)
                    </Label>
                    <Select
                      value={formData.location_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, location_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data.stockLocations) &&
                          data.stockLocations.map((location) => (
                            <SelectItem
                              key={location.id}
                              value={location.id.toString()}
                            >
                              {location.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* PURCHASE YARN FORM */}
              {dialogType === "purchase" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="supplier_id">Supplier</Label>
                    <Select
                      value={formData.supplier_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, supplier_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data.suppliers) &&
                          data.suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              {supplier.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_id">
                      Stock Location (Where it will be sent to)
                    </Label>
                    <Select
                      value={formData.location_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, location_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data.stockLocations) &&
                          data.stockLocations.map((location) => (
                            <SelectItem
                              key={location.id}
                              value={location.id.toString()}
                            >
                              {location.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* ISSUE YARN FORM */}
              {dialogType === "issue" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="issue_to">Issue To</Label>
                    <Select
                      value={formData.issue_to}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          issue_to: value,
                          contract_id: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.issue_to === "contract" ||
                    formData.issue_to === "production") && (
                    <div className="space-y-2">
                      <Label htmlFor="contract_id">Select Contract</Label>
                      <Select
                        value={formData.contract_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, contract_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract with client" />
                        </SelectTrigger>
                        <SelectContent>
                          {getContractsWithClients().map((contract) => (
                            <SelectItem
                              key={contract.id}
                              value={contract.id.toString()}
                            >
                              {contract.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="location_id">
                      Stock Location (From where it will be issued)
                    </Label>
                    <Select
                      value={formData.location_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, location_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data.stockLocations) &&
                          data.stockLocations.map((location) => (
                            <SelectItem
                              key={location.id}
                              value={location.id.toString()}
                            >
                              {location.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Common fields for regular yarn forms */}
              {(dialogType === "receive" || dialogType === "purchase" || dialogType === "issue") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warp_quality_id">Warp Quality</Label>
                      <Select
                        value={formData.warp_quality_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, warp_quality_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select warp quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.yarnQualities) &&
                            data.yarnQualities.map((quality) => (
                              <SelectItem
                                key={quality.id}
                                value={quality.id.toString()}
                              >
                                {quality.count} - {quality.ratio}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weft_quality_id">Weft Quality</Label>
                      <Select
                        value={formData.weft_quality_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, weft_quality_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select weft quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.yarnQualities) &&
                            data.yarnQualities.map((quality) => (
                              <SelectItem
                                key={quality.id}
                                value={quality.id.toString()}
                              >
                                {quality.count} - {quality.ratio}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warp_bags_quantity">Warp Bags Quantity</Label>
                      <Input
                        id="warp_bags_quantity"
                        type="number"
                        step="0.01"
                        value={formData.warp_bags_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            warp_bags_quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weft_bags_quantity">Weft Bags Quantity</Label>
                      <Input
                        id="weft_bags_quantity"
                        type="number"
                        step="0.01"
                        value={formData.weft_bags_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weft_bags_quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warp_rate">Warp Rate (per bag)</Label>
                      <Input
                        id="warp_rate"
                        type="number"
                        step="0.01"
                        value={formData.warp_rate}
                        onChange={(e) =>
                          setFormData({ ...formData, warp_rate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weft_rate">Weft Rate (per bag)</Label>
                      <Input
                        id="weft_rate"
                        type="number"
                        step="0.01"
                        value={formData.weft_rate}
                        onChange={(e) =>
                          setFormData({ ...formData, weft_rate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warp_amount">Warp Amount</Label>
                      <Input
                        id="warp_amount"
                        type="number"
                        step="0.01"
                        value={formData.warp_amount}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weft_amount">Weft Amount</Label>
                      <Input
                        id="weft_amount"
                        type="number"
                        step="0.01"
                        value={formData.weft_amount}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="received_date">
                        {dialogType === "issue" ? "Issued Date" : "Received Date"}
                      </Label>
                      <Input
                        id="received_date"
                        type="date"
                        value={
                          dialogType === "issue"
                            ? formData.issued_date
                            : formData.received_date
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [dialogType === "issue" ? "issued_date" : "received_date"]:
                              e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {dialogType === "issue" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Input
                          id="purpose"
                          value={formData.purpose}
                          onChange={(e) =>
                            setFormData({ ...formData, purpose: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issued_to">Issued To</Label>
                        <Input
                          id="issued_to"
                          value={formData.issued_to}
                          onChange={(e) =>
                            setFormData({ ...formData, issued_to: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* SIZING FORMS */}
              {(dialogType === "sizing-receive" ||
                dialogType === "sizing-issue") && (
                <>
                  {/* Mandatory Fields */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold">Mandatory Fields</h4>

                    <div className="space-y-2">
                      <Label htmlFor="contract_id">Contract #</Label>
                      <Select
                        value={formData.contract_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, contract_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                        <SelectContent>
                          {getContractsWithClients().map((contract) => (
                            <SelectItem
                              key={contract.id}
                              value={contract.id.toString()}
                            >
                              {contract.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sizing_account_id">Sizing Account</Label>
                      <Input
                        id="sizing_account_id"
                        value={formData.sizing_account_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sizing_account_id: e.target.value,
                          })
                        }
                        placeholder="Account name"
                      />
                    </div>
                  </div>

                  {/* Stock Details */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold">Stock Details</h4>

                    <div className="space-y-2">
                      <Label htmlFor="location_id">Stock Location</Label>
                      <Select
                        value={formData.location_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, location_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stock location" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.stockLocations) &&
                            data.stockLocations.map((location) => (
                              <SelectItem
                                key={location.id}
                                value={location.id.toString()}
                              >
                                {location.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yarn_count_warp">Yarn Count Warp</Label>
                      <Select
                        value={formData.yarn_count_warp}
                        onValueChange={(value) =>
                          setFormData({ ...formData, yarn_count_warp: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select yarn quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.yarnQualities) &&
                            data.yarnQualities.map((quality) => (
                              <SelectItem
                                key={quality.id}
                                value={quality.id.toString()}
                              >
                                {quality.count} - {quality.ratio}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wires">Wires</Label>
                        <Input
                          id="wires"
                          type="number"
                          value={formData.wires}
                          onChange={(e) =>
                            setFormData({ ...formData, wires: e.target.value })
                          }
                          placeholder="Wires"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qty_bag">Qty/Bag</Label>
                        <Input
                          id="qty_bag"
                          type="number"
                          step="0.01"
                          value={formData.qty_bag}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              qty_bag: e.target.value,
                            })
                          }
                          placeholder="Qty/Bag"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="per_bag">Per/Bag</Label>
                        <Input
                          id="per_bag"
                          type="number"
                          step="0.01"
                          value={formData.per_bag}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              per_bag: e.target.value,
                            })
                          }
                          placeholder="Per/Bag"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kones">Kones</Label>
                        <Input
                          id="kones"
                          type="number"
                          value={formData.kones}
                          onChange={(e) =>
                            setFormData({ ...formData, kones: e.target.value })
                          }
                          placeholder="Kones"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        placeholder="Weight"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quality_set">Quality Set</Label>
                      <Input
                        id="quality_set"
                        type="number"
                        value={formData.quality_set}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quality_set: e.target.value,
                          })
                        }
                        placeholder="Quality Set"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length_set">Length Set</Label>
                        <Input
                          id="length_set"
                          type="number"
                          step="0.01"
                          value={formData.length_set}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              length_set: e.target.value,
                            })
                          }
                          placeholder="Length Set"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="length_yarn">Length Yarn</Label>
                        <Input
                          id="length_yarn"
                          type="number"
                          step="0.01"
                          value={formData.length_yarn}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              length_yarn: e.target.value,
                            })
                          }
                          placeholder="Length Yarn"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qty_gulle">Qty Gulle</Label>
                        <Input
                          id="qty_gulle"
                          type="number"
                          value={formData.qty_gulle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              qty_gulle: e.target.value,
                            })
                          }
                          placeholder="Qty Gulle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight_gulle">Weight Gulle</Label>
                        <Input
                          id="weight_gulle"
                          type="number"
                          step="0.01"
                          value={formData.weight_gulle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weight_gulle: e.target.value,
                            })
                          }
                          placeholder="Weight Gulle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qty_paper">Qty Paper</Label>
                        <Input
                          id="qty_paper"
                          type="number"
                          value={formData.qty_paper}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              qty_paper: e.target.value,
                            })
                          }
                          placeholder="Qty Paper"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight_paper">Weight Paper</Label>
                        <Input
                          id="weight_paper"
                          type="number"
                          step="0.01"
                          value={formData.weight_paper}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weight_paper: e.target.value,
                            })
                          }
                          placeholder="Weight Paper"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empty_bag">Empty Bag</Label>
                        <Input
                          id="empty_bag"
                          type="number"
                          value={formData.empty_bag}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              empty_bag: e.target.value,
                            })
                          }
                          placeholder="Empty Bag"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bag_weight">Bag Weight</Label>
                        <Input
                          id="bag_weight"
                          type="number"
                          step="0.01"
                          value={formData.bag_weight}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bag_weight: e.target.value,
                            })
                          }
                          placeholder="Bag Weight"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gole_waste">Gole Waste</Label>
                        <Input
                          id="gole_waste"
                          type="number"
                          step="0.01"
                          value={formData.gole_waste}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gole_waste: e.target.value,
                            })
                          }
                          placeholder="Gole Waste"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_weight_calc">Total Weight</Label>
                        <Input
                          id="total_weight_calc"
                          type="number"
                          step="0.01"
                          value={formData.total_weight}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rate">Rate</Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.01"
                          value={formData.rate}
                          onChange={(e) =>
                            setFormData({ ...formData, rate: e.target.value })
                          }
                          placeholder="Rate"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                          }
                          placeholder="Amount"
                        />
                      </div>
                    </div>

                    {/* <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="income_tax_rate">Income Tax Rate</Label>
                      <Input
                        id="income_tax_rate"
                        type="number"
                        step="0.01"
                        value={formData.income_tax_rate}
                        onChange={(e) => setFormData({...formData, income_tax_rate: e.target.value})}
                        placeholder="Income Tax Rate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="income_tax_amount">Income Tax Amount</Label>
                      <Input
                        id="income_tax_amount"
                        type="number"
                        step="0.01"
                        value={formData.income_tax_amount}
                        onChange={(e) => setFormData({...formData, income_tax_amount: e.target.value})}
                        placeholder="Income Tax Amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="net_amount">Net Amount</Label>
                      <Input
                        id="net_amount"
                        type="number"
                        step="0.01"
                        value={formData.net_amount}
                        onChange={(e) => setFormData({...formData, net_amount: e.target.value})}
                        placeholder="Net Amount"
                      />
                    </div>
                  </div> */}
                  </div>
                </>
              )}

              {/* Total Section */}
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-semibold">Totals</h4>

                <div className="grid grid-cols-2 gap-4">

                  {(dialogType === "receive" || dialogType === "purchase") && (
                    <div className="space-y-2">
                      <Label htmlFor="total_amount">Total Amount</Label>
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        value={formData.total_amount}
                        readOnly
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Fields */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                />
              </div>
            </form>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="yarn-form">
              {dialogType === "receive" && "Receive Yarn"}
              {dialogType === "purchase" && "Purchase Yarn"}
              {dialogType === "issue" && "Issue Yarn"}
              {dialogType === "sizing-receive" && "Receive from Sizing"}
              {dialogType === "sizing-issue" && "Issue to Sizing"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default YarnManagement;