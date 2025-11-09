import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Só redireciona se não estiver carregando E não tiver usuário
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }
        
        if (user) {
            loadSummary();
        }
    }, [user, authLoading, navigate]);

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
                
                {summary?.role === 'admin' ? (
                    // DASHBOARD DO ADMIN - Vê tudo
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Recebido</h3>
                                <div className="value">R$ {(parseFloat(summary?.total_received) || 0).toFixed(2)}</div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Taxa MercadoPago</h3>
                                <div className="value" style={{color: '#ef4444'}}>
                                    R$ {(parseFloat(summary?.total_mp_fee) || 0).toFixed(2)}
                                </div>
                                <p style={{fontSize: '12px', color: '#6b7280', marginTop: '10px'}}>
                                    Cobrada pelo MP
                                </p>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Seu Lucro Líquido</h3>
                                <div className="value" style={{color: '#3b82f6'}}>
                                    R$ {(parseFloat(summary?.admin_profit) || 0).toFixed(2)}
                                </div>
                                <p style={{fontSize: '12px', color: '#6b7280', marginTop: '10px'}}>
                                    Taxa Admin - Taxa MP
                                </p>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Valor dos Noivos</h3>
                                <div className="value" style={{color: '#10b981'}}>
                                    R$ {(parseFloat(summary?.total_couple_amount) || 0).toFixed(2)}
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Total Sacado</h3>
                                <div className="value" style={{color: '#6366f1'}}>
                                    R$ {(parseFloat(summary?.total_withdrawn) || 0).toFixed(2)}
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Saldo Disponível Noivos</h3>
                                <div className="value" style={{color: '#10b981', fontSize: '28px'}}>
                                    R$ {(parseFloat(summary?.available_balance) || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="stats-grid" style={{marginTop: '30px'}}>
                            <div className="stat-card">
                                <h3>Total de Presentes</h3>
                                <div className="value">{summary?.total_purchases || 0}</div>
                            </div>
                        </div>
                    </>
                ) : (
                    // DASHBOARD DOS NOIVOS - Só veem saldo disponível
                    <>
                        <div className="stats-grid">

                         <div className="stat-card">
                                <h3>Saldo Disponível para Saque</h3>
                                <div className="value" style={{color: '#10b981', fontSize: '32px'}}>
                                    R$ {(parseFloat(summary?.available_balance) || 0).toFixed(2)}
                                </div>
                                <p style={{fontSize: '12px', color: '#10b981', marginTop: '10px', fontWeight: '600'}}>
                                    ✓ Disponível para saque
                                </p>
                            </div>    
                            
                            <div className="stat-card">
                                <h3>Total Sacado</h3>
                                <div className="value" style={{color: '#6366f1'}}>
                                    R$ {(parseFloat(summary?.total_withdrawn) || 0).toFixed(2)}
                                </div>
                            </div>
                            
                           
                        </div>
                        <div className="stat-card">
                                <h3>Total Recebido:</h3>
                                <div className="value" style={{color: '#10b981'}}>
                                    R$ {(parseFloat(summary?.total_couple_amount) || 0).toFixed(2)}
                                </div>
                                <p style={{fontSize: '12px', color: '#6b7280', marginTop: '10px'}}>
                                    Total após taxa administrativa
                                </p>
                            </div>

                        <div className="stats-grid" style={{marginTop: '30px'}}>
                            <div className="stat-card">
                                <h3>Total de Presentes</h3>
                                <div className="value">{summary?.total_purchases || 0}</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
