import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

function Gifts() {
    const [experiences, setExperiences] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadExperiences();
    }, []);

    const loadExperiences = async () => {
        try {
            const response = await api.get('/experiences?active=true');
            setExperiences(response.data);
        } catch (error) {
            console.error('Erro ao carregar experiências:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (experience) => {
        const existing = cart.find(item => item.experience_id === experience.id);
        
        if (existing) {
            if (existing.quantity >= experience.available_quotas) {
                toast.error('Quantidade máxima atingida');
                return;
            }
            setCart(cart.map(item =>
                item.experience_id === experience.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                experience_id: experience.id,
                title: experience.title,
                price: experience.price,
                quantity: 1
            }]);
        }
        toast.success('Adicionado ao carrinho!');
    };

    const removeFromCart = (experienceId) => {
        setCart(cart.filter(item => item.experience_id !== experienceId));
    };

    const updateQuantity = (experienceId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(experienceId);
            return;
        }

        const experience = experiences.find(e => e.id === experienceId);
        if (newQuantity > experience.available_quotas) {
            toast.error('Quantidade não disponível');
            return;
        }

        setCart(cart.map(item =>
            item.experience_id === experienceId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (!guestName || !guestEmail) {
            toast.error('Preencha seu nome e email');
            return;
        }

        try {
            const response = await api.post('/payments/create', {
                items: cart,
                guest_name: guestName,
                guest_email: guestEmail,
                message: message
            });

            // Redirecionar para o Mercado Pago
            window.location.href = response.data.init_point;
        } catch (error) {
            toast.error('Erro ao processar pagamento');
            console.error(error);
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
                    <Link to="/" className="logo">💍 Nosso Casamento</Link>
                    <nav className="nav">
                        <Link to="/">Início</Link>
                        <Link to="/confirmacao">Confirmar Presença</Link>
                    </nav>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Experiências da Lua de Mel 🌙</h2>
                    
                    {/* Banner de Formas de Pagamento */}
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>
                            💳 Formas de Pagamento Disponíveis
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '30px',
                            flexWrap: 'wrap',
                            fontSize: '16px'
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{fontSize: '24px'}}>📱</span>
                                <span>PIX à vista</span>
                            </div>
                            <div style={{
                                width: '2px',
                                height: '30px',
                                background: 'rgba(255,255,255,0.3)'
                            }}></div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{fontSize: '24px'}}>💳</span>
                                <span>Cartão de Crédito em até 12x com juros</span>
                            </div>
                        </div>
                    </div>
                    
                    {cart.length > 0 && (
                        <div style={{
                            background: '#667eea', 
                            color: 'white', 
                            padding: '15px 20px', 
                            borderRadius: '8px', 
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <strong style={{fontSize: '16px'}}>
                                {cart.length} item(ns) no carrinho - Total: R$ {getCartTotal().toFixed(2)}
                            </strong>
                            <button 
                                onClick={() => setShowCheckout(true)} 
                                className="btn btn-primary"
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    padding: '10px 20px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    )}

                    {experiences.length === 0 ? (
                        <div className="empty-state">
                            <h3>Nenhuma experiência disponível no momento</h3>
                            <p>Em breve teremos novidades!</p>
                        </div>
                    ) : (
                        <div className="cards-grid">
                            {experiences.map(exp => (
                                <div key={exp.id} className="card">
                                    {exp.image_url && (
                                        <img src={exp.image_url} alt={exp.title} />
                                    )}
                                    <div>
                                        <h3>{exp.title}</h3>
                                        <p>{exp.description}</p>
                                        <div className="card-price">R$ {parseFloat(exp.price).toFixed(2)}</div>
                                        <div style={{
                                            fontSize: '13px', 
                                            color: '#10b981', 
                                            marginTop: '5px',
                                            marginBottom: '8px'
                                        }}>
                                            💳 Ou em até 12x de R$ {(parseFloat(exp.price) / 12).toFixed(2)} sem juros
                                        </div>
                                        <div className="card-quotas">
                                            {exp.available_quotas} de {exp.total_quotas} quotas disponíveis
                                        </div>
                                        
                                        {/* Lista de presenteadores */}
                                        {exp.givers && exp.givers.length > 0 && (
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '10px',
                                                background: '#f0f9ff',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}>
                                                <div style={{fontWeight: 'bold', color: '#0369a1', marginBottom: '6px'}}>
                                                    💝 Presenteado por:
                                                </div>
                                                <div style={{color: '#0c4a6e'}}>
                                                    {exp.givers.map((giver, index) => (
                                                        <div key={index} style={{marginBottom: '3px'}}>
                                                            • {giver.guest_name} ({giver.quantity}x)
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={() => addToCart(exp)}
                                            className="btn btn-success"
                                            style={{width: '100%', marginTop: '10px'}}
                                            disabled={exp.available_quotas === 0}
                                        >
                                            {exp.available_quotas === 0 ? '❌ Esgotado' : '🎁 Presentear'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {showCheckout && (
                <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Finalizar Presente</h2>
                            <button className="modal-close" onClick={() => setShowCheckout(false)}>×</button>
                        </div>

                        <div>
                            <h3>Itens do Carrinho:</h3>
                            {cart.map(item => (
                                <div key={item.experience_id} style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div>
                                            <strong>{item.title}</strong>
                                            <div>R$ {parseFloat(item.price).toFixed(2)} x {item.quantity}</div>
                                        </div>
                                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                            <button 
                                                onClick={() => updateQuantity(item.experience_id, item.quantity - 1)}
                                                className="btn"
                                                style={{padding: '5px 10px'}}
                                            >-</button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.experience_id, item.quantity + 1)}
                                                className="btn"
                                                style={{padding: '5px 10px'}}
                                            >+</button>
                                            <button 
                                                onClick={() => removeFromCart(item.experience_id)}
                                                className="btn btn-danger"
                                                style={{padding: '5px 10px'}}
                                            >×</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div style={{padding: '15px 0', fontSize: '20px', fontWeight: 'bold'}}>
                                Total: R$ {getCartTotal().toFixed(2)}
                            </div>

                            <div className="form-group">
                                <label>Seu Nome *</label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Nome completo"
                                />
                            </div>

                            <div className="form-group">
                                <label>Seu Email *</label>
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mensagem para os noivos (opcional)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Deixe uma mensagem carinhosa..."
                                />
                            </div>

                            <button 
                                onClick={handleCheckout}
                                className="btn btn-success"
                                style={{width: '100%'}}
                            >
                                Pagar com Mercado Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Gifts;
