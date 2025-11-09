import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadSummary();
    }, [user, navigate]);

    const loadSummary = async () => {
        try {
            const response = await api.get('/payments/summary');
            setSummary(response.data);
        } catch (error) {
            console.error('Erro ao carregar resumo:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Sidebar active="dashboard" />
            <div className="main-content">
                <h1>Dashboard Financeiro</h1>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Recebido</h3>
                        <div className="value">R$ {summary?.total_received?.toFixed(2) || '0.00'}</div>
                    </div>
                    
                    <div className="stat-card">
                        <h3>Taxa Mercado Pago</h3>
                        <div className="value" style={{color: '#ef4444'}}>
                            R$ {summary?.total_mp_fee?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <h3>Taxa Administrativa</h3>
                        <div className="value" style={{color: '#f59e0b'}}>
                            R$ {summary?.total_admin_fee?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <h3>Valor dos Noivos</h3>
                        <div className="value" style={{color: '#10b981'}}>
                            R$ {summary?.total_couple_amount?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <h3>Total Sacado</h3>
                        <div className="value" style={{color: '#6366f1'}}>
                            R$ {summary?.total_withdrawn?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <h3>Saldo Disponível</h3>
                        <div className="value" style={{color: '#10b981', fontSize: '28px'}}>
                            R$ {summary?.available_balance?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>

                <div className="stats-grid" style={{marginTop: '30px'}}>
                    <div className="stat-card">
                        <h3>Total de Presentes</h3>
                        <div className="value">{summary?.total_purchases || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
