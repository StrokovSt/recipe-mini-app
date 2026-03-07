import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";
import { AppRouter } from "@/app/router";
import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";

export default function App() {
    return (
        <QueryProvider>
            <RouterProvider>
                <Header />
                <AppRouter />
                <Footer />
            </RouterProvider>
        </QueryProvider>
    );
}