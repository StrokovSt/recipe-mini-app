import { QueryProvider } from "./providers/QueryProvider";

export default function App() {
  return (
    <QueryProvider>
      <div>Recipe App</div>
    </QueryProvider>
  );
}