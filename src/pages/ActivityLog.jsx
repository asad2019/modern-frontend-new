
import React from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollText } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const ActivityLog = () => {
    const { data, isLoading } = usePageData(['activityLog', 'users']);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    }
    
    const logs = (data?.activityLog && Array.isArray(data.activityLog)) ? data.activityLog : [];
    const users = (data?.users && Array.isArray(data.users)) ? data.users : [];

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'System';
    }

    if (isLoading) {
        return <PageLoader type="table" />
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><ScrollText className="mr-2 h-6 w-6" /> Activity Logs</CardTitle>
                    <CardDescription>A record of all actions performed in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-muted-foreground">{formatTimestamp(log.timestamp)}</TableCell>
                                    <TableCell className="font-medium">{getUserName(log.user_id)}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ActivityLog;
