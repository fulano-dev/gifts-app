import React from 'react';
import { Link } from 'react-router-dom';

function PaymentSuccess() {
    return (
        <div>
            <header className="header">
                <div className="container header-content">
                    <Link to="/" className="logo">💍 Nosso Casamento</Link>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
                        <div className="card">
                            <div style={{fontSize: '80px', marginBottom: '20px'}}>✅</div>
                            <h2>Pagamento Confirmado!</h2>
                            <p style={{fontSize: '18px', margin: '20px 0', color: '#666'}}>
                                Muito obrigado pelo presente! Seu pagamento foi confirmado com sucesso.
                                Em breve você receberá um email de confirmação.
                            </p>
                            <p style={{fontSize: '18px', color: '#667eea', fontWeight: 'bold'}}>
                                Vanessa & Guilherme agradecem de coração! ❤️
                            </p>
                            <div style={{marginTop: '30px'}}>
                                <Link to="/" className="btn btn-primary">
                                    Voltar ao Início
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default PaymentSuccess;
