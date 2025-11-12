import React from 'react';

function Footer() {
    return (
        <footer style={{
            background: '#1f2937',
            color: '#9ca3af',
            padding: '30px 20px',
            textAlign: 'center',
            marginTop: '60px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                }}>
                    © 2025{' '}
                    <a 
                        href="https://pontoevirgula.dev.br" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#818cf8'}
                        onMouseLeave={(e) => e.target.style.color = '#667eea'}
                    >
                        Ponto e Vírgula Software Ltda
                    </a>
                    . Todos os direitos reservados.
                </p>
                <p style={{
                    margin: '0',
                    fontSize: '13px',
                    color: '#6b7280'
                }}>
                    CNPJ: 63.606.952/0001-73
                </p>
            </div>
        </footer>
    );
}

export default Footer;
