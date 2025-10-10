"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trash2, Edit, Loader2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import adminService, { LoadManagement } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function LoadManagementTab() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loads, setLoads] = useState<LoadManagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedLoad, setSelectedLoad] = useState<LoadManagement | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    useEffect(() => {
        fetchLoads();
    }, [page, statusFilter]);

    const fetchLoads = async () => {
        setLoading(true);
        try {
            const statusParam = statusFilter === 'ALL' ? '' : statusFilter;
            const response = await adminService.searchLoads(search, statusParam, undefined, page, 10);
            setLoads(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch loads",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchLoads();
    };

    const handleDeleteLoad = async () => {
        if (!selectedLoad) return;

        try {
            await adminService.deleteLoad(selectedLoad.id);
            toast({
                title: "Success",
                description: "Load deleted successfully"
            });
            setDeleteDialogOpen(false);
            fetchLoads();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete load",
                variant: "destructive"
            });
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedLoad || !newStatus) return;

        try {
            await adminService.updateLoadStatus(selectedLoad.id, newStatus);
            toast({
                title: "Success",
                description: "Load status updated successfully"
            });
            setEditDialogOpen(false);
            fetchLoads();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update load status",
                variant: "destructive"
            });
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-orange-100 text-orange-800';
            case 'ACTIVE':
                return 'bg-blue-100 text-blue-800';
            case 'ASSIGNED':
                return 'bg-purple-100 text-purple-800';
            case 'IN_TRANSIT':
                return 'bg-indigo-100 text-indigo-800';
            case 'DELIVERED':
                return 'bg-teal-100 text-teal-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t("adminPage.loadManagement")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="Search by goods type or address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="ASSIGNED">Assigned</SelectItem>
                            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sender</TableHead>
                                        <TableHead>Goods Type</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Weight (kg)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Offers</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loads.map((load) => (
                                        <TableRow key={load.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{load.senderName}</div>
                                                    <div className="text-xs text-gray-500">{load.senderEmail}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{load.goodsType}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{load.loadingCity}</div>
                                                    <div className="text-gray-500">→ {load.deliveryCity}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{load.weight.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(load.status)}>
                                                    {load.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{load.offersCount} offers</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(load.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLoad(load);
                                                            setNewStatus(load.status);
                                                            setEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLoad(load);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-600">
                                Page {page + 1} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Load</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this load? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteLoad}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Status Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Load Status</DialogTitle>
                        <DialogDescription>
                            Change the status for this load
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStatus}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
