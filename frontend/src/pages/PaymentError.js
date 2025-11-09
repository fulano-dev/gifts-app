import React from 'react';
import { Link } from 'react-router-dom';

function PaymentError() {
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
                            <div style={{fontSize: '80px', marginBottom: '20px'}}>❌</div>
                            <h2>Erro no Pagamento</h2>
                            <p style={{fontSize: '18px', margin: '20px 0', color: '#666'}}>
                                Ocorreu um problema ao processar seu pagamento. 
                                Por favor, tente novamente ou entre em contato conosco.
                            </p>
                            <div style={{marginTop: '30px'}}>
                                <Link to="/presentes" className="btn btn-primary">
                                    Tentar Novamente
                                </Link>
                                <Link to="/" className="btn btn-secondary">
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

export default PaymentError;
