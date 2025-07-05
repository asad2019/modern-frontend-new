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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/components/ui/use-toast";
import PageLoader from "@/components/common/PageLoader";

const YarnManagement = () => {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { data, isLoading } = usePageData([
    "yarnStock",
    "sizingStock",
    "yarnQualities",
    "suppliers",
    "stockLocations", 
    "contracts",
    "sizingAccounts",
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

    // Sizing specific fields
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
    const sizingAmount = parseFloat(formData.rate) * sizingTotalWeight || 0;

    setFormData((prev) => ({
      ...prev,
      warp_amount: warpAmount.toFixed(2),
      weft_amount: weftAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      total_weight: (dialogType.includes("sizing")
        ? sizingTotalWeight
        : totalWeight
      ).toFixed(4),
      amount: sizingAmount.toFixed(2),
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
      let payload = {};

      // Prepare payload based on dialog type
      if (dialogType === "receive") {
        payload = {
          receive_from: formData.receive_from,
          contract_id: formData.contract_id ? formData.contract_id : null,
          location_id: formData.location_id ? formData.location_id : null,
          warp_quality_id: formData.warp_quality_id ? formData.warp_quality_id : null,
          weft_quality_id: formData.weft_quality_id ? formData.weft_quality_id : null,
          warp_bags_quantity: parseFloat(formData.warp_bags_quantity) || 0,
          weft_bags_quantity: parseFloat(formData.weft_bags_quantity) || 0,
          warp_rate: parseFloat(formData.warp_rate) || 0,
          weft_rate: parseFloat(formData.weft_rate) || 0,
          warp_amount: parseFloat(formData.warp_amount) || 0,
          weft_amount: parseFloat(formData.weft_amount) || 0,
          total_weight: parseFloat(formData.total_weight) || 0,
          total_amount: parseFloat(formData.total_amount) || 0,
          received_date: formData.received_date,
          remarks: formData.remarks || "",
        };
      } else if (dialogType === "purchase") {
        payload = {
          supplier_id: formData.supplier_id ? formData.supplier_id : null,
          location_id: formData.location_id ? formData.location_id : null,
          warp_quality_id: formData.warp_quality_id ? formData.warp_quality_id : null,
          weft_quality_id: formData.weft_quality_id ? formData.weft_quality_id : null,
          warp_bags_quantity: parseFloat(formData.warp_bags_quantity) || 0,
          weft_bags_quantity: parseFloat(formData.weft_bags_quantity) || 0,
          warp_rate: parseFloat(formData.warp_rate) || 0,
          weft_rate: parseFloat(formData.weft_rate) || 0,
          warp_amount: parseFloat(formData.warp_amount) || 0,
          weft_amount: parseFloat(formData.weft_amount) || 0,
          total_weight: parseFloat(formData.total_weight) || 0,
          total_amount: parseFloat(formData.total_amount) || 0,
          received_date: formData.received_date,
          remarks: formData.remarks || "",
        };
      } else if (dialogType === "issue") {
        payload = {
          issue_to: formData.issue_to,
          contract_id: formData.contract_id ? formData.contract_id : null,
          location_id: formData.location_id ? formData.location_id : null,
          warp_quality_id: formData.warp_quality_id ? formData.warp_quality_id : null,
          weft_quality_id: formData.weft_quality_id ? formData.weft_quality_id : null,
          warp_bags_quantity: parseFloat(formData.warp_bags_quantity) || 0,
          weft_bags_quantity: parseFloat(formData.weft_bags_quantity) || 0,
          warp_rate: parseFloat(formData.warp_rate) || 0,
          weft_rate: parseFloat(formData.weft_rate) || 0,
          warp_amount: parseFloat(formData.warp_amount) || 0,
          weft_amount: parseFloat(formData.weft_amount) || 0,
          total_weight: parseFloat(formData.total_weight) || 0,
          issued_date: formData.issued_date,
          purpose: formData.purpose || "",
          issued_to: formData.issued_to || "",
          total_amount: parseFloat(formData.total_amount) || 0,
          remarks: formData.remarks || "",
        };
      } else if (dialogType === "sizing-receive") {
        payload = {
          receive_from: "sizing",
          contract_id: formData.contract_id ? formData.contract_id : null,
          sizing_account_id: formData.sizing_account_id ? formData.sizing_account_id : null,
          location_id: formData.location_id ? formData.location_id : null,
          yarn_count_warp: formData.yarn_count_warp ? formData.yarn_count_warp : null,
          wires: parseInt(formData.wires) || 0,
          qty_bag: parseFloat(formData.qty_bag) || 0,
          per_bag: parseFloat(formData.per_bag) || 0,
          kones: parseInt(formData.kones) || 0,
          weight: parseFloat(formData.weight) || 0,
          quality_set: parseInt(formData.quality_set) || 0,
          length_set: parseFloat(formData.length_set) || 0,
          length_yarn: parseFloat(formData.length_yarn) || 0,
          qty_gulle: parseInt(formData.qty_gulle) || 0,
          weight_gulle: parseFloat(formData.weight_gulle) || 0,
          qty_paper: parseInt(formData.qty_paper) || 0,
          weight_paper: parseFloat(formData.weight_paper) || 0,
          empty_bag: parseInt(formData.empty_bag) || 0,
          bag_weight: parseFloat(formData.bag_weight) || 0,
          gole_waste: parseFloat(formData.gole_waste) || 0,
          total_weight: parseFloat(formData.total_weight) || 0,
          rate: parseFloat(formData.rate) || 0,
          amount: parseFloat(formData.amount) || 0,
          remarks: formData.remarks || "",
        };
      } else if (dialogType === "sizing-issue") {
        payload = {
          issue_to: "sizing",
          contract_id: formData.contract_id ? formData.contract_id : null,
          sizing_account_id: formData.sizing_account_id ? formData.sizing_account_id : null,
          location_id: formData.location_id ? formData.location_id : null,
          yarn_count_warp: formData.yarn_count_warp ? formData.yarn_count_warp : null,
          wires: parseInt(formData.wires) || 0,
          qty_bag: parseFloat(formData.qty_bag) || 0,
          per_bag: parseFloat(formData.per_bag) || 0,
          kones: parseInt(formData.kones) || 0,
          weight: parseFloat(formData.weight) || 0,
          quality_set: parseInt(formData.quality_set) || 0,
          length_set: parseFloat(formData.length_set) || 0,
          length_yarn: parseFloat(formData.length_yarn) || 0,
          qty_gulle: parseInt(formData.qty_gulle) || 0,
          weight_gulle: parseFloat(formData.weight_gulle) || 0,
          qty_paper: parseInt(formData.qty_paper) || 0,
          weight_paper: parseFloat(formData.weight_paper) || 0,
          empty_bag: parseInt(formData.empty_bag) || 0,
          bag_weight: parseFloat(formData.bag_weight) || 0,
          gole_waste: parseFloat(formData.gole_waste) || 0,
          total_weight: parseFloat(formData.total_weight) || 0,
          rate: parseFloat(formData.rate) || 0,
          amount: parseFloat(formData.amount) || 0,
          remarks: formData.remarks || "",
        };
      }

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
        await receiveSizing(payload);
        toast({
          title: "Success",
          description: "Yarn received from sizing successfully",
        });
      } else if (dialogType === "sizing-issue") {
        await issueSizing(payload);
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
          display_name: `${contract.id || 'N/A'} - ${contract.client?.name || contract.client_name || "Unknown Client"}`,
        })) || []
    );
  };

  // Calculate total stock by adding received and subtracting issued
  const calculateTotalStock = () => {
    const yarnReceived = getYarnReceived().reduce(
      (sum, yarn) => sum + parseFloat(yarn.warp_bags_quantity || 0) + parseFloat(yarn.weft_bags_quantity || 0),
      0,
    );

    const yarnPurchased = getYarnPurchased().reduce(
      (sum, yarn) => sum + parseFloat(yarn.warp_bags_quantity || 0) + parseFloat(yarn.weft_bags_quantity || 0),
      0,
    );

    const sizingReceived = getSizingReceived().reduce(
      (sum, yarn) => sum + parseFloat(yarn.total_weight || 0),
      0,
    );

    const yarnIssued = getYarnIssued().reduce(
      (sum, yarn) => sum + parseFloat(yarn.warp_bags_quantity || 0) + parseFloat(yarn.weft_bags_quantity || 0),
      0,
    );

    const sizingIssued = getSizingIssued().reduce(
      (sum, yarn) => sum + parseFloat(yarn.total_weight || 0),
      0,
    );

    return (yarnReceived + yarnPurchased + sizingReceived) - (yarnIssued + sizingIssued);
  };

  // Filter data by transaction type
  const getYarnReceived = () => {
    return Array.isArray(data.yarnStock) 
      ? data.yarnStock.filter(item => item.type === 'receive')
      : [];
  };

  const getYarnPurchased = () => {
    return Array.isArray(data.yarnStock) 
      ? data.yarnStock.filter(item => item.type === 'purchase')
      : [];
  };

  const getYarnIssued = () => {
    return Array.isArray(data.yarnStock) 
      ? data.yarnStock.filter(item => item.type === 'issue')
      : [];
  };

  const getSizingReceived = () => {
    return Array.isArray(data.sizingStock) 
      ? data.sizingStock.filter(item => item.type === 'receive')
      : [];
  };

  const getSizingIssued = () => {
    return Array.isArray(data.sizingStock) 
      ? data.sizingStock.filter(item => item.type === 'issue')
      : [];
  };

  const totalStock = calculateTotalStock();

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toFixed(2)} bags</div>
            <p className="text-xs text-muted-foreground">Current available stock</p>
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
            <CardTitle className="text-sm font-medium">Sizing Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(data.sizingAccounts)
                ? data.sizingAccounts.length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Active sizing accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="yarn-received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="yarn-received">Yarn Received</TabsTrigger>
          <TabsTrigger value="yarn-purchased">Yarn Purchased</TabsTrigger>
          <TabsTrigger value="yarn-issued">Yarn Issued</TabsTrigger>
          <TabsTrigger value="sizing-issued">Sizing Issued</TabsTrigger>
          <TabsTrigger value="sizing-received">Sizing Received</TabsTrigger>
        </TabsList>

        <TabsContent value="yarn-received">
          <Card>
            <CardHeader>
              <CardTitle>Yarn Received</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Received From</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Warp Quality</TableHead>
                    <TableHead>Warp Quantity</TableHead>
                    <TableHead>Weft Quality</TableHead>
                    <TableHead>Weft Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getYarnReceived().length > 0 ? (
                    getYarnReceived().map((yarn) => {
                      const warpQuality = Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === yarn.warp_quality_id)
                        : null;
                      const weftQuality = Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === yarn.weft_quality_id)
                        : null;
                      const location = yarn.location || Array.isArray(data.stockLocations)
                        ? data.stockLocations.find((l) => l.id === yarn.location_id)
                        : null;

                      return (
                        <TableRow key={yarn.id}>
                          <TableCell>{yarn.receive_from || "Unknown"}</TableCell>
                          <TableCell>{yarn?.contract?.id || "N/A"}</TableCell>
                          <TableCell>{location?.name || "Unknown"}</TableCell>
                          <TableCell className="font-medium">
                            {warpQuality ? `${warpQuality.count} ${warpQuality.ply} ${warpQuality.ratio}` : "N/A"}
                          </TableCell>
                          <TableCell>{yarn?.warp_bags_quantity || "0"}</TableCell>
                          <TableCell className="font-medium">
                            {weftQuality ? `${weftQuality.count} ${weftQuality.ply} ${weftQuality.ratio}` : "N/A"}
                          </TableCell>
                          <TableCell>{yarn?.weft_bags_quantity || "0"}</TableCell>
                          <TableCell>{yarn?.total_amount || "0"}</TableCell>
                          <TableCell>{yarn?.received_date || "Unknown"}</TableCell>
                          <TableCell>{yarn?.remarks || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground">
                        No yarn received records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yarn-purchased">
          <Card>
            <CardHeader>
              <CardTitle>Yarn Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Warp Quality</TableHead>
                    <TableHead>Warp Quantity</TableHead>
                    <TableHead>Weft Quality</TableHead>
                    <TableHead>Weft Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getYarnPurchased().length > 0 ? (
                    getYarnPurchased().map((yarn) => {
                      const warpQuality = Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === yarn.warp_quality_id)
                        : null;
                      const weftQuality = Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === yarn.weft_quality_id)
                        : null;
                      const location = yarn.location || Array.isArray(data.stockLocations)
                        ? data.stockLocations.find((l) => l.id === yarn.location_id)
                        : null;
                      const supplier = yarn.supplier || Array.isArray(data.suppliers)
                        ? data.suppliers.find((s) => s.id === yarn.supplier_id)
                        : null;

                      return (
                        <TableRow key={yarn.id}>
                          <TableCell>{supplier?.name || "Unknown"}</TableCell>
                          <TableCell>{location?.name || "Unknown"}</TableCell>
                          <TableCell className="font-medium">
                            {warpQuality ? `${warpQuality.count} ${warpQuality.ply} ${warpQuality.ratio}` : "N/A"}
                          </TableCell>
                          <TableCell>{yarn?.warp_bags_quantity || "0"}</TableCell>
                          <TableCell className="font-medium">
                            {weftQuality ? `${weftQuality.count} ${weftQuality.ply} ${weftQuality.ratio}` : "N/A"}                          </TableCell>
                          <TableCell>{yarn?.weft_bags_quantity || "0"}</TableCell>
                          <TableCell>{yarn?.total_amount || "0"}</TableCell>
                          <TableCell>{yarn?.received_date || "Unknown"}</TableCell>
                          <TableCell>{yarn?.remarks || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No yarn purchased records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yarn-issued">
          <Card>
            <CardHeader>
              <CardTitle>Yarn Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Warp Quality</TableHead>
                    <TableHead>Warp Quantity</TableHead>
                    <TableHead>Weft Quality</TableHead>
                    <TableHead>Weft Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getYarnIssued().length > 0 ? (
                    getYarnIssued().map((yarn) => {
                      const warpQuality = Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === yarn.warp_quality_id)
                        : null;
                      const weftQuality = Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === yarn.weft_quality_id)
                        : null;
                      const location = yarn.location || Array.isArray(data.stockLocations)
                        ? data.stockLocations.find((l) => l.id === yarn.location_id)
                        : null;

                      return (
                        <TableRow key={yarn.id}>
                          <TableCell>{yarn?.contract?.id || "N/A"}</TableCell>
                          <TableCell>{location?.name || "Unknown"}</TableCell>
                          <TableCell className="font-medium">
                            {warpQuality ? `${warpQuality.count} ${warpQuality.ply} ${warpQuality.ratio}` : "N/A"}
                          </TableCell>
                          <TableCell>{yarn?.warp_bags_quantity || "0"}</TableCell>
                          <TableCell className="font-medium">
                            {weftQuality ? `${weftQuality.count} ${weftQuality.ply} ${weftQuality.ratio}` : "N/A"}
                          </TableCell>
                          <TableCell>{yarn?.weft_bags_quantity || "0"}</TableCell>
                          <TableCell>{yarn?.total_amount || "0"}</TableCell>
                          <TableCell>{yarn?.purpose || "-"}</TableCell>
                          <TableCell>{yarn?.issued_to || "-"}</TableCell>
                          <TableCell>{yarn?.issued_date || "Unknown"}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground">
                        No yarn issued records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizing-issued">
          <Card>
            <CardHeader>
              <CardTitle>Sizing Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Sizing Account</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Yarn Count</TableHead>
                    <TableHead>Wires</TableHead>
                    <TableHead>Total Weight</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSizingIssued().length > 0 ? (
                    getSizingIssued().map((sizing) => {
                      const yarnQuality = sizing.yarn_quality || Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === sizing.yarn_count_warp)
                        : null;
                      const location = sizing.stock_location || Array.isArray(data.stockLocations)
                        ? data.stockLocations.find((l) => l.id === sizing.location_id)
                        : null;
                      const sizingAccount = sizing.sizing_account || Array.isArray(data.sizingAccounts)
                        ? data.sizingAccounts.find((s) => s.id === sizing.sizing_account_id)
                        : null;

                      return (
                        <TableRow key={sizing.id}>
                          <TableCell>{sizing?.contract?.id || "Unknown"}</TableCell>
                          <TableCell>{sizingAccount?.name || "Unknown"}</TableCell>
                          <TableCell>{location?.name || "Unknown"}</TableCell>
                          <TableCell className="font-medium">
                            {yarnQuality ? `${yarnQuality.count} ${yarnQuality.ply} ${yarnQuality.ratio}` : "Unknown"}
                          </TableCell>
                          <TableCell>{sizing?.wires || "0"}</TableCell>
                          <TableCell>{sizing?.total_weight || "0"}</TableCell>
                          <TableCell>{sizing?.rate || "0"}</TableCell>
                          <TableCell>{sizing?.amount || "0"}</TableCell>
                          <TableCell>{sizing?.remarks || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No sizing issued records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizing-received">
          <Card>
            <CardHeader>
              <CardTitle>Sizing Received</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Sizing Account</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Yarn Count</TableHead>
                    <TableHead>Wires</TableHead>
                    <TableHead>Total Weight</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSizingReceived().length > 0 ? (
                    getSizingReceived().map((sizing) => {
                      const yarnQuality = sizing.yarn_quality || Array.isArray(data.yarnQualities)
                        ? data.yarnQualities.find((q) => q.id === sizing.yarn_count_warp)
                        : null;
                      const location = sizing.stock_location || Array.isArray(data.stockLocations)
                        ? data.stockLocations.find((l) => l.id === sizing.location_id)
                        : null;
                      const sizingAccount = sizing.sizing_account || Array.isArray(data.sizingAccounts)
                        ? data.sizingAccounts.find((s) => s.id === sizing.sizing_account_id)
                        : null;

                      return (
                        <TableRow key={sizing.id}>
                          <TableCell>{sizing?.contract?.id || "Unknown"}</TableCell>
                          <TableCell>{sizingAccount?.name || "Unknown"}</TableCell>
                          <TableCell>{location?.name || "Unknown"}</TableCell>
                          <TableCell className="font-medium">
                            {yarnQuality ? `${yarnQuality.count} ${yarnQuality.ply} ${yarnQuality.ratio}` : "Unknown"}
                          </TableCell>
                          <TableCell>{sizing?.wires || "0"}</TableCell>
                          <TableCell>{sizing?.total_weight || "0"}</TableCell>
                          <TableCell>{sizing?.rate || "0"}</TableCell>
                          <TableCell>{sizing?.amount || "0"}</TableCell>
                          <TableCell>{sizing?.remarks || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No sizing received records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-hidden flex flex-col">
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
                              {contract.display_name}
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
                      <Select
                        value={formData.sizing_account_id}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            sizing_account_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sizing account" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.sizingAccounts) &&
                            data.sizingAccounts.map((account) => (
                              <SelectItem
                                key={account.id}
                                value={account.id.toString()}
                              >
                                {account.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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
                          onChange={(e) => {
                            setFormData({ ...formData, rate: e.target.value });
                            formData.amount = (parseFloat(e.target.value) * formData.total_weight).toFixed(4);
                          }}
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
                          placeholder="Amount"
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Total Section */}
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-semibold">Totals</h4>

                <div className="grid grid-cols-2 gap-4">

                  {(dialogType === "receive" || dialogType === "purchase" || dialogType === "issue") && (
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