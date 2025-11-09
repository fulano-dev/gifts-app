import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Mostrar spinner enquanto verifica autenticação
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div className="spinner" style={{
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #4a90e2',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p style={{ color: '#666' }}>Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Se não está autenticado, redireciona para login
    if (!user) {
        console.log('❌ ProtectedRoute: Usuário não autenticado, redirecionando para login');
        return <Navigate to="/login" replace />;
    }

    // Se está autenticado, renderiza a página
    console.log('✅ ProtectedRoute: Usuário autenticado, renderizando página protegida');
    return children;
}

export default ProtectedRoute;
