import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

function Home() {
    const [weddingInfo, setWeddingInfo] = useState({});
    const [messages, setMessages] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWeddingInfo();
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Auto-slide a cada 5 segundos
        if (messages.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % messages.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [messages]);

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

    // Função para embaralhar array
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const loadMessages = async () => {
        try {
            const response = await api.get('/payments/messages');
            // Embaralha as mensagens antes de salvar no estado
            setMessages(shuffleArray(response.data));
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % messages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + messages.length) % messages.length);
    };

    // Função para substituir ? por emojis de coração
    const fixEmojis = (text) => {
        if (!text) return '';
        // Substitui ? isolados ou múltiplos por corações
        return text.replace(/\?+/g, '💖');
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

            {/* Carrossel de Mensagens dos Presenteadores */}
            {messages.length > 0 && (
                <section className="section" style={{background: '#f9fafb'}}>
                    <div className="container">
                        <h2 className="section-title">💌 Mensagens dos Presenteadores</h2>
                        
                        <div style={{
                            position: 'relative',
                            maxWidth: '800px',
                            margin: '0 auto',
                            padding: '20px'
                        }}>
                            {/* Carrossel */}
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '40px 60px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {/* Aspas decorativas */}
                                <div style={{
                                    fontSize: '48px',
                                    color: '#667eea',
                                    opacity: 0.3,
                                    position: 'absolute',
                                    top: '10px',
                                    left: '20px'
                                }}>
                                    "
                                </div>
                                
                                {/* Mensagem */}
                                <div style={{
                                    fontSize: '18px',
                                    color: '#374151',
                                    marginBottom: '20px',
                                    lineHeight: '1.6',
                                    fontStyle: 'italic',
                                    textAlign: 'center'
                                }}>
                                    {fixEmojis(messages[currentSlide].message)}
                                </div>
                                
                                {/* Autor e Presente */}
                                <div style={{
                                    textAlign: 'center',
                                    borderTop: '2px solid #e5e7eb',
                                    paddingTop: '15px'
                                }}>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: '#667eea',
                                        fontSize: '16px'
                                    }}>
                                        {messages[currentSlide].guest_name}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        marginTop: '5px'
                                    }}>
                                        🎁 {messages[currentSlide].experience_title}
                                    </div>
                                </div>
                            </div>

                            {/* Botões de Navegação */}
                            <button
                                onClick={prevSlide}
                                style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'white',
                                    border: '2px solid #667eea',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: '#667eea',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ‹
                            </button>
                            
                            <button
                                onClick={nextSlide}
                                style={{
                                    position: 'absolute',
                                    right: '0',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'white',
                                    border: '2px solid #667eea',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: '#667eea',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ›
                            </button>

                            {/* Indicadores */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '20px'
                            }}>
                                {messages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: index === currentSlide ? '#667eea' : '#d1d5db',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Celebre Conosco</h2>
                    <div className="celebration-text">
                        <p>Estamos muito felizes em compartilhar este momento especial com você!</p>
                        <p>Confirme sua presença e, se desejar, presenteie-nos com uma experiência inesquecível para nossa lua de mel.</p>
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
}

export default Home;
