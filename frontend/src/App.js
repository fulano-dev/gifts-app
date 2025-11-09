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
            
            {/* Painel */}
            <Route path="/painel" element={<Dashboard />} />
            <Route path="/painel/convidados" element={<ManageGuests />} />
            <Route path="/painel/experiencias" element={<ManageExperiences />} />
            <Route path="/painel/compras" element={<Purchases />} />
            <Route path="/painel/saques" element={<Withdrawals />} />
            <Route path="/painel/configuracoes" element={<Settings />} />
            <Route path="/painel/usuarios" element={<Users />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
