import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function Settings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/painel');
            return;
        }
        loadSettings();
    }, [user, navigate]);

    const loadSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(response.data);
        } catch (error) {
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, value) => {
        try {
            await api.put('/settings', { key, value });
            toast.success('Configuração atualizada com sucesso');
            loadSettings();
        } catch (error) {
            toast.error('Erro ao atualizar configuração');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Atualizar todas as configurações
        Object.keys(settings).forEach(key => {
            handleUpdate(key, settings[key]);
        });
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
            <Sidebar active="settings" />
            <div className="main-content">
                <h1>Configurações do Sistema</h1>

                <div className="card" style={{maxWidth: '800px'}}>
                    <form onSubmit={handleSubmit}>
                        <h3 style={{marginBottom: '20px'}}>Informações do Casamento</h3>
                        
                        <div className="form-group">
                            <label>Nome do Noivo(a) 1</label>
                            <input
                                type="text"
                                value={settings.couple_name_1 || ''}
                                onChange={(e) => setSettings({...settings, couple_name_1: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nome do Noivo(a) 2</label>
                            <input
                                type="text"
                                value={settings.couple_name_2 || ''}
                                onChange={(e) => setSettings({...settings, couple_name_2: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Data do Casamento</label>
                            <input
                                type="date"
                                value={settings.wedding_date || ''}
                                onChange={(e) => setSettings({...settings, wedding_date: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Horário</label>
                            <input
                                type="time"
                                value={settings.wedding_time || ''}
                                onChange={(e) => setSettings({...settings, wedding_time: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Local</label>
                            <input
                                type="text"
                                value={settings.wedding_location || ''}
                                onChange={(e) => setSettings({...settings, wedding_location: e.target.value})}
                            />
                        </div>

                        <h3 style={{marginTop: '40px', marginBottom: '20px'}}>Configurações Financeiras</h3>

                        <div className="form-group">
                            <label>Taxa Administrativa (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={settings.admin_fee_percentage || ''}
                                onChange={(e) => setSettings({...settings, admin_fee_percentage: e.target.value})}
                            />
                            <small style={{color: '#666', display: 'block', marginTop: '8px'}}>
                                💡 Esta é a taxa que você (admin) cobra sobre cada transação.
                            </small>
                            <small style={{color: '#666', display: 'block', marginTop: '4px'}}>
                                Exemplo: Taxa de 10% em presente de R$ 100,00 = Seu lucro: R$ 10,00 | Noivos recebem: R$ 90,00
                            </small>
                        </div>

                        <div style={{background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '15px', marginTop: '20px'}}>
                            <p style={{margin: '0 0 10px 0', color: '#0369a1', fontWeight: '600'}}>
                                ℹ️ Sobre as Taxas do MercadoPago
                            </p>
                            <p style={{margin: 0, color: '#0c4a6e', fontSize: '14px'}}>
                                A taxa do MercadoPago é calculada automaticamente pela API e aparece apenas no seu dashboard admin.
                                Os noivos não veem essa informação, apenas o valor disponível para saque após a sua taxa administrativa.
                            </p>
                        </div>

                        <button type="submit" className="btn btn-success" style={{width: '100%', marginTop: '20px'}}>
                            Salvar Configurações
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Settings;
