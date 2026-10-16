import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { SettingsSync } from "@/app/providers/SettingsSync";
import { AppRouter } from "@/app/router";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { GlobalLoader } from "@/shared/ui/GlobalLoader";
import { PageFooterProvider } from "@/shared/ui/PageFooter";
import { PageHeaderBar, PageHeaderProvider } from "@/shared/ui/PageHeader";
import { Footer } from "@/widgets/Footer";

export default function App() {
    return (
        <QueryProvider>
            <SettingsSync />
            <RouterProvider>
                <PageHeaderProvider>
                    <PageFooterProvider>
                        <PageHeaderBar />
                        <ErrorBoundary>
                            <AppRouter />
                        </ErrorBoundary>
                        <Footer />
                        <GlobalLoader />
                    </PageFooterProvider>
                </PageHeaderProvider>
            </RouterProvider>
        </QueryProvider>
    );
}