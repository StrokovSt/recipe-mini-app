import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { AppRouter } from "@/app/router";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { Footer } from "@/widgets/Footer";

export default function App() {
    return (
        <QueryProvider>
            <RouterProvider>
                <ErrorBoundary>
                    <AppRouter />
                </ErrorBoundary>
                <Footer />
            </RouterProvider>
        </QueryProvider>
    );
}