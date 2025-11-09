import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function Purchases() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }
        
        if (user) {
            loadPurchases();
        }
    }, [user, authLoading, navigate]);

    const loadPurchases = async () => {
        try {
            const response = await api.get('/payments');
            setPurchases(response.data);
        } catch (error) {
            toast.error('Erro ao carregar compras');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Pendente', color: '#f59e0b' },
            approved: { label: 'Aprovado', color: '#10b981' },
            rejected: { label: 'Rejeitado', color: '#ef4444' },
            cancelled: { label: 'Cancelado', color: '#6b7280' }
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
            <Sidebar active="purchases" />
            <div className="main-content">
                <h1>Presentes Recebidos</h1>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Convidado</th>
                                <th>Email</th>
                                <th>Experiência</th>
                                <th>Qtd</th>
                                <th>Valor Total</th>
                                <th>Mensagem</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                                        Nenhum presente recebido ainda
                                    </td>
                                </tr>
                            ) : (
                                purchases.map(purchase => (
                                    <tr key={purchase.id}>
                                        <td>{new Date(purchase.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td>{purchase.guest_name}</td>
                                        <td>{purchase.guest_email}</td>
                                        <td>{purchase.experience_title}</td>
                                        <td>{purchase.quantity}</td>
                                        <td>
                                            {user?.role === 'admin' ? (
                                                // Admin vê valor bruto
                                                `R$ ${parseFloat(purchase.total_amount).toFixed(2)}`
                                            ) : (
                                                // Noivos veem valor após taxa administrativa
                                                `R$ ${parseFloat(purchase.couple_amount || 0).toFixed(2)}`
                                            )}
                                        </td>
                                        <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {purchase.message || '-'}
                                        </td>
                                        <td>{getStatusBadge(purchase.payment_status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Purchases;
