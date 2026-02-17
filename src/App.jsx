import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { Categories } from "./pages/Categories";
import { Goals } from "./pages/Goals";
import { AddExpense } from "./pages/AddExpense";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Groups } from "./pages/Groups";
import { GroupDetails } from "./pages/GroupDetails";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";

// PrivateRoute component to protect routes
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute>
            <Layout>
              <Transactions />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <Layout>
              <Analytics />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/categories" element={
          <PrivateRoute>
            <Layout>
              <Categories />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/goals" element={
          <PrivateRoute>
            <Layout>
              <Goals />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/add-expense" element={
          <PrivateRoute>
            <Layout>
              <AddExpense />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/about" element={
          <PrivateRoute>
            <Layout>
              <About />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/groups" element={
          <PrivateRoute>
            <Layout>
              <Groups />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/groups/:groupId" element={
          <PrivateRoute>
            <Layout>
              <GroupDetails />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ExpenseProvider>
          <AppContent />
        </ExpenseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
