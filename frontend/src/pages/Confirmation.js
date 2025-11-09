import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

function Confirmation() {
    const [searchTerm, setSearchTerm] = useState('');
    const [guests, setGuests] = useState([]);
    const [selectedGuests, setSelectedGuests] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            searchGuests();
        } else {
            setGuests([]);
            setShowDropdown(false);
        }
    }, [searchTerm]);

    const searchGuests = async () => {
        try {
            const response = await api.get(`/guests/search?search=${searchTerm}`);
            setGuests(response.data.filter(g => !selectedGuests.find(sg => sg.id === g.id)));
            setShowDropdown(true);
        } catch (error) {
            console.error('Erro ao buscar convidados:', error);
        }
    };

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

        try {
            await api.post('/guests/confirm', {
                guestIds: selectedGuests.map(g => g.id)
            });
            
            toast.success('Presença confirmada com sucesso! Verifique seu email.');
            setSelectedGuests([]);
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

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Confirmar Presença</h2>
                    
                    <div style={{maxWidth: '600px', margin: '0 auto'}}>
                        <div className="card">
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
                                <div>
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

                            <button 
                                onClick={confirmPresence} 
                                className="btn btn-success"
                                style={{width: '100%', marginTop: '20px'}}
                            >
                                Confirmar Presença
                            </button>

                            <p style={{marginTop: '20px', textAlign: 'center', color: '#666'}}>
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
