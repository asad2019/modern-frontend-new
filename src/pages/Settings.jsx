
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon, Info, Database, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Settings = () => {
  const { data, updateSettings, resetData, fetchDataByKey, loadingStates } = useData();
  const { toast } = useToast();
  const [settings, setSettings] = useState(data.settings);

  useEffect(() => {
    fetchDataByKey('settings');
  }, [fetchDataByKey]);

  useEffect(() => {
    if (data.settings) {
      setSettings(data.settings);
    }
  }, [data.settings]);
  
  const isLoading = loadingStates.settings !== false;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  };

  const handleResetData = () => {
    resetData();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings.</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Info className="mr-2 h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="data"><Database className="mr-2 h-4 w-4" />Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company's details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={settings?.companyName || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={settings?.address || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input id="taxId" value={settings?.taxId || ''} onChange={handleInputChange} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage application data. These actions are irreversible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-destructive">
                <CardHeader className="flex-row items-center space-x-4 space-y-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <div>
                    <CardTitle>Reset Application Data</CardTitle>
                    <CardDescription>This will reset all data to the initial demo state (requires backend action).</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Reset Data</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action requires a corresponding reset on the backend. Pressing 'Yes' will refetch all data from the server.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetData}>Yes, reset data</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Settings;
