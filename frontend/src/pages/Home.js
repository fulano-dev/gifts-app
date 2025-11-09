import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
    const [weddingInfo, setWeddingInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWeddingInfo();
    }, []);

    const loadWeddingInfo = async () => {
        try {
            const response = await api.get('/settings/wedding');
            setWeddingInfo(response.data);
        } catch (error) {
            console.error('Erro ao carregar informações:', error);
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
        <div>
            <header className="header">
                <div className="container header-content">
                    <Link to="/" className="logo">💍 {weddingInfo.couple_name_1} & {weddingInfo.couple_name_2}</Link>
                    <nav className="nav">
                        <Link to="/confirmacao">Confirmar Presença</Link>
                        <Link to="/presentes">Presentes</Link>
                    </nav>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <div className="wedding-rings">💍</div>
                    <h1>{weddingInfo.couple_name_1} & {weddingInfo.couple_name_2}</h1>
                    <p className="subtitle">Vamos nos casar!</p>
                    
                    <div className="divider">❤️</div>
                    
                    <div className="hero-info">
                        <p>📅 {weddingInfo.wedding_date ? new Date(weddingInfo.wedding_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</p>
                        <p>🕐 {weddingInfo.wedding_time}</p>
                        <p>📍 {weddingInfo.wedding_location}</p>
                    </div>

                    <div className="divider">❤️</div>

                    <div className="hero-buttons">
                        <Link to="/confirmacao" className="btn btn-primary">
                            ✓ Confirmar Presença
                        </Link>
                        <Link to="/presentes" className="btn btn-secondary">
                            🎁 Lista de Presentes
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Celebre Conosco</h2>
                    <div className="celebration-text">
                        <p>Estamos muito felizes em compartilhar este momento especial com você!</p>
                        <p>Confirme sua presença e, se desejar, presenteie-nos com uma experiência inesquecível para nossa lua de mel.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
