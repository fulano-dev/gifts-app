import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ active }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-title">
                Painel - {user?.name}
            </div>
            <ul className="sidebar-menu">
                <li>
                    <Link to="/painel" className={active === 'dashboard' ? 'active' : ''}>
                        📊 Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/painel/convidados" className={active === 'guests' ? 'active' : ''}>
                        👥 Convidados
                    </Link>
                </li>
                <li>
                    <Link to="/painel/experiencias" className={active === 'experiences' ? 'active' : ''}>
                        🎁 Experiências
                    </Link>
                </li>
                <li>
                    <Link to="/painel/compras" className={active === 'purchases' ? 'active' : ''}>
                        💰 Presentes Recebidos
                    </Link>
                </li>
                <li>
                    <Link to="/painel/saques" className={active === 'withdrawals' ? 'active' : ''}>
                        💸 Saques
                    </Link>
                </li>
                {user?.role === 'admin' && (
                    <>
                        <li>
                            <Link to="/painel/usuarios" className={active === 'users' ? 'active' : ''}>
                                👤 Usuários
                            </Link>
                        </li>
                        <li>
                            <Link to="/painel/configuracoes" className={active === 'settings' ? 'active' : ''}>
                                ⚙️ Configurações
                            </Link>
                        </li>
                    </>
                )}
                <li style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                    <Link to="/" style={{color: '#10b981'}}>
                        🏠 Ver Site
                    </Link>
                </li>
                <li>
                    <button 
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '12px 15px',
                            width: '100%',
                            textAlign: 'left',
                            borderRadius: '6px'
                        }}
                    >
                        🚪 Sair
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
