import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function Users() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'couple'
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/painel');
            return;
        }
        loadUsers();
    }, [user, navigate]);

    const loadUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await api.post('/auth/users', formData);
            toast.success('Usuário criado com sucesso');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'couple' });
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao criar usuário');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) {
            return;
        }

        try {
            await api.delete(`/auth/users/${id}`);
            toast.success('Usuário deletado com sucesso');
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao deletar usuário');
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
            <Sidebar active="users" />
            <div className="main-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                    <h1>Gerenciar Usuários</h1>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        + Adicionar Usuário
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Função</th>
                                <th>Chave PIX</th>
                                <th>Criado em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            background: u.role === 'admin' ? '#667eea' : '#10b981',
                                            color: 'white',
                                            fontSize: '12px'
                                        }}>
                                            {u.role === 'admin' ? 'Admin' : 'Noivos'}
                                        </span>
                                    </td>
                                    <td>{u.pix_key || '-'}</td>
                                    <td>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(u.id)} 
                                            className="btn btn-danger"
                                            style={{padding: '6px 12px', fontSize: '14px'}}
                                            disabled={u.id === user.id}
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
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Novo Usuário</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
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
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Senha *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Função *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        required
                                    >
                                        <option value="couple">Noivos</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-success" style={{width: '100%'}}>
                                    Criar Usuário
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;
