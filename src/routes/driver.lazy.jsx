import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { checkAuth } from '../api/auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignedBookings, acceptBooking, getAvailableBookings, assignBookingToDriver } from '../api/driver.js';
import { getAllUsers } from '../api/admin.js';
import Navbar from '../components/Navbar.jsx';
import { useState } from 'react';

export const Route = createLazyFileRoute('/driver')({
    beforeLoad: async ({ location }) => {
        console.log('Driver beforeLoad - checking auth...');
        try {
            const userData = await checkAuth();
            
            // Check if user has driver permissions
            const allowedRoles = ['driver', 'super_driver', 'dispatcher', 'admin'];
            if (!allowedRoles.includes(userData?.role)) {
                throw new Error('Driver access required');
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
    component: DriverPage,
});

function DriverPage() {
    const userData = Route.useRouteContext();
    const queryClient = useQueryClient();
    const [selectedTab, setSelectedTab] = useState('assigned');
    const [assigningBooking, setAssigningBooking] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [assignmentNotes, setAssignmentNotes] = useState('');

    const isDriver = userData?.role === 'driver';
    const isSuperDriver = userData?.role === 'super_driver';
    const isDispatcher = userData?.role === 'dispatcher';
    const isAdmin = userData?.role === 'admin';

    // Queries
    const { data: assignedBookings, isLoading: loadingAssigned } = useQuery({
        queryKey: ['assignedBookings'],
        queryFn: getAssignedBookings,
        enabled: !!userData,
    });

    const { data: availableBookings, isLoading: loadingAvailable } = useQuery({
        queryKey: ['availableBookings'],
        queryFn: getAvailableBookings,
        enabled: !!userData && (isSuperDriver || isDispatcher || isAdmin),
    });

    const { data: driversData } = useQuery({
        queryKey: ['drivers'],
        queryFn: () => getAllUsers(1, 100),
        enabled: !!(userData && (isSuperDriver || isDispatcher || isAdmin)),
        select: (data) => data.users?.filter(user => 
            ['driver', 'super_driver'].includes(user.role)
        ) || []
    });

    // Mutations
    const acceptMutation = useMutation({
        mutationFn: acceptBooking,
        onSuccess: () => {
            queryClient.invalidateQueries(['assignedBookings']);
            queryClient.invalidateQueries(['availableBookings']);
        },
    });

    const assignMutation = useMutation({
        mutationFn: ({ bookingId, driverId, notes }) => assignBookingToDriver(bookingId, driverId, notes),
        onSuccess: () => {
            queryClient.invalidateQueries(['availableBookings']);
            queryClient.invalidateQueries(['assignedBookings']);
            setAssigningBooking(null);
            setSelectedDriver('');
            setAssignmentNotes('');
        },
    });

    const handleAcceptBooking = (bookingId) => {
        if (confirm('Accept this booking?')) {
            acceptMutation.mutate(bookingId);
        }
    };

    const handleAssignBooking = () => {
        if (!selectedDriver) {
            alert('Please select a driver');
            return;
        }
        
        assignMutation.mutate({
            bookingId: assigningBooking,
            driverId: parseInt(selectedDriver),
            notes: assignmentNotes
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            {isDriver ? 'Driver Dashboard' : 
                             isSuperDriver ? 'Super Driver Dashboard' : 
                             'Driver Management'}
                        </h1>
                        <p className="text-blue-100">
                            Welcome back, {userData?.username} - {userData?.role?.replace('_', ' ')}
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-lg shadow-md mb-6">
                        <div className="border-b">
                            <nav className="flex space-x-8 px-6">
                                <button
                                    onClick={() => setSelectedTab('assigned')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                        selectedTab === 'assigned'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    My Assigned Bookings
                                </button>
                                {(isSuperDriver || isDispatcher || isAdmin) && (
                                    <button
                                        onClick={() => setSelectedTab('available')}
                                        className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                            selectedTab === 'available'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Available Bookings
                                    </button>
                                )}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                        {selectedTab === 'assigned' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">My Assigned Bookings</h2>
                                
                                {loadingAssigned ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : assignedBookings && assignedBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {assignedBookings.map((booking) => (
                                            <div key={booking.id} className="border border-gray-200 p-6 rounded-lg hover:bg-gray-50">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Booking #{booking.id}</h3>
                                                        <p className="text-gray-600">{booking.ride_type}</p>
                                                        <p className="text-sm text-gray-500">Customer: {booking.your_name}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            booking.book_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.book_status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {booking.book_status}
                                                        </span>
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                            {booking.ride_status}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                                                    <p><strong>📅 Date:</strong> {booking.date} at {booking.time}</p>
                                                    <p><strong>📱 Phone:</strong> {booking.phone_number}</p>
                                                    <p><strong>📍 From:</strong> {booking.pickup_location}</p>
                                                    <p><strong>🎯 To:</strong> {booking.dropoff_location}</p>
                                                    <p><strong>👥 Passengers:</strong> {booking.number_of_passengers}</p>
                                                    <p><strong>🧳 Luggage:</strong> {booking.number_of_luggage}</p>
                                                </div>
                                                
                                                {booking.additional_notes && (
                                                    <p className="text-sm text-gray-500 italic mb-4">
                                                        <strong>Note:</strong> {booking.additional_notes}
                                                    </p>
                                                )}
                                                
                                                {booking.book_status === 'Pending' && booking.ride_status === 'Assigned' && (
                                                    <button
                                                        onClick={() => handleAcceptBooking(booking.id)}
                                                        disabled={acceptMutation.isPending}
                                                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {acceptMutation.isPending ? 'Accepting...' : 'Accept Booking'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">🚗</div>
                                        <p className="text-gray-500 text-lg mb-4">No assigned bookings</p>
                                        <p className="text-gray-400 text-sm">Bookings assigned to you will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTab === 'available' && (isSuperDriver || isDispatcher || isAdmin) && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Available Bookings</h2>
                                
                                {loadingAvailable ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : availableBookings && availableBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {availableBookings.map((booking) => (
                                            <div key={booking.id} className="border border-gray-200 p-6 rounded-lg hover:bg-gray-50">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Booking #{booking.id}</h3>
                                                        <p className="text-gray-600">{booking.ride_type}</p>
                                                        <p className="text-sm text-gray-500">Customer: {booking.your_name}</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        Unassigned
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                                                    <p><strong>📅 Date:</strong> {booking.date} at {booking.time}</p>
                                                    <p><strong>📱 Phone:</strong> {booking.phone_number}</p>
                                                    <p><strong>📍 From:</strong> {booking.pickup_location}</p>
                                                    <p><strong>🎯 To:</strong> {booking.dropoff_location}</p>
                                                    <p><strong>👥 Passengers:</strong> {booking.number_of_passengers}</p>
                                                    <p><strong>🧳 Luggage:</strong> {booking.number_of_luggage}</p>
                                                </div>
                                                
                                                {booking.additional_notes && (
                                                    <p className="text-sm text-gray-500 italic mb-4">
                                                        <strong>Note:</strong> {booking.additional_notes}
                                                    </p>
                                                )}
                                                
                                                <button
                                                    onClick={() => setAssigningBooking(booking.id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                >
                                                    Assign to Driver
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">✅</div>
                                        <p className="text-gray-500 text-lg mb-4">No available bookings</p>
                                        <p className="text-gray-400 text-sm">All bookings have been assigned to drivers</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {assigningBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Assign Booking #{assigningBooking}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver</label>
                                <select
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none text-gray-800"
                                >
                                    <option value="">Choose a driver...</option>
                                    {driversData?.map(driver => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.username} ({driver.email}) - {driver.role.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Notes (Optional)</label>
                                <textarea
                                    value={assignmentNotes}
                                    onChange={(e) => setAssignmentNotes(e.target.value)}
                                    className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none text-gray-800"
                                    rows="3"
                                    placeholder="Any special instructions for the driver..."
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleAssignBooking}
                                disabled={assignMutation.isPending || !selectedDriver}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {assignMutation.isPending ? 'Assigning...' : 'Assign Booking'}
                            </button>
                            <button
                                onClick={() => {
                                    setAssigningBooking(null);
                                    setSelectedDriver('');
                                    setAssignmentNotes('');
                                }}
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