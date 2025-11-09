import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Páginas públicas
import Home from './pages/Home';
import Confirmation from './pages/Confirmation';
import Gifts from './pages/Gifts';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentError from './pages/PaymentError';
import PaymentPending from './pages/PaymentPending';

// Páginas de autenticação
import Login from './pages/Login';

// Páginas do painel
import Dashboard from './pages/Dashboard';
import ManageGuests from './pages/ManageGuests';
import ManageExperiences from './pages/ManageExperiences';
import Purchases from './pages/Purchases';
import Withdrawals from './pages/Withdrawals';
import Settings from './pages/Settings';
import Users from './pages/Users';

// Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/confirmacao" element={<Confirmation />} />
            <Route path="/presentes" element={<Gifts />} />
            <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
            <Route path="/pagamento/erro" element={<PaymentError />} />
            <Route path="/pagamento/pendente" element={<PaymentPending />} />
            
            {/* Autenticação */}
            <Route path="/admin" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Painel - Rotas Protegidas */}
            <Route path="/painel" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/painel/convidados" element={<ProtectedRoute><ManageGuests /></ProtectedRoute>} />
            <Route path="/painel/experiencias" element={<ProtectedRoute><ManageExperiences /></ProtectedRoute>} />
            <Route path="/painel/compras" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
            <Route path="/painel/saques" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
            <Route path="/painel/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/painel/usuarios" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
