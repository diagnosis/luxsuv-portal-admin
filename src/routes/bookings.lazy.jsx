import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { checkAuth } from '../api/auth.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBookings, updateBooking, cancelBooking } from '../api/bookings.js';
import Navbar from '../components/Navbar.jsx';
import { useState } from 'react';

export const Route = createLazyFileRoute('/bookings')({
    beforeLoad: async ({ location }) => {
        console.log('Bookings beforeLoad - checking auth...');
        try {
            const userData = await checkAuth();
            console.log('Auth successful, user data:', userData);
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
    component: BookingsPage,
});

function BookingsPage() {
    const userData = Route.useRouteContext();
    const queryClient = useQueryClient();
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState({});

    const { data: bookings, isLoading, error } = useQuery({
        queryKey: ['myBookings'],
        queryFn: getMyBookings,
        enabled: !!userData,
    });

    const updateMutation = useMutation({
        mutationFn: ({ bookingId, updates }) => updateBooking(bookingId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['myBookings']);
            setEditingBooking(null);
            setEditForm({});
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ bookingId, reason }) => cancelBooking(bookingId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries(['myBookings']);
        },
    });

    const handleEdit = (booking) => {
        setEditingBooking(booking.id);
        setEditForm({
            pickup_location: booking.pickup_location,
            dropoff_location: booking.dropoff_location,
            date: booking.date,
            time: booking.time,
            number_of_passengers: booking.number_of_passengers,
            number_of_luggage: booking.number_of_luggage,
            additional_notes: booking.additional_notes || '',
        });
    };

    const handleSaveEdit = () => {
        updateMutation.mutate({ bookingId: editingBooking, updates: editForm });
    };

    const handleCancelBooking = (bookingId) => {
        const reason = prompt('Please provide a reason for cancellation:');
        if (reason !== null) {
            cancelMutation.mutate({ bookingId, reason });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <div className="p-6">
                    <div className="text-red-500 text-center bg-red-100 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">Error Loading Bookings</h3>
                        <p>{error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
                        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
                        <p className="text-blue-100">Manage your ride bookings</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                        {bookings && bookings.length > 0 ? (
                            <div className="space-y-6">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="border border-gray-200 p-6 rounded-lg hover:bg-gray-50">
                                        {editingBooking === booking.id ? (
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-lg mb-4">Edit Booking #{booking.id}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Pickup Location</label>
                                                        <input
                                                            type="text"
                                                            value={editForm.pickup_location}
                                                            onChange={(e) => setEditForm({...editForm, pickup_location: e.target.value})}
                                                            className="w-full p-3 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Dropoff Location</label>
                                                        <input
                                                            type="text"
                                                            value={editForm.dropoff_location}
                                                            onChange={(e) => setEditForm({...editForm, dropoff_location: e.target.value})}
                                                            className="w-full p-3 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Date</label>
                                                        <input
                                                            type="date"
                                                            value={editForm.date}
                                                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                            className="w-full p-3 border rounded-md"
                                                            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Time</label>
                                                        <input
                                                            type="time"
                                                            value={editForm.time}
                                                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                                            className="w-full p-3 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Passengers</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={editForm.number_of_passengers}
                                                            onChange={(e) => setEditForm({...editForm, number_of_passengers: parseInt(e.target.value)})}
                                                            className="w-full p-3 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Luggage</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editForm.number_of_luggage}
                                                            onChange={(e) => setEditForm({...editForm, number_of_luggage: parseInt(e.target.value)})}
                                                            className="w-full p-3 border rounded-md"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                                    <textarea
                                                        value={editForm.additional_notes}
                                                        onChange={(e) => setEditForm({...editForm, additional_notes: e.target.value})}
                                                        className="w-full p-3 border rounded-md h-20"
                                                        placeholder="Any special requests or notes..."
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        disabled={updateMutation.isPending}
                                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingBooking(null);
                                                            setEditForm({});
                                                        }}
                                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Booking #{booking.id}</h3>
                                                        <p className="text-gray-600">{booking.ride_type}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            booking.book_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.book_status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                            booking.book_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
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
                                                
                                                {booking.driver_name && (
                                                    <p className="text-sm text-green-600 mb-4">
                                                        <strong>🚗 Driver:</strong> {booking.driver_name} ({booking.driver_email})
                                                    </p>
                                                )}
                                                
                                                {booking.book_status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(booking)}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                        >
                                                            Edit Booking
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.id)}
                                                            disabled={cancelMutation.isPending}
                                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                                <p className="text-gray-500 text-lg mb-4">No bookings found</p>
                                <p className="text-gray-400 text-sm">Your bookings will appear here once you make a reservation.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}