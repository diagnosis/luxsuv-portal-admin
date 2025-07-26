import {createLazyFileRoute, useNavigate, redirect} from '@tanstack/react-router';
import {useMutation, useQuery} from "@tanstack/react-query";
import {login, checkAuth} from "../api/auth.js";
import {useState} from "react";
import {useForm} from "@tanstack/react-form";


import { Link } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/login')({
    beforeLoad: async () => {
        try {
            const userData = await checkAuth();
            console.log('Already authenticated, redirecting to dashboard:', userData);
            throw redirect({ to: '/dashboard' });
        } catch (error) {
            // Not authenticated, stay on login page
            console.log('Not authenticated, showing login page');
        }
    },
    component: LoginPage,
});

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: ({ email, password }) => login(email, password),
        onSuccess: () => {
            console.log('Login successful, navigating to dashboard');
            // Add a small delay to ensure cookies are set
            setTimeout(() => {
                navigate({ to: '/dashboard', replace: true });
            }, 100);
        },
        onError: (error) => {
            console.error('login error', error);
            setError(error.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (!email || !password || password.length < 8) {
            setError('Email and password (min 8 chars) required');
            return;
        }
        mutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">LuxSUV Portal</h1>
                    <p className="text-gray-600">Admin & Dispatcher Management</p>
                </div>
                
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Sign In</h2>
                
                {error && <p className="text-red-500 text-center">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                            placeholder="admin@luxsuv.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                            Sign up here
                        </Link>
                    </p>
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 text-center">
                        Test accounts: admin@luxsuv.test / dispatcher@luxsuv.test
                    </p>
                </div>
            </div>
        </div>
    );
}