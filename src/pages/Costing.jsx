
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Costing = () => {
    const { data, fetchDataByKey, loadingStates } = useData();
    const [selectedFabric, setSelectedFabric] = useState('');
    const [requiredMeters, setRequiredMeters] = useState(1000);
    const [cost, setCost] = useState(null);

    useEffect(() => {
        fetchDataByKey('fabricQualities');
        fetchDataByKey('yarnQualities');
    }, [fetchDataByKey]);

    const isLoading = loadingStates.fabricQualities !== false || loadingStates.yarnQualities !== false;

    const calculation = useMemo(() => {
        if (!selectedFabric || !requiredMeters || isLoading) return null;

        const fabric = data.fabricQualities.find(f => f.id === selectedFabric);
        if (!fabric) return null;
        
        const warpYarn = data.yarnQualities.find(y => y.id === fabric.warp);
        const weftYarn = data.yarnQualities.find(y => y.id === fabric.weft);

        const warpConsumption = (parseInt(fabric.reed) * 0.05).toFixed(2);
        const weftConsumption = (parseInt(fabric.pick) * 0.04).toFixed(2);
        const totalYarnKg = ((parseFloat(warpConsumption) + parseFloat(weftConsumption)) * requiredMeters / 100).toFixed(2);
        const requiredBags = Math.ceil(totalYarnKg / 45.36);
        const estimatedCost = (totalYarnKg * 5.5).toFixed(2);

        return {
            warpYarn: warpYarn?.count,
            weftYarn: weftYarn?.count,
            totalYarnKg,
            requiredBags,
            estimatedCost,
        };
    }, [selectedFabric, requiredMeters, data, isLoading]);

    const handleCalculate = () => {
        setCost(calculation);
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <Skeleton className="h-12 w-1/3 mb-4" />
                <Skeleton className="h-8 w-2/3 mb-8" />
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Fabric Costing Calculator</CardTitle>
                    <CardDescription>Estimate the cost and materials required for a production run.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="fabricQuality">Fabric Quality</Label>
                            <Select onValueChange={setSelectedFabric} value={selectedFabric}>
                                <SelectTrigger><SelectValue placeholder="Select a fabric quality" /></SelectTrigger>
                                <SelectContent>
                                    {data.fabricQualities.map(fq => <SelectItem key={fq.id} value={fq.id}>{fq.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="requiredMeters">Required Fabric (Meters)</Label>
                            <Input id="requiredMeters" type="number" value={requiredMeters} onChange={e => setRequiredMeters(e.target.value)} />
                        </div>
                        <Button onClick={handleCalculate} className="w-full">
                            <Zap className="mr-2 h-4 w-4" /> Calculate
                        </Button>
                    </div>
                    {cost && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-muted p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold">Costing Estimate</h3>
                            <div className="flex justify-between"><span>Warp Yarn:</span> <strong>{cost.warpYarn}</strong></div>
                            <div className="flex justify-between"><span>Weft Yarn:</span> <strong>{cost.weftYarn}</strong></div>
                            <div className="flex justify-between"><span>Total Yarn Required:</span> <strong>{cost.totalYarnKg} kg</strong></div>
                            <div className="flex justify-between"><span>Required Bags (approx.):</span> <strong>{cost.requiredBags}</strong></div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between text-xl font-bold text-primary">
                                <span>Estimated Cost:</span>
                                <span>${cost.estimatedCost}</span>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Costing;
