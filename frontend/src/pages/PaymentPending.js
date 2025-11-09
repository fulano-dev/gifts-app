import React from 'react';
import { Link } from 'react-router-dom';

function PaymentPending() {
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
                            <div style={{fontSize: '80px', marginBottom: '20px'}}>⏳</div>
                            <h2>Pagamento Pendente</h2>
                            <p style={{fontSize: '18px', margin: '20px 0', color: '#666'}}>
                                Seu pagamento está sendo processado. Dependendo da forma de pagamento escolhida, 
                                pode levar alguns minutos ou até 2 dias úteis para ser confirmado.
                            </p>
                            <p style={{fontSize: '16px', margin: '20px 0', color: '#f59e0b', fontWeight: 'bold'}}>
                                ⚠️ Aguarde a confirmação por email
                            </p>
                            <div style={{
                                background: '#fffbeb', 
                                border: '1px solid #fcd34d', 
                                borderRadius: '8px', 
                                padding: '20px',
                                marginTop: '20px',
                                textAlign: 'left'
                            }}>
                                <h3 style={{margin: '0 0 10px 0', color: '#92400e'}}>📋 O que fazer agora?</h3>
                                <ul style={{margin: 0, paddingLeft: '20px', color: '#78350f'}}>
                                    <li>Aguarde o processamento do pagamento</li>
                                    <li>Você receberá um email assim que for confirmado</li>
                                    <li>Pagamentos via boleto/PIX podem levar até 2 dias úteis</li>
                                    <li>Não é necessário fazer um novo pagamento</li>
                                </ul>
                            </div>
                            <p style={{fontSize: '18px', marginTop: '30px', color: '#667eea', fontWeight: 'bold'}}>
                                Vanessa & Guilherme agradecem pela paciência! 💝
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

export default PaymentPending;
