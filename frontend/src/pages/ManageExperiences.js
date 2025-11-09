import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function ManageExperiences() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExp, setEditingExp] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        price: '',
        total_quotas: '',
        available_quotas: '',
        active: true
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }
        
        if (user) {
            loadExperiences();
        }
    }, [user, authLoading, navigate]);

    const loadExperiences = async () => {
        try {
            const response = await api.get('/experiences');
            setExperiences(response.data);
        } catch (error) {
            toast.error('Erro ao carregar experiências');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (exp = null) => {
        if (exp) {
            setEditingExp(exp);
            setFormData({
                title: exp.title,
                description: exp.description || '',
                image_url: exp.image_url || '',
                price: exp.price,
                total_quotas: exp.total_quotas,
                available_quotas: exp.available_quotas,
                active: exp.active
            });
        } else {
            setEditingExp(null);
            setFormData({
                title: '',
                description: '',
                image_url: '',
                price: '',
                total_quotas: '',
                available_quotas: '',
                active: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingExp(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingExp) {
                await api.put(`/experiences/${editingExp.id}`, formData);
                toast.success('Experiência atualizada com sucesso');
            } else {
                await api.post('/experiences', {
                    ...formData,
                    available_quotas: formData.total_quotas
                });
                toast.success('Experiência criada com sucesso');
            }
            closeModal();
            loadExperiences();
        } catch (error) {
            toast.error('Erro ao salvar experiência');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar esta experiência?')) {
            return;
        }

        try {
            await api.delete(`/experiences/${id}`);
            toast.success('Experiência deletada com sucesso');
            loadExperiences();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar experiência');
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
            <Sidebar active="experiences" />
            <div className="main-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                    <h1>Gerenciar Experiências</h1>
                    <button onClick={() => openModal()} className="btn btn-primary">
                        + Adicionar Experiência
                    </button>
                </div>

                <div className="cards-grid">
                    {experiences.map(exp => (
                        <div key={exp.id} className="card">
                            {exp.image_url && (
                                <img src={exp.image_url} alt={exp.title} />
                            )}
                            <h3>{exp.title}</h3>
                            <p>{exp.description}</p>
                            <div className="card-price">R$ {parseFloat(exp.price).toFixed(2)}</div>
                            <div className="card-quotas">
                                {exp.available_quotas} de {exp.total_quotas} disponíveis
                            </div>
                            <div style={{marginTop: '10px'}}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    background: exp.active ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    fontSize: '12px'
                                }}>
                                    {exp.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                                <button 
                                    onClick={() => openModal(exp)} 
                                    className="btn btn-primary"
                                    style={{flex: 1}}
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(exp.id)} 
                                    className="btn btn-danger"
                                    style={{flex: 1}}
                                >
                                    Deletar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingExp ? 'Editar Experiência' : 'Nova Experiência'}</h2>
                                <button className="modal-close" onClick={closeModal}>×</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Título *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descrição</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>URL da Imagem</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Preço (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Total de Quotas *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.total_quotas}
                                        onChange={(e) => setFormData({...formData, total_quotas: e.target.value})}
                                        required
                                    />
                                </div>

                                {editingExp && (
                                    <div className="form-group">
                                        <label>Quotas Disponíveis</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.available_quotas}
                                            onChange={(e) => setFormData({...formData, available_quotas: e.target.value})}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                            style={{marginRight: '10px', width: 'auto'}}
                                        />
                                        Ativo
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-success" style={{width: '100%'}}>
                                    Salvar
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageExperiences;
