import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { AppRouter } from "@/app/router";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";

export default function App() {
    return (
        <QueryProvider>
            <RouterProvider>
                <Header />
                <ErrorBoundary>
                    <AppRouter />
                </ErrorBoundary>
                <Footer />
            </RouterProvider>
        </QueryProvider>
    );
}