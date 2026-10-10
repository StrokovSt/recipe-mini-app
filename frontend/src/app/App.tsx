import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { AppRouter } from "@/app/router";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { PageHeaderBar, PageHeaderProvider } from "@/shared/ui/PageHeader";
import { Footer } from "@/widgets/Footer";

export default function App() {
    return (
        <QueryProvider>
            <RouterProvider>
                <PageHeaderProvider>
                    <PageHeaderBar />
                    <ErrorBoundary>
                        <AppRouter />
                    </ErrorBoundary>
                    <Footer />
                </PageHeaderProvider>
            </RouterProvider>
        </QueryProvider>
    );
}