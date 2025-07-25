import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Navbar from '../components/Navbar';

export const Route = createRootRoute({
    component: () => (
        <>
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <div className="p-6">
                    <Outlet />
                </div>
                <TanStackRouterDevtools />
            </div>
        </>
    ),
});