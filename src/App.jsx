import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Expenses from './pages/Expenses';
import Members from './pages/Members';
import Reports from './pages/Reports';
import Logs from './pages/Logs';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="donations" element={<Donations />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="members" element={<Members />} />
          <Route path="reports" element={<Reports />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
