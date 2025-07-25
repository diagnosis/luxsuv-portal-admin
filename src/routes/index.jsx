import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="max-w-4xl mx-auto text-center">
            <div className="bg-blue-600 text-white p-8 rounded-lg shadow-lg mb-8">
                <h1 className="text-4xl font-bold mb-4">Welcome to LuxSUV Portal</h1>
                <p className="text-xl mb-6">Admin & Dispatcher Management System</p>
                <div className="space-x-4">
                    <Link 
                        to="/login" 
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                    >
                        Login to Dashboard
                    </Link>
                    <Link 
                        to="/dashboard" 
                        className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors inline-block"
                    >
                        View Dashboard
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-3">User Management</h3>
                    <p className="text-gray-600">Manage riders, drivers, and admin accounts efficiently.</p>
                </div>
                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-3">Dispatch Control</h3>
                    <p className="text-gray-600">Monitor and control ride dispatching in real-time.</p>
                </div>
                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-3">Analytics</h3>
                    <p className="text-gray-600">View detailed reports and performance metrics.</p>
                </div>
            </div>
        </div>
    );
}