import { Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import BookDetailPage from "./pages/BookDetailPage";
import InventoryPage from "./pages/InventoryPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <main className="mx-auto max-w-6xl px-4 mt-10">
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
