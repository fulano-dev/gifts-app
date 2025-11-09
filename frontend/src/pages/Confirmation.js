import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

function Confirmation() {
    const [searchTerm, setSearchTerm] = useState('');
    const [guests, setGuests] = useState([]);
    const [selectedGuests, setSelectedGuests] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [email, setEmail] = useState('');

    const searchGuests = async () => {
        try {
            const response = await api.get(`/guests/search?search=${searchTerm}`);
            setGuests(response.data.filter(g => !selectedGuests.find(sg => sg.id === g.id)));
            setShowDropdown(true);
        } catch (error) {
            console.error('Erro ao buscar convidados:', error);
        }
    };

    useEffect(() => {
        if (searchTerm.length >= 2) {
            searchGuests();
        } else {
            setGuests([]);
            setShowDropdown(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const selectGuest = (guest) => {
        setSelectedGuests([...selectedGuests, guest]);
        setSearchTerm('');
        setShowDropdown(false);
        setGuests([]);
    };

    const removeGuest = (guestId) => {
        setSelectedGuests(selectedGuests.filter(g => g.id !== guestId));
    };

    const confirmPresence = async () => {
        if (selectedGuests.length === 0) {
            toast.error('Selecione pelo menos um convidado');
            return;
        }

        if (!email || !email.includes('@')) {
            toast.error('Por favor, insira um email válido');
            return;
        }

        try {
            await api.post('/guests/confirm', {
                guestIds: selectedGuests.map(g => g.id),
                email: email
            });
            
            toast.success('Presença confirmada com sucesso! Verifique seu email.');
            setSelectedGuests([]);
            setEmail('');
        } catch (error) {
            toast.error('Erro ao confirmar presença');
            console.error(error);
        }
    };

    return (
        <div>
            <header className="header">
                <div className="container header-content">
                    <Link to="/" className="logo">💍 Nosso Casamento</Link>
                    <nav className="nav">
                        <Link to="/">Início</Link>
                        <Link to="/presentes">Presentes</Link>
                    </nav>
                </div>
            </header>

            <section className="section" style={{paddingTop: '60px', paddingBottom: '80px'}}>
                <div className="container">
                    <div style={{textAlign: 'center', marginBottom: '40px'}}>
                        <h2 className="section-title">Confirmar Presença</h2>
                        <p style={{fontSize: '18px', color: '#666', marginTop: '10px'}}>❤️</p>
                    </div>
                    
                    <div className="confirmation-container">
                        <div className="confirmation-card">
                            <div className="form-group">
                                <label>Digite seu nome</label>
                                <div className="autocomplete">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Ex: João Silva"
                                        autoComplete="off"
                                    />
                                    {showDropdown && guests.length > 0 && (
                                        <div className="autocomplete-list">
                                            {guests.map(guest => (
                                                <div
                                                    key={guest.id}
                                                    className="autocomplete-item"
                                                    onClick={() => selectGuest(guest)}
                                                >
                                                    {guest.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedGuests.length > 0 && (
                                <div className="form-group">
                                    <label>Convidados selecionados:</label>
                                    <div className="selected-guests">
                                        {selectedGuests.map(guest => (
                                            <div key={guest.id} className="guest-tag">
                                                {guest.name}
                                                <button onClick={() => removeGuest(guest.id)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Seu Email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    required
                                />
                                <small style={{color: '#888', marginTop: '8px', display: 'block', fontSize: '14px'}}>
                                    Enviaremos os detalhes do evento para este email
                                </small>
                            </div>

                            <button 
                                onClick={confirmPresence} 
                                className="btn btn-success"
                                style={{width: '100%', marginTop: '10px'}}
                            >
                                ✨ Confirmar Presença
                            </button>

                            <p style={{marginTop: '25px', textAlign: 'center', color: '#888', fontSize: '15px', lineHeight: '1.6'}}>
                                Após confirmar, você receberá um email com todos os detalhes do evento!
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Confirmation;
