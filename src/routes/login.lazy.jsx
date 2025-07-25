import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/login')({
    component: LoginLazy,
});

function LoginLazy() {
    return <div className="p-2">Login Page</div>;
}