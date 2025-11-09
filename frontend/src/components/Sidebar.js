import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ active }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isOpen ? '✕' : '☰'} Menu
            </button>
            
            <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-title">
                        💍 Painel Administrativo
                    </div>
                    <div className="sidebar-user">
                        👤 {user?.name}
                    </div>
                </div>
                
                <ul className="sidebar-menu">
                    <li>
                        <Link 
                            to="/painel" 
                            className={active === 'dashboard' ? 'active' : ''}
                            onClick={closeSidebar}
                        >
                            <span className="menu-icon">📊</span>
                            <span className="menu-text">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/painel/convidados" 
                            className={active === 'guests' ? 'active' : ''}
                            onClick={closeSidebar}
                        >
                            <span className="menu-icon">👥</span>
                            <span className="menu-text">Convidados</span>
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/painel/experiencias" 
                            className={active === 'experiences' ? 'active' : ''}
                            onClick={closeSidebar}
                        >
                            <span className="menu-icon">🎁</span>
                            <span className="menu-text">Experiências</span>
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/painel/compras" 
                            className={active === 'purchases' ? 'active' : ''}
                            onClick={closeSidebar}
                        >
                            <span className="menu-icon">💰</span>
                            <span className="menu-text">Presentes</span>
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/painel/saques" 
                            className={active === 'withdrawals' ? 'active' : ''}
                            onClick={closeSidebar}
                        >
                            <span className="menu-icon">💸</span>
                            <span className="menu-text">Saques</span>
                        </Link>
                    </li>
                    {user?.role === 'admin' && (
                        <>
                            <li>
                                <Link 
                                    to="/painel/usuarios" 
                                    className={active === 'users' ? 'active' : ''}
                                    onClick={closeSidebar}
                                >
                                    <span className="menu-icon">👤</span>
                                    <span className="menu-text">Usuários</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/painel/configuracoes" 
                                    className={active === 'settings' ? 'active' : ''}
                                    onClick={closeSidebar}
                                >
                                    <span className="menu-icon">⚙️</span>
                                    <span className="menu-text">Configurações</span>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-link-home" onClick={closeSidebar}>
                        <span className="menu-icon">🏠</span>
                        <span className="menu-text">Ver Site</span>
                    </Link>
                    <button 
                        onClick={() => { handleLogout(); closeSidebar(); }}
                        className="sidebar-logout"
                    >
                        <span className="menu-icon">🚪</span>
                        <span className="menu-text">Sair</span>
                    </button>
                </div>
            </div>

            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
        </>
    );
}

export default Sidebar;
