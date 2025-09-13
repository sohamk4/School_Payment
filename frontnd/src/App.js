import React,{useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sun, Moon } from "lucide-react"; // Import the icons

import Login from "./pages/Login";
import TransactionsOverview from "./pages/TransactionsOverview";
import TransactionDetailsBySchool from "./pages/TransactionDetailsBySchool";
import TransactionStatusCheck from "./pages/TransactionStatusCheck";

const queryClient = new QueryClient();


// Layout for navbar
function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {!hideNavbar && (
        <nav className="bg-white dark:bg-slate-800 shadow px-6 py-3 flex justify-between items-center">
          <Link
            to="/transactions"
            className="font-semibold text-indigo-600 dark:text-indigo-400"
          >
            Dashboard
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/transactions" className="hover:underline">
              All Transactions
            </Link>
            <Link to="/transactions/school" className="hover:underline">
              By School
            </Link>
            <Link to="/transactions/status" className="hover:underline">
              Status Check
            </Link>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          </div>
        </nav>
      )}
      <main className="p-6">{children}</main>
    </div>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/transactions"
                element={<TransactionsOverview />}/>

              <Route
                path="/transactions/school"
                element={<TransactionDetailsBySchool />}
              />
              <Route
                path="/transactions/status"
                element={<TransactionStatusCheck />}
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
