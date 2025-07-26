import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import getBookings from '../api/bookings.js';

export const Route = createLazyFileRoute('/dashboard')({
    component: Dashboard,
    beforeLoad: async () => {
        const res = await fetch('https://luxsuv-v4.onrender.com/users/me', { credentials: 'include' });
        console.log('beforeLoad response status:', res.status); // Debug
        if (!res.ok) {
            console.log('Auth failed, redirecting to login');
            throw redirect({ to: '/login' }); // Redirect instead of error
        }
    },
});

function Dashboard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['bookings'],
        queryFn: getBookings,
    });

    if (isLoading) return <div className="text-center text-gray-300">Loading bookings...</div>;
    if (error) return <div className="text-red-500 text-center">Error: {error.message}</div>;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-bold text-center text-gray-800">My Bookings</h2>
                <div className="mt-4 text-gray-700">
                    {data && data.length > 0 ? (
                        data.map((booking) => <p key={booking.id}>{booking.your_name} - {booking.date}</p>)
                    ) : (
                        <p className="text-center">No bookings found</p>
                    )}
                </div>
            </div>
        </div>
    );
}