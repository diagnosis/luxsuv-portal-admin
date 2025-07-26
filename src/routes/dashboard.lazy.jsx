import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import getBookings from '../api/bookings.js';
import { checkAuth } from '../api/auth.js';

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
        <div className="max-w-6xl mx-auto">
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                {userData && (
                    <p className="text-blue-100">Welcome back, {userData.email || 'User'}</p>
                )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
                <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
                <div className="space-y-4">
                    {data && data.length > 0 ? (
                        data.map((booking) => (
                            <div key={booking.id} className="border p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{booking.your_name}</h3>
                                        <p className="text-gray-600">Date: {booking.date}</p>
                                        {booking.pickup_location && (
                                            <p className="text-gray-600">From: {booking.pickup_location}</p>
                                        )}
                                        {booking.dropoff_location && (
                                            <p className="text-gray-600">To: {booking.dropoff_location}</p>
                                        )}
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {booking.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No bookings found</p>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Create New Booking
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}