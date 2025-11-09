import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function Withdrawals() {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        pix_key: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [withdrawalsRes, summaryRes] = await Promise.all([
                api.get('/withdrawals'),
                api.get('/payments/summary')
            ]);
            setWithdrawals(withdrawalsRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (parseFloat(formData.amount) > summary.available_balance) {
            toast.error('Saldo insuficiente');
            return;
        }

        try {
            await api.post('/withdrawals', formData);
            toast.success('Solicitação de saque criada com sucesso');
            setShowModal(false);
            setFormData({ amount: '', pix_key: '' });
            loadData();
        } catch (error) {
            toast.error('Erro ao solicitar saque');
        }
    };

    const handleProcess = async (id, status, notes = '') => {
        try {
            await api.put(`/withdrawals/${id}`, { status, notes });
            toast.success('Saque processado com sucesso');
            loadData();
        } catch (error) {
            toast.error('Erro ao processar saque');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Pendente', color: '#f59e0b' },
            approved: { label: 'Aprovado', color: '#10b981' },
            rejected: { label: 'Rejeitado', color: '#ef4444' }
        };

        const statusInfo = statusMap[status] || statusMap.pending;

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: statusInfo.color,
                color: 'white',
                fontSize: '12px'
            }}>
                {statusInfo.label}
            </span>
        );
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
            <Sidebar active="withdrawals" />
            <div className="main-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                    <h1>Saques</h1>
                    {user.role === 'couple' && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary">
                            + Solicitar Saque
                        </button>
                    )}
                </div>

                <div className="stats-grid" style={{marginBottom: '30px'}}>
                    <div className="stat-card">
                        <h3>Saldo Disponível</h3>
                        <div className="value" style={{color: '#10b981'}}>
                            R$ {summary?.available_balance?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <h3>Total Sacado</h3>
                        <div className="value" style={{color: '#6366f1'}}>
                            R$ {summary?.total_withdrawn?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data Solicitação</th>
                                {user.role === 'admin' && <th>Usuário</th>}
                                <th>Valor</th>
                                <th>Chave PIX</th>
                                <th>Status</th>
                                {user.role === 'admin' && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={user.role === 'admin' ? '6' : '4'} style={{textAlign: 'center', padding: '40px'}}>
                                        Nenhuma solicitação de saque
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map(withdrawal => (
                                    <tr key={withdrawal.id}>
                                        <td>{new Date(withdrawal.requested_at).toLocaleDateString('pt-BR')}</td>
                                        {user.role === 'admin' && <td>{withdrawal.user_name}</td>}
                                        <td>R$ {parseFloat(withdrawal.amount).toFixed(2)}</td>
                                        <td>{withdrawal.pix_key}</td>
                                        <td>{getStatusBadge(withdrawal.status)}</td>
                                        {user.role === 'admin' && withdrawal.status === 'pending' && (
                                            <td>
                                                <button 
                                                    onClick={() => handleProcess(withdrawal.id, 'approved')}
                                                    className="btn btn-success"
                                                    style={{marginRight: '10px', padding: '6px 12px', fontSize: '14px'}}
                                                >
                                                    Aprovar
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const notes = prompt('Motivo da rejeição:');
                                                        if (notes) handleProcess(withdrawal.id, 'rejected', notes);
                                                    }}
                                                    className="btn btn-danger"
                                                    style={{padding: '6px 12px', fontSize: '14px'}}
                                                >
                                                    Rejeitar
                                                </button>
                                            </td>
                                        )}
                                        {user.role === 'admin' && withdrawal.status !== 'pending' && <td>-</td>}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Solicitar Saque</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                            </div>

                            <div style={{background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                                <strong>Saldo Disponível: R$ {summary?.available_balance?.toFixed(2)}</strong>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Valor do Saque (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={summary?.available_balance}
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Chave PIX *</label>
                                    <input
                                        type="text"
                                        value={formData.pix_key}
                                        onChange={(e) => setFormData({...formData, pix_key: e.target.value})}
                                        placeholder="CPF, Email, Telefone ou Chave Aleatória"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-success" style={{width: '100%'}}>
                                    Solicitar Saque
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Withdrawals;
