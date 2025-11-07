"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Trash2,
    Edit,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Users,
    MoreVertical,
    ArrowLeft,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar
} from "lucide-react";
import adminService, { UserManagement } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

export default function AdminUsersPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

    const [users, setUsers] = useState<UserManagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<string>('');
    const [stats, setStats] = useState({
        total: 0,
        senders: 0,
        carriers: 0,
        brokers: 0,
        verified: 0
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    useEffect(() => {
        calculateStats();
    }, [users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const roleParam = roleFilter === 'ALL' ? '' : roleFilter;
            const response = await adminService.searchUsers(search, roleParam, undefined, page, 10);
            setUsers(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        setStats({
            total: totalElements,
            senders: users.filter(u => u.role === 'SENDER').length,
            carriers: users.filter(u => u.role === 'CARRIER').length,
            brokers: users.filter(u => u.role === 'BROKER').length,
            verified: users.filter(u => u.emailVerified).length,
        });
    };

    const handleSearch = () => {
        setPage(0);
        fetchUsers();
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            await adminService.deleteUser(selectedUser.id);
            toast({
                title: "Success",
                description: "User deleted successfully"
            });
            setDeleteDialogOpen(false);
            fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive"
            });
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            await adminService.updateUserRole(selectedUser.id, newRole);
            toast({
                title: "Success",
                description: "User role updated successfully"
            });
            setEditDialogOpen(false);
            fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive"
            });
        }
    };

    const handleToggleActive = async (userId: string) => {
        try {
            await adminService.toggleUserActive(userId);
            toast({
                title: "Success",
                description: "User status updated successfully"
            });
            fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user status",
                variant: "destructive"
            });
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800';
            case 'SENDER':
                return 'bg-blue-100 text-blue-800';
            case 'CARRIER':
                return 'bg-green-100 text-green-800';
            case 'BROKER':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (authLoading || loading) {
        return (
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/dashboard/admin')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <Users className="h-8 w-8 text-green-600" />
                                    User Management
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage all users, roles, and permissions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Senders</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.senders}</p>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">SENDER</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Carriers</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.carriers}</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">CARRIER</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Brokers</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.brokers}</p>
                                    </div>
                                    <Badge className="bg-purple-100 text-purple-800">BROKER</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Verified</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                                    </div>
                                    <UserCheck className="h-8 w-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                Search, filter, and manage user accounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filters */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        placeholder="Search by name, email, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSearch} variant="default">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Roles</SelectItem>
                                        <SelectItem value="SENDER">Sender</SelectItem>
                                        <SelectItem value="CARRIER">Carrier</SelectItem>
                                        <SelectItem value="BROKER">Broker</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Users Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Activity</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                                <span className="text-green-700 font-semibold">
                                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {user.firstName} {user.lastName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Mail className="h-3 w-3 text-gray-400" />
                                                                {user.email}
                                                            </div>
                                                            {user.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                                    {user.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getRoleBadgeColor(user.role)}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {user.emailVerified ? (
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-orange-100 text-orange-800">
                                                                    <UserX className="h-3 w-3 mr-1" />
                                                                    Unverified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-600">
                                                            <div>{user.totalLoads} loads</div>
                                                            <div>{user.totalOffers} offers</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(user.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setNewRole(user.role);
                                                                        setEditDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Change Role
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleToggleActive(user.id)}
                                                                >
                                                                    {user.active ? (
                                                                        <>
                                                                            <UserX className="h-4 w-4 mr-2" />
                                                                            Deactivate
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <UserCheck className="h-4 w-4 mr-2" />
                                                                            Activate
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6">
                                <div className="text-sm text-gray-600">
                                    Showing {page * 10 + 1} to {Math.min((page + 1) * 10, totalElements)} of {totalElements} users
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded">
                                        <span className="text-sm">Page {page + 1} of {totalPages}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
                                This action cannot be undone and will permanently remove:
                            </DialogDescription>
                        </DialogHeader>
                        <div className="my-4 p-4 bg-red-50 rounded-lg space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                User account and profile
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                All associated loads ({selectedUser?.totalLoads})
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                All associated offers ({selectedUser?.totalOffers})
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteUser}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Permanently
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Role Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update User Role</DialogTitle>
                            <DialogDescription>
                                Change the role for {selectedUser?.firstName} {selectedUser?.lastName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-900">
                                    Current Role: <span className="font-semibold">{selectedUser?.role}</span>
                                </p>
                            </div>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SENDER">Sender</SelectItem>
                                    <SelectItem value="CARRIER">Carrier</SelectItem>
                                    <SelectItem value="BROKER">Broker</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p className="font-medium">Role Permissions:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    {newRole === 'SENDER' && (
                                        <>
                                            <li>Create and manage loads</li>
                                            <li>View and accept offers</li>
                                            <li>Track shipments</li>
                                        </>
                                    )}
                                    {newRole === 'CARRIER' && (
                                        <>
                                            <li>View available loads</li>
                                            <li>Submit offers</li>
                                            <li>Manage accepted shipments</li>
                                        </>
                                    )}
                                    {newRole === 'BROKER' && (
                                        <>
                                            <li>Full access to loads and offers</li>
                                            <li>Facilitate transactions</li>
                                            <li>Advanced reporting</li>
                                        </>
                                    )}
                                    {newRole === 'ADMIN' && (
                                        <>
                                            <li>Full system access</li>
                                            <li>User management</li>
                                            <li>System configuration</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateRole}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update Role
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
