import {createLazyFileRoute, useNavigate} from '@tanstack/react-router';
import {useMutation, useQuery} from "@tanstack/react-query";
import {login} from "../api/auth.js";
import {useState} from "react";
import {useForm} from "@tanstack/react-form";


export const Route = createLazyFileRoute('/login')({
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
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800">Sign In to LuxSUV</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}