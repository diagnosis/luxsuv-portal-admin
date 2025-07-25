import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="p-2">
            <h3 className="text-2xl font-bold">Welcome to LuxSUV Portal!</h3>
        </div>
    );
}