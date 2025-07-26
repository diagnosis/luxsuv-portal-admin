import { createFileRoute, redirect } from '@tanstack/react-router';
import { checkAuth } from '../api/auth';

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        console.log('Index page - checking authentication...');
        try {
            const userData = await checkAuth();
            console.log('User authenticated, redirecting to dashboard:', userData);
            throw redirect({ to: '/dashboard' });
        } catch (error) {
            console.log('User not authenticated, redirecting to login');
            throw redirect({ to: '/login' });
        }
    },
    component: () => null, // This component should never render
});