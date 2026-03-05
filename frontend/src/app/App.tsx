import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { AppRouter } from "@/app/router";
import { Navigation } from "@/shared/ui/Navigation";

export default function App() {
    return (
        <QueryProvider>
            <RouterProvider>
                <Navigation />
                <AppRouter />
            </RouterProvider>
        </QueryProvider>
    );
}