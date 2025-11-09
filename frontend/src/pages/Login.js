import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Login realizado com sucesso!');
            navigate('/painel');
        } catch (error) {
            toast.error('Email ou senha inválidos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="header">
                <div className="container header-content">
                    <Link to="/" className="logo">💍 Nosso Casamento</Link>
                    <nav className="nav">
                        <Link to="/">Início</Link>
                    </nav>
                </div>
            </header>

            <section className="section" style={{paddingTop: '60px', paddingBottom: '80px'}}>
                <div className="container">
                    <div style={{textAlign: 'center', marginBottom: '40px'}}>
                        <h2 className="section-title">Login - Painel Administrativo</h2>
                        <p style={{fontSize: '18px', color: '#666', marginTop: '10px'}}>❤️</p>
                    </div>
                    
                    <div className="login-container">
                        <div className="login-card">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Senha</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    style={{width: '100%', marginTop: '10px'}}
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Entrando...' : '🔐 Entrar'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
