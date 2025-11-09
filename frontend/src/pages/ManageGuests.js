import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function ManageGuests() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        confirmed: false
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadGuests();
    }, [user, navigate]);

    const loadGuests = async () => {
        try {
            const response = await api.get('/guests');
            setGuests(response.data);
        } catch (error) {
            toast.error('Erro ao carregar convidados');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (guest = null) => {
        if (guest) {
            setEditingGuest(guest);
            setFormData({
                name: guest.name,
                email: guest.email || '',
                phone: guest.phone || '',
                confirmed: guest.confirmed
            });
        } else {
            setEditingGuest(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                confirmed: false
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingGuest(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingGuest) {
                await api.put(`/guests/${editingGuest.id}`, formData);
                toast.success('Convidado atualizado com sucesso');
            } else {
                await api.post('/guests', formData);
                toast.success('Convidado criado com sucesso');
            }
            closeModal();
            loadGuests();
        } catch (error) {
            toast.error('Erro ao salvar convidado');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este convidado?')) {
            return;
        }

        try {
            await api.delete(`/guests/${id}`);
            toast.success('Convidado deletado com sucesso');
            loadGuests();
        } catch (error) {
            toast.error('Erro ao deletar convidado');
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
            <Sidebar active="guests" />
            <div className="main-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                    <h1>Gerenciar Convidados</h1>
                    <button onClick={() => openModal()} className="btn btn-primary">
                        + Adicionar Convidado
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Confirmado</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guests.map(guest => (
                                <tr key={guest.id}>
                                    <td>{guest.name}</td>
                                    <td>{guest.email || '-'}</td>
                                    <td>{guest.phone || '-'}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            background: guest.confirmed ? '#10b981' : '#ef4444',
                                            color: 'white',
                                            fontSize: '12px'
                                        }}>
                                            {guest.confirmed ? 'Sim' : 'Não'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => openModal(guest)} 
                                            className="btn btn-primary"
                                            style={{marginRight: '10px', padding: '6px 12px', fontSize: '14px'}}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(guest.id)} 
                                            className="btn btn-danger"
                                            style={{padding: '6px 12px', fontSize: '14px'}}
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingGuest ? 'Editar Convidado' : 'Novo Convidado'}</h2>
                                <button className="modal-close" onClick={closeModal}>×</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nome *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                        <input
                                            type="checkbox"
                                            checked={formData.confirmed}
                                            onChange={(e) => setFormData({...formData, confirmed: e.target.checked})}
                                            style={{marginRight: '10px', width: 'auto'}}
                                        />
                                        Presença confirmada
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

export default ManageGuests;
