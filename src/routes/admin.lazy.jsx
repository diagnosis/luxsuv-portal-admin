import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { checkAuth } from '../api/auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUserRole, deleteUser, getUserByEmail } from '../api/admin.js';
import Navbar from '../components/Navbar.jsx';
import { useState } from 'react';

export const Route = createLazyFileRoute('/admin')({
    beforeLoad: async ({ location }) => {
        console.log('Admin beforeLoad - checking auth...');
        try {
            const userData = await checkAuth();
            
            // Check if user is admin
            if (userData?.role !== 'admin' && !userData?.is_admin) {
                throw new Error('Admin access required');
            }
            
            return userData;
        } catch (error) {
            console.log('Auth failed:', error.message);
            throw redirect({ 
                to: '/login',
                search: {
                    redirect: location.href,
                }
            });
        }
    },
    component: AdminPage,
});

function AdminPage() {
    const userData = Route.useRouteContext();
    const queryClient = useQueryClient();
    const [selectedTab, setSelectedTab] = useState('users');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const roles = [
        { value: 'rider', label: 'Rider', description: 'Standard user - can book rides' },
        { value: 'driver', label: 'Driver', description: 'Vehicle operator - can accept assigned bookings' },
        { value: 'super_driver', label: 'Super Driver', description: 'Senior driver - can manage bookings and assign to other drivers' },
        { value: 'dispatcher', label: 'Dispatcher', description: 'Operations manager - can assign bookings and manage all rides' },
        { value: 'admin', label: 'Administrator', description: 'Full system access - can manage all users and system settings' }
    ];

    // Queries
    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ['allUsers', currentPage],
        queryFn: () => getAllUsers(currentPage, 20),
        enabled: !!userData,
    });

    // Mutations
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }) => updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries(['allUsers']);
            setEditingUser(null);
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['allUsers']);
        },
    });

    const searchUserMutation = useMutation({
        mutationFn: getUserByEmail,
        onSuccess: (data) => {
            setSearchResult(data);
        },
        onError: () => {
            setSearchResult({ error: 'User not found' });
        }
    });

    const handleRoleUpdate = (userId, newRole) => {
        if (confirm(`Are you sure you want to update this user's role to ${newRole}?`)) {
            updateRoleMutation.mutate({ userId, role: newRole });
        }
    };

    const handleDeleteUser = (userId, username) => {
        if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            deleteUserMutation.mutate(userId);
        }
    };

    const handleSearchUser = (e) => {
        e.preventDefault();
        if (searchEmail.trim()) {
            searchUserMutation.mutate(searchEmail.trim());
        }
    };

    const getRoleInfo = (role) => {
        return roles.find(r => r.value === role) || { label: role, description: 'Unknown role' };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
                        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-blue-100">
                            System Administration - Welcome, {userData?.username}
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <div className="border-b">
                            <nav className="flex space-x-8 px-6">
                                <button
                                    onClick={() => setSelectedTab('users')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                        selectedTab === 'users'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    User Management
                                </button>
                                <button
                                    onClick={() => setSelectedTab('search')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                        selectedTab === 'search'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    User Search
                                </button>
                                <button
                                    onClick={() => setSelectedTab('roles')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                        selectedTab === 'roles'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Role Information
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                        {selectedTab === 'users' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">User Management</h2>
                                    <div className="text-sm text-gray-600">
                                        Total Users: {usersData?.pagination?.total_count || 0}
                                    </div>
                                </div>
                                
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : usersData?.users && usersData.users.length > 0 ? (
                                    <div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full table-auto">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {usersData.users.map((user) => (
                                                        <tr key={user.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                                    user.role === 'dispatcher' ? 'bg-purple-100 text-purple-800' :
                                                                    user.role === 'super_driver' ? 'bg-orange-100 text-orange-800' :
                                                                    user.role === 'driver' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {getRoleInfo(user.role).label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(user.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button
                                                                    onClick={() => setEditingUser(user)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Edit Role
                                                                </button>
                                                                {user.id !== userData.id && (
                                                                    <button
                                                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                                                        disabled={deleteUserMutation.isPending}
                                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {/* Pagination */}
                                        {usersData?.pagination && (
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="text-sm text-gray-700">
                                                    Showing page {usersData.pagination.current_page} of {usersData.pagination.total_pages}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(usersData.pagination.total_pages, p + 1))}
                                                        disabled={currentPage === usersData.pagination.total_pages}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No users found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTab === 'search' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Search Users</h2>
                                
                                <form onSubmit={handleSearchUser} className="mb-6">
                                    <div className="flex gap-4">
                                        <input
                                            type="email"
                                            value={searchEmail}
                                            onChange={(e) => setSearchEmail(e.target.value)}
                                            placeholder="Enter user email address..."
                                            className="flex-1 p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={searchUserMutation.isPending}
                                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {searchUserMutation.isPending ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                </form>
                                
                                {searchResult && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        {searchResult.error ? (
                                            <p className="text-red-600">{searchResult.error}</p>
                                        ) : (
                                            <div>
                                                <h3 className="font-semibold mb-2">User Found:</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <p><strong>Username:</strong> {searchResult.username}</p>
                                                    <p><strong>Email:</strong> {searchResult.email}</p>
                                                    <p><strong>Role:</strong> {getRoleInfo(searchResult.role).label}</p>
                                                    <p><strong>Created:</strong> {new Date(searchResult.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => setEditingUser(searchResult)}
                                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                >
                                                    Edit User Role
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTab === 'roles' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">User Roles & Permissions</h2>
                                
                                <div className="space-y-6">
                                    {roles.map((role) => (
                                        <div key={role.value} className="border border-gray-200 p-6 rounded-lg">
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                                    role.value === 'admin' ? 'bg-red-100 text-red-800' :
                                                    role.value === 'dispatcher' ? 'bg-purple-100 text-purple-800' :
                                                    role.value === 'super_driver' ? 'bg-orange-100 text-orange-800' :
                                                    role.value === 'driver' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {role.label}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{role.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit User Role Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Edit User Role - {editingUser.username}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                                <p className="text-gray-600">{getRoleInfo(editingUser.role).label}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleRoleUpdate(editingUser.id, e.target.value);
                                        }
                                    }}
                                    className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none text-gray-800"
                                    defaultValue=""
                                >
                                    <option value="">Select new role...</option>
                                    {roles.map(role => (
                                        <option 
                                            key={role.value} 
                                            value={role.value}
                                            disabled={role.value === editingUser.role}
                                        >
                                            {role.label} {role.value === editingUser.role ? '(current)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}