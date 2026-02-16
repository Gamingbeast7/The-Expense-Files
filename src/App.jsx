import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
// Import placeholders for now, will create files next
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { Categories } from "./pages/Categories";
import { Goals } from "./pages/Goals";
import { AddExpense } from "./pages/AddExpense";
import { About } from "./pages/About";
import { AnimatePresence } from "framer-motion";

function AppContent() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
