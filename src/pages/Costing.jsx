
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageData } from '@/hooks/usePageData';

const Costing = () => {
    const { data, isLoading } = usePageData(['fabricQualities', 'yarnQualities']);
    const [inputs, setInputs] = useState({
        reed: '',
        g5: '',
        g6: '',
        warp: '',
        pick: '',
        weft: '',
        rate_per_round_wrap: '',
        rate_per_round_waft: '',
        conv_per_pick: '',
        mending_cost_per_meter: '0.20',
        conv_per_meter: '',
        processing_charges: '',
        add_rej: '',
        packing_charges: '',
        add_over: '',
        count: '',
        rate: '',
        capacity: '',
        us_per_mtr: '',
        pak_rs: '',
        finance: '',
        less_kg: '',
        less_rebate: '',
        invoice_rate: '',
        quota_per_kg: '',
        quota_per_gwidth: '',
        quota_per_gwidth_sqm: '',
        quota_per_sqm: '',
        insurance: '',
        comission: '',
        profit: '',
        less_rej_price_inch_cont: '',
        less_rej_price_inch_cont_2: '',
        sizing_rate_per_kg: '',
        fabric_required: '',
        weight_allowed: '',
        warp_poly: '',
        weft_poly: '',
        warp_cotton: '',
        weft_cotton: '',
        gwidth: ''
    });

    const handleInputChange = (key) => (event) => {
        const { value } = event.target;
        const isValid = /^(\d+(\.\d*)?|\.\d+)?$/.test(value);
        if (isValid || value === "") {
            setInputs((prevInputs) => ({
                ...prevInputs,
                [key]: value,
            }));
        }
    };

    // Calculation functions
    const calculate_weight_warp = () => {
        const reed = parseFloat(inputs.reed) || 0;
        const g5 = parseFloat(inputs.g5) || 0;
        const warp = parseFloat(inputs.warp) || 1;
        if (warp === 0) return 0;
        return (reed * g5 * 1.0936) / (warp * 800);
    };

    const calculate_weight_weft = () => {
        const pick = parseFloat(inputs.pick) || 0;
        const g5 = parseFloat(inputs.g5) || 0;
        const weft = parseFloat(inputs.weft) || 1;
        if (weft === 0) return 0;
        return (pick * g5 * 1.0936) / (weft * 800);
    };

    const total_warp_weft = () => {
        return calculate_weight_warp() + calculate_weight_weft();
    };

    const rate_per_pound_warp = () => {
        const weightWarp = calculate_weight_warp();
        const rate = parseFloat(inputs.rate_per_round_wrap) || 0;
        return weightWarp * rate;
    };

    const rate_per_pound_weft = () => {
        const weightWeft = calculate_weight_weft();
        const rate = parseFloat(inputs.rate_per_round_waft) || 0;
        return weightWeft * rate;
    };

    const total_yarn = () => {
        return rate_per_pound_warp() + rate_per_pound_weft();
    };

    const calculate_cov_per_pick = () => {
        const conv_per_pick = parseFloat(inputs.conv_per_pick) || 0;
        const pick = parseFloat(inputs.pick) || 0;
        return conv_per_pick * pick;
    };

    const calculate_average_40 = () => {
        const conv_per_meter = parseFloat(inputs.conv_per_meter) || 0;
        return conv_per_meter / 40;
    };

    const calculate_greige_cost = () => {
        return total_yarn() + calculate_average_40() + calculate_cov_per_pick();
    };

    const weight_in_kgs = () => {
        return total_warp_weft() / 2.2046;
    };

    const coverFactor = () => {
        const reed = parseFloat(inputs.reed) || 0;
        const warp = parseFloat(inputs.warp) || 0;
        const pick = parseFloat(inputs.pick) || 0;
        const weft = parseFloat(inputs.weft) || 0;

        const part1 = warp > 0 ? reed / Math.sqrt(warp) : 0;
        const part2 = weft > 0 ? pick / Math.sqrt(weft) : 0;
        return part1 + part2;
    };

    const GSM = () => {
        const weight_kgs = weight_in_kgs();
        const g5 = parseFloat(inputs.g5) || 0;
        if (g5 === 0) return 0;
        return (weight_kgs * 1000) / (g5 / 39.37);
    };

    const sq_yard = () => {
        const gsm = GSM();
        return gsm / 28.3 / 1.196;
    };

    const threads_grey = () => {
        const pick = parseFloat(inputs.pick) || 0;
        const reed = parseFloat(inputs.reed) || 0;
        return reed + pick;
    };

    const threads_fabric = () => {
        const pick = parseFloat(inputs.pick) || 0;
        const reed = parseFloat(inputs.reed) || 0;
        const g5 = parseFloat(inputs.g5) || 0;
        const g6 = parseFloat(inputs.g6) || 1;
        if (g6 === 0) return 0;
        return (reed + pick) * g5 / g6;
    };

    const process_charges = () => {
        const charges = parseFloat(inputs.processing_charges) || 0;
        const g6 = parseFloat(inputs.g6) || 0;
        return g6 * charges;
    };

    const calculate_net_fabric = () => {
        return calculate_greige_cost() + process_charges() + 0.27;
    };

    const calculate_reg = () => {
        const net_fabric = calculate_net_fabric();
        const rej = parseFloat(inputs.add_rej) || 0;
        return net_fabric * (rej / 100);
    };

    const calculate_packing_charges = () => {
        const charges_per_roll = parseFloat(inputs.packing_charges) || 0;
        if (charges_per_roll === 0) return 0;
        return 125 / charges_per_roll;
    };

    const calculate_factory_cost = () => {
        return calculate_net_fabric() + calculate_reg() + calculate_packing_charges();
    };

    const calculate_heads = () => {
        const net_fabric = calculate_net_fabric();
        const heads = parseFloat(inputs.add_over) || 0;
        return net_fabric * (heads / 100);
    };

    const calculate_total = () => {
        return calculate_factory_cost() + calculate_heads();
    };

    const calculate_sea_fri = () => {
        const rate = parseFloat(inputs.rate) || 0;
        const capacity = parseFloat(inputs.capacity) || 1;
        const use_mtr = parseFloat(inputs.us_per_mtr) || 0;
        return (rate * (use_mtr + 3)) / capacity;
    };

    const calculate_pkr = () => {
        const pkr = parseFloat(inputs.pak_rs) || 0;
        const capacity = parseFloat(inputs.capacity) || 1;
        return pkr / capacity;
    };

    const calculate_admin_charges = () => {
        const total = calculate_total();
        const finance = parseFloat(inputs.finance) || 0;
        return (total / 100) * finance;
    };

    const sub_total = () => {
        return calculate_total() + calculate_sea_fri() + calculate_pkr() + calculate_admin_charges();
    };

    const less_rebate_per_kg = () => {
        const less_per_kg = parseFloat(inputs.less_kg) || 0;
        const weight_kg = weight_in_kgs();
        return weight_kg * less_per_kg;
    };

    const callculate_less_rebate = () => {
        const less_rebate = parseFloat(inputs.less_rebate) || 0;
        const subTotal = sub_total();
        return (subTotal * less_rebate) * 0.8;
    };

    const callculate_invoice = () => {
        const total = total_yarn();
        const invoiceDecimal = parseFloat(inputs.invoice_rate) || 0;
        return (total * 0.15) * (invoiceDecimal / 100);
    };

    const calculate_reg_price = () => {
        const sqm = parseFloat(inputs.less_rej_price_inch_cont) || 0;
        const G6 = parseFloat(inputs.g6) || 0;
        return sqm * G6;
    };

    const calculate_reg_price_2 = () => {
        const sqm = parseFloat(inputs.less_rej_price_inch_cont_2) || 0;
        const G6 = parseFloat(inputs.g6) || 0;
        return sqm * G6;
    };

    const calculate_quota_kg_sqm = () => {
        const sqm = parseFloat(inputs.quota_per_sqm) || 0;
        const g6 = parseFloat(inputs.g6) || 0;
        return (g6 / 39.37) * sqm;
    };

    const total_rebates = () => {
        const sub = sub_total();
        const total = less_rebate_per_kg();
        const sea = callculate_less_rebate();
        const pkr = callculate_invoice();
        const reg = calculate_reg_price();
        const reg2 = calculate_reg_price_2();
        const sqm = calculate_quota_kg_sqm();
        return (sub - total - sea - pkr - reg - reg2) + sqm;
    };

    const calculate_insurance = () => {
        const total = total_rebates();
        const insurance = parseFloat(inputs.insurance) || 0;
        return total * (insurance / 100);
    };

    const calculate_commission = () => {
        const total = total_rebates();
        const commission = parseFloat(inputs.comission) || 0;
        return total * (commission / 100);
    };

    const calculate_profit = () => {
        const total = sub_total();
        const profit = parseFloat(inputs.profit) || 0;
        return total * (profit / 100);
    };

    const calculate_fobValue_pkr = () => {
        return calculate_profit() + total_rebates() + calculate_commission() + calculate_insurance();
    };

    const calculate_fobValue = () => {
        return calculate_fobValue_pkr() - calculate_sea_fri();
    };

    const cf_value_us = () => {
        const total = calculate_fobValue_pkr();
        const profit = parseFloat(inputs.us_per_mtr) || 1;
        return total / profit;
    };

    const cf_value_us_yard = () => {
        return cf_value_us() / 1.0936;
    };

    // Right sidebar calculations
    const calculate_Weight_per_kg = () => {
        return calculate_weight_warp() / 2.2046;
    };

    const calculate_sizing_rate_per_pick = () => {
        const weight_warp_sizing = calculate_Weight_per_kg();
        const pick = parseFloat(inputs.pick) || 1;
        const sizing_rate = parseFloat(inputs.sizing_rate_per_kg) || 0;
        return (weight_warp_sizing * sizing_rate) / pick;
    };

    const weight_formula_warp = () => {
        const warp = parseFloat(inputs.warp) || 1;
        const reed = parseFloat(inputs.reed) || 0;
        return (reed * 25) / warp;
    };

    const weight_formula_weft = () => {
        const pick = parseFloat(inputs.pick) || 0;
        const weft = parseFloat(inputs.weft) || 1;
        return (pick * 25) / weft;
    };

    const weight_sum_warp_weft = () => {
        return weight_formula_warp() + weight_formula_weft();
    };

    const calculate_fabric_warp = () => {
        const warp = calculate_weight_warp();
        const fabric = parseFloat(inputs.fabric_required) || 0;
        return (warp * fabric) / 100;
    };

    const calculate_fabric_weft = () => {
        const weft = calculate_weight_weft();
        const fabric = parseFloat(inputs.fabric_required) || 0;
        return (weft * fabric) / 100;
    };

    const calculate_yarn_sum = () => {
        return calculate_fabric_warp() + calculate_fabric_weft();
    };

    const calculate_invest_yarn = () => {
        const warp = calculate_fabric_warp();
        const rate_per_pound = parseFloat(inputs.rate_per_round_wrap) || 0;
        return warp * rate_per_pound * 100;
    };

    const calculate_invest_weft = () => {
        const weft = calculate_fabric_weft();
        const rate_per_pound = parseFloat(inputs.rate_per_round_waft) || 0;
        return weft * rate_per_pound * 100;
    };

    const calculate_invest_weft_warp = () => {
        return calculate_invest_yarn() + calculate_invest_weft();
    };

    const calculate_invest_conversion = () => {
        const per_pick = calculate_cov_per_pick();
        const fabric = parseFloat(inputs.fabric_required) || 0;
        return per_pick * fabric;
    };

    const calculate_invest_fabric = () => {
        const per_pick = calculate_greige_cost();
        const fabric = parseFloat(inputs.fabric_required) || 0;
        return per_pick * fabric;
    };

    const calculate_weight_fabric = () => {
        const total = total_warp_weft();
        return total / 2.2046;
    };

    const calculate_weight_ship = () => {
        const weight = calculate_weight_fabric() || 1;
        const fabric = parseFloat(inputs.weight_allowed) || 0;
        return fabric / weight;
    };

    const calculate_poly = () => {
        const warp = calculate_weight_warp();
        const weft = calculate_weight_weft();
        const total = total_warp_weft() || 1;
        const warp_poly = parseFloat(inputs.warp_poly) || 0;
        const weft_poly = parseFloat(inputs.weft_poly) || 0;
        return ((warp * warp_poly) + (weft * weft_poly)) / total;
    };

    const calculate_cotton = () => {
        const warp = calculate_weight_warp();
        const weft = calculate_weight_weft();
        const total = total_warp_weft() || 1;
        const warp_cotton = parseFloat(inputs.warp_cotton) || 0;
        const weft_cotton = parseFloat(inputs.weft_cotton) || 0;
        return ((warp * warp_cotton) + (weft * weft_cotton)) / total;
    };

    const handleSave = () => {
        localStorage.setItem('exportFabricData', JSON.stringify(inputs));
        alert('Costing data saved successfully!');
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto">
                <Skeleton className="h-12 w-1/3 mb-4" />
                <Skeleton className="h-8 w-2/3 mb-8" />
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="grid grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
            <div className="col-span-2">
                <Card>
                    <CardHeader className="bg-blue-600 text-white text-center">
                        <CardTitle className="text-xl">Export Fabric Cost Sheet</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Basic Info Section */}
                        <div className="grid grid-cols-3 gap-4 text-sm font-semibold">
                            <div>Party</div>
                            <div>Port</div>
                            <div>Process</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm font-semibold">
                            <div>Payment Terms</div>
                            <div>Loom</div>
                            <div>Blend</div>
                        </div>

                        {/* Main Input Grid */}
                        <div className="grid grid-cols-6 gap-4 text-center">
                            <div>
                                <Label className="text-sm font-medium">REED</Label>
                                <Input
                                    type="text"
                                    value={inputs.reed}
                                    onChange={handleInputChange('reed')}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">PICK</Label>
                                <Input
                                    type="text"
                                    value={inputs.pick}
                                    onChange={handleInputChange('pick')}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">WARP</Label>
                                <Input
                                    type="text"
                                    value={inputs.warp}
                                    onChange={handleInputChange('warp')}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">WEFT</Label>
                                <Input
                                    type="text"
                                    value={inputs.weft}
                                    onChange={handleInputChange('weft')}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">G-Width</Label>
                                <Input
                                    type="text"
                                    value={inputs.gwidth}
                                    onChange={handleInputChange('gwidth')}
                                    className="mt-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    value={inputs.g5}
                                    onChange={handleInputChange('g5')}
                                />
                                <Input
                                    type="text"
                                    value={inputs.g6}
                                    onChange={handleInputChange('g6')}
                                />
                            </div>
                        </div>

                        {/* Weight Calculations */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span>Weight Warp</span>
                                <span className="font-medium">{calculate_weight_warp().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Weight Weft</span>
                                <span className="font-medium">{calculate_weight_weft().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2 font-semibold">
                                <span>Total</span>
                                <span>{total_warp_weft().toFixed(3)}</span>
                            </div>
                        </div>

                        {/* Rate Per Pound Section */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Rate Per Pound Warp</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.rate_per_round_wrap}
                                        onChange={handleInputChange('rate_per_round_wrap')}
                                    />
                                </div>
                                <span className="text-right">{rate_per_pound_warp().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Rate Per Pound Weft</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.rate_per_round_waft}
                                        onChange={handleInputChange('rate_per_round_waft')}
                                    />
                                </div>
                                <span className="text-right">{rate_per_pound_weft().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center font-semibold">
                                <span>Total Yarn Cost</span>
                                <span>{total_yarn().toFixed(3)}</span>
                            </div>
                        </div>

                        {/* Conversion Section */}
                        <div className="space-y-4 border-b pb-4">
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Conversion per pick</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.conv_per_pick}
                                        onChange={handleInputChange('conv_per_pick')}
                                    />
                                </div>
                                <span className="text-right">{calculate_cov_per_pick().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Mending Cost 0.20/ per meter</span>
                                <Input
                                    type="text"
                                    value={inputs.mending_cost_per_meter}
                                    onChange={handleInputChange('mending_cost_per_meter')}
                                    className="w-24"
                                />
                            </div>
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Conversion per 40 meters</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.conv_per_meter}
                                        onChange={handleInputChange('conv_per_meter')}
                                    />
                                </div>
                                <span className="text-right">{calculate_average_40().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center font-semibold">
                                <span>Greige Cost</span>
                                <span>{calculate_greige_cost().toFixed(3)}</span>
                            </div>
                        </div>

                        {/* Fabric Properties */}
                        <div className="space-y-2 border-b pb-4">
                            <div className="flex justify-between">
                                <span>Weight in KGS Per SQM</span>
                                <span>{weight_in_kgs().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cover Factor</span>
                                <span>{coverFactor().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>GSM</span>
                                <span>{GSM().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>OZ/SQ Yard</span>
                                <span>{sq_yard().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Threads per inch of grey</span>
                                <span>{threads_grey().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Threads per inch of finished fabrics</span>
                                <span>{threads_fabric().toFixed(3)}</span>
                            </div>
                        </div>

                        {/* Processing and Costs */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Processing charges:</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.processing_charges}
                                        onChange={handleInputChange('processing_charges')}
                                    />
                                </div>
                                <span className="text-right">{process_charges().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Net fabric cost</span>
                                <span>{calculate_net_fabric().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Add Rej. %</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.add_rej}
                                        onChange={handleInputChange('add_rej')}
                                    />
                                </div>
                                <span className="text-right">{calculate_reg().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Packing Charges per roll</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.packing_charges}
                                        onChange={handleInputChange('packing_charges')}
                                    />
                                </div>
                                <span className="text-right">{calculate_packing_charges().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total Factory Cost</span>
                                <span>{calculate_factory_cost().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2">Add Over Heads %</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.add_over}
                                        onChange={handleInputChange('add_over')}
                                    />
                                </div>
                                <span className="text-right">{calculate_heads().toFixed(3)}</span>
                            </div>
                            <div className="text-right font-semibold text-lg">
                                {calculate_total().toFixed(3)}
                            </div>
                        </div>

                        {/* Freight and Charges */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-6 gap-2 font-semibold text-sm">
                                <span></span>
                                <span>Cont.</span>
                                <span>Rate US $</span>
                                <span>Capacity</span>
                                <span>Pak Rs.</span>
                                <span></span>
                            </div>
                            <div className="grid grid-cols-6 gap-2 items-center text-sm">
                                <span>Sea Freight / Mtr</span>
                                <Input
                                    type="text"
                                    value={inputs.count}
                                    onChange={handleInputChange('count')}
                                    className="h-8"
                                />
                                <Input
                                    type="text"
                                    value={inputs.rate}
                                    onChange={handleInputChange('rate')}
                                    className="h-8"
                                />
                                <Input
                                    type="text"
                                    value={inputs.capacity}
                                    onChange={handleInputChange('capacity')}
                                    className="h-8"
                                />
                                <span></span>
                                <span className="text-right">{calculate_sea_fri().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-2 items-center text-sm">
                                <span className="col-span-2">Clearing and fwd/inland freight</span>
                                <span></span>
                                <span></span>
                                <Input
                                    type="text"
                                    value={inputs.pak_rs}
                                    onChange={handleInputChange('pak_rs')}
                                    className="h-8"
                                />
                                <span className="text-right">{calculate_pkr().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-6 gap-2 items-center text-sm">
                                <span className="col-span-2">Admin & Finance charges</span>
                                <span></span>
                                <Input
                                    type="text"
                                    value={inputs.finance}
                                    onChange={handleInputChange('finance')}
                                    className="h-8"
                                />
                                <span></span>
                                <span className="text-right">{calculate_admin_charges().toFixed(3)}</span>
                            </div>
                        </div>

                        {/* Sub Total and Rebates */}
                        <div className="space-y-4">
                            <div className="flex justify-between font-semibold border-y py-2">
                                <span>SUB TOTAL</span>
                                <span>{sub_total().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Less Rebate @ …… per Kgs</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.less_kg}
                                        onChange={handleInputChange('less_kg')}
                                    />
                                </div>
                                <span className="text-right">{less_rebate_per_kg().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Less Rebate @ ……%</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.less_rebate}
                                        onChange={handleInputChange('less_rebate')}
                                    />
                                </div>
                                <span className="text-right">{callculate_less_rebate().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Less Sale tax Rebate (invoice rate)</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.invoice_rate}
                                        onChange={handleInputChange('invoice_rate')}
                                    />
                                </div>
                                <span className="text-right">{callculate_invoice().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="font-semibold">Less Rej. Price @…per inch</span>
                                <Input
                                    type="text"
                                    value={inputs.less_rej_price_inch_cont}
                                    onChange={handleInputChange('less_rej_price_inch_cont')}
                                />
                                <div className="col-span-4 text-right">{calculate_reg_price().toFixed(3)}</div>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="font-semibold">Less Rej. Price @…per inch</span>
                                <Input
                                    type="text"
                                    value={inputs.less_rej_price_inch_cont_2}
                                    onChange={handleInputChange('less_rej_price_inch_cont_2')}
                                />
                                <div className="col-span-4 text-right font-semibold">{calculate_reg_price_2().toFixed(3)}</div>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Add Quota per k.g</span>
                                <div className="col-start-3">
                                    <Input
                                        type="text"
                                        value={inputs.quota_per_kg}
                                        onChange={handleInputChange('quota_per_kg')}
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={inputs.quota_per_gwidth}
                                    onChange={handleInputChange('quota_per_gwidth')}
                                />
                                <span className="text-right">{((parseFloat(inputs.quota_per_kg) || 0) * total_warp_weft() / (parseFloat(inputs.quota_per_gwidth) || 1)).toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Add Quota per SQM</span>
                                <div className="col-start-3">
                                    <Input
                                        type="text"
                                        value={inputs.quota_per_sqm}
                                        onChange={handleInputChange('quota_per_sqm')}
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={inputs.quota_per_gwidth_sqm}
                                    onChange={handleInputChange('quota_per_gwidth_sqm')}
                                />
                                <span className="text-right">{calculate_quota_kg_sqm().toFixed(3)}</span>
                            </div>
                            
                            <div className="flex justify-between font-semibold border-y py-2">
                                <span>Total</span>
                                <span>{total_rebates().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Insurance</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.insurance}
                                        onChange={handleInputChange('insurance')}
                                    />
                                </div>
                                <span className="text-right">{calculate_insurance().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Commission</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.comission}
                                        onChange={handleInputChange('comission')}
                                    />
                                </div>
                                <span className="text-right">{calculate_commission().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">Profit</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.profit}
                                        onChange={handleInputChange('profit')}
                                    />
                                </div>
                                <span className="text-right">{calculate_profit().toFixed(3)}</span>
                            </div>
                            
                            <div className="flex justify-between font-semibold">
                                <span>FOB VALUE</span>
                                <span>{calculate_fobValue().toFixed(3)}</span>
                            </div>
                            
                            <div className="flex justify-between font-semibold border-y py-2">
                                <span>FOB VALUE IN PAK Rs.</span>
                                <span>{calculate_fobValue_pkr().toFixed(3)}</span>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <span className="col-span-2 font-semibold">C&F VALUE IN US $ PER MTR</span>
                                <div className="col-start-4">
                                    <Input
                                        type="text"
                                        value={inputs.us_per_mtr}
                                        onChange={handleInputChange('us_per_mtr')}
                                    />
                                </div>
                                <span className="text-right">{cf_value_us().toFixed(3)}</span>
                            </div>
                            
                            <div className="flex justify-between font-semibold">
                                <span>C&F VALUE IN US $ PER YARD</span>
                                <span>{cf_value_us_yard().toFixed(3)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                    <Button variant="outline" className="flex-1">
                        History
                    </Button>
                </div>

                <div className="max-h-[76vh] overflow-y-auto space-y-4">
                    {/* Sizing Cost */}
                    <Card>
                        <CardHeader className="bg-blue-600 text-white text-center py-3">
                            <CardTitle className="text-lg">Sizing Cost</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Weight per meter in KG</span>
                                <span>{calculate_Weight_per_kg().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 items-center text-sm">
                                <span className="col-span-3 font-semibold">Sizing Rate per Kg</span>
                                <Input
                                    type="text"
                                    value={inputs.sizing_rate_per_kg}
                                    onChange={handleInputChange('sizing_rate_per_kg')}
                                    className="h-8"
                                />
                            </div>
                            <div className="flex justify-between font-semibold text-sm">
                                <span>Sizing Rate per pick</span>
                                <span>{calculate_sizing_rate_per_pick().toFixed(3)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weight Formula */}
                    <Card>
                        <CardHeader className="bg-blue-600 text-white text-center py-3">
                            <CardTitle className="text-lg">Weight Formula</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Warp</span>
                                <span>{weight_formula_warp().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Weft</span>
                                <span>{weight_formula_weft().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Total GSM</span>
                                <span>{weight_sum_warp_weft().toFixed(3)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Yarn Calculation */}
                    <Card>
                        <CardHeader className="bg-blue-600 text-white text-center py-3">
                            <CardTitle className="text-lg">Yarn Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="grid grid-cols-4 gap-2 items-center text-sm">
                                <span className="col-span-3">Fabric Required</span>
                                <Input
                                    type="text"
                                    value={inputs.fabric_required}
                                    onChange={handleInputChange('fabric_required')}
                                    className="h-8"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span>Warp</span>
                                <span></span>
                                <span className="text-right">{calculate_fabric_warp().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span>Weft</span>
                                <span></span>
                                <span className="text-right">{calculate_fabric_weft().toFixed(3)}</span>
                            </div>
                            <div className="text-right font-semibold">
                                {calculate_yarn_sum().toFixed(3)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Investment Required */}
                    <Card>
                        <CardHeader className="bg-blue-600 text-white text-center py-3">
                            <CardTitle className="text-lg">Investment Required</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
                                <span></span>
                                <span>Warp</span>
                                <span>Weft</span>
                                <span>Total</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                                <span>Yarn</span>
                                <span>{calculate_invest_yarn().toFixed(3)}</span>
                                <span>{calculate_invest_weft().toFixed(3)}</span>
                                <span>{calculate_invest_weft_warp().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                                <span>Conversion</span>
                                <span></span>
                                <span></span>
                                <span>{calculate_invest_conversion().toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                                <span>Fabric</span>
                                <span></span>
                                <span></span>
                                <span>{calculate_invest_fabric().toFixed(3)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Blending Calculation */}
                    <Card>
                        <CardHeader className="bg-blue-600 text-white text-center py-3">
                            <CardTitle className="text-lg">Blending Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                                <span></span>
                                <span>Poly</span>
                                <span>Cotton</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span>Warp</span>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={inputs.warp_poly}
                                        onChange={handleInputChange('warp_poly')}
                                        className="h-8 text-xs"
                                    />
                                    <span>%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={inputs.warp_cotton}
                                        onChange={handleInputChange('warp_cotton')}
                                        className="h-8 text-xs"
                                    />
                                    <span>%</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span>Weft</span>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={inputs.weft_poly}
                                        onChange={handleInputChange('weft_poly')}
                                        className="h-8 text-xs"
                                    />
                                    <span>%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={inputs.weft_cotton}
                                        onChange={handleInputChange('weft_cotton')}
                                        className="h-8 text-xs"
                                    />
                                    <span>%</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span>Fabric</span>
                                <span>{calculate_poly().toFixed(3)}%</span>
                                <span>{calculate_cotton().toFixed(3)}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Freight Calculation */}
                    <Card>
                        <CardHeader className="bg-blue-600 text-white text-center py-3">
                            <CardTitle className="text-lg">Freight Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="grid grid-cols-4 gap-2 items-center text-sm">
                                <span className="col-span-3">Weight Allowed</span>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="text"
                                        value={inputs.weight_allowed}
                                        onChange={handleInputChange('weight_allowed')}
                                        className="h-8 text-xs"
                                    />
                                    <span>kg</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Fabric Weight</span>
                                <span>{calculate_weight_fabric().toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Shipment allowed</span>
                                <span>{calculate_weight_ship().toFixed(3)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default Costing;
