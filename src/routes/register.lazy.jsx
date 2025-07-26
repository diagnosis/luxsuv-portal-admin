import { createLazyFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { register, checkAuth } from '../api/auth.js';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/register')({
    beforeLoad: async () => {
        try {
            const userData = await checkAuth();
            console.log('Already authenticated, redirecting to dashboard:', userData);
            throw redirect({ to: '/dashboard' });
        } catch (error) {
            // Not authenticated, stay on register page
            console.log('Not authenticated, showing register page');
        }
    },
    component: RegisterPage,
});

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'rider'
    });
    const [error, setError] = useState(null);

    const mutation = useMutation({
        mutationFn: (userData) => register({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role
        }),
        onSuccess: () => {
            alert('Registration successful! Please login with your credentials.');
            navigate({ to: '/login' });
        },
        onError: (error) => {
            console.error('Registration error', error);
            setError(error.message);
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (formData.username.length < 3 || formData.username.length > 50) {
            setError('Username must be between 3 and 50 characters');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        // Check if password contains at least one letter and one number
        const hasLetter = /[a-zA-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);
        if (!hasLetter || !hasNumber) {
            setError('Password must contain at least one letter and one number');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        mutation.mutate(formData);
    };

    const roles = [
        { value: 'rider', label: 'Rider', description: 'Book and manage your rides' },
        { value: 'driver', label: 'Driver', description: 'Accept and complete ride assignments' }
    ];

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Join LuxSUV</h1>
                    <p className="text-gray-600">Create your account to get started</p>
                </div>
                
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Sign Up</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                            placeholder="Enter your username"
                            minLength="3"
                            maxLength="50"
                            required
                        />
                        <p className="text-xs text-gray-500">3-50 characters</p>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                            placeholder="Enter your password"
                            minLength="8"
                            required
                        />
                        <p className="text-xs text-gray-500">At least 8 characters with letters and numbers</p>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                            disabled={mutation.isPending}
                        >
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label} - {role.description}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                            Sign in here
                        </Link>
                    </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Account Types:</strong></p>
                        <p>• <strong>Rider:</strong> Book and manage your luxury rides</p>
                        <p>• <strong>Driver:</strong> Accept ride assignments and serve customers</p>
                        <p className="mt-2">Higher-level roles (Dispatcher, Admin) are assigned by administrators.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}