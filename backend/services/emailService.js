const axios = require('axios');

const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await axios.post(
            `${process.env.BREVO_API_URL}/smtp/email`,
            {
                sender: {
                    name: 'Casamento Vanessa & Guilherme',
                    email: process.env.EMAIL_FROM
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Email enviado com sucesso:', to);
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar email:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { sendEmail };
