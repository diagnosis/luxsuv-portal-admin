import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import getBookings from '../api/bookings.js';
import { checkAuth } from '../api/auth.js';
import Navbar from '../components/Navbar.jsx';

export const Route = createLazyFileRoute('/dashboard')({
    component: Dashboard,
    beforeLoad: async ({ location }) => {
        console.log('Dashboard beforeLoad - checking auth...');
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
});

function Dashboard() {
    const userData = Route.useLoaderData();
    const isAdmin = userData.role === 'admin' || userData.is_admin;
    const isDispatcher = userData.role === 'dispatcher';
    const isSuperDriver = userData.role === 'super_driver';
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['bookings'],
        queryFn: getBookings,
        retry: (failureCount, error) => {
            // Don't retry if it's an auth error
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return false;
            }
            return failureCount < 3;
        },
    });

    if (isLoading) {
        return (
            <div className="text-center text-gray-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                Loading bookings...
            </div>
        );
    }
    

    if (error) {
        return (
            <div className="text-red-500 text-center bg-red-100 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Error Loading Bookings</h3>
                <p>{error.message}</p>
                {error.message.includes('401') && (
                    <p className="mt-2 text-sm">
                        <a href="/login" className="text-blue-600 underline">Please log in again</a>
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    {isAdmin ? 'Admin Dashboard' : 
                                     isDispatcher ? 'Dispatcher Dashboard' : 
                                     isSuperDriver ? 'Super Driver Dashboard' : 'Dashboard'}
                                </h1>
                                <p className="text-blue-100">
                                    Welcome back, {userData.username} ({userData.email})
                                </p>
                                <p className="text-blue-200 text-sm capitalize">
                                    Role: {userData.role.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="bg-blue-700/50 px-4 py-2 rounded-lg">
                                    <p className="text-sm text-blue-200">Access Level</p>
                                    <p className="font-semibold">
                                        {isAdmin ? '🔑 Administrator' : 
                                         isDispatcher ? '📋 Dispatcher' : 
                                         isSuperDriver ? '🚗 Super Driver' : '👤 User'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role-based content */}
                    {isAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                                <h3 className="text-xl font-bold mb-3">👥 User Management</h3>
                                <p className="text-gray-600 mb-4">Manage all system users and roles</p>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    View Users
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                                <h3 className="text-xl font-bold mb-3">📊 System Stats</h3>
                                <p className="text-gray-600 mb-4">View system-wide analytics</p>
                                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    View Stats
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                                <h3 className="text-xl font-bold mb-3">⚙️ Settings</h3>
                                <p className="text-gray-600 mb-4">Configure system settings</p>
                                <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                    Settings
                                </button>
                            </div>
                        </div>
                    )}

                    {(isDispatcher || isSuperDriver) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                                <h3 className="text-xl font-bold mb-3">🚗 Booking Management</h3>
                                <p className="text-gray-600 mb-4">View and assign bookings to drivers</p>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Manage Bookings
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                                <h3 className="text-xl font-bold mb-3">👨‍💼 Driver Operations</h3>
                                <p className="text-gray-600 mb-4">Monitor driver performance and availability</p>
                                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    View Drivers
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Bookings section */}
                    <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                        <h2 className="text-2xl font-bold mb-4">
                            {isAdmin ? 'System Overview' : 
                             isDispatcher ? 'Recent Bookings' : 
                             'My Bookings'}
                        </h2>
                        <div className="space-y-4">
                            {data && data.length > 0 ? (
                                data.map((booking) => (
                                    <div key={booking.id} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{booking.your_name}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                                    <p>📅 {booking.date} at {booking.time}</p>
                                                    <p>📱 {booking.phone_number}</p>
                                                    <p>📍 From: {booking.pickup_location}</p>
                                                    <p>🎯 To: {booking.dropoff_location}</p>
                                                    <p>👥 {booking.number_of_passengers} passengers</p>
                                                    <p>🧳 {booking.number_of_luggage} luggage</p>
                                                </div>
                                                {booking.additional_notes && (
                                                    <p className="mt-2 text-sm text-gray-500 italic">
                                                        Note: {booking.additional_notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {booking.book_status || 'Pending'}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                    {booking.ride_status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                                    <p className="text-gray-500 text-lg mb-4">No bookings found</p>
                                    <p className="text-gray-400 text-sm">
                                        {isAdmin ? 'System bookings will appear here' : 
                                         isDispatcher ? 'New bookings will appear here for assignment' : 
                                         'Your bookings will appear here'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}