import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restaurar sessão do localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                
                // Configurar token no header da API
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                console.log('✅ Sessão restaurada:', parsedUser.name);
            } catch (error) {
                console.error('❌ Erro ao restaurar sessão:', error);
                // Limpar dados corrompidos
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        
        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Configurar token no header da API
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        console.log('✅ Login bem-sucedido:', user.name);
        
        return user;
    };

    const logout = () => {
        // Limpar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Remover token do header da API
        delete api.defaults.headers.common['Authorization'];
        
        setUser(null);
        console.log('✅ Logout realizado');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
