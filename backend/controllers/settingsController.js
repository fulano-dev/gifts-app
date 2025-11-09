const db = require('../config/database');

// Obter configurações
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM settings_WED');
        
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
        });

        res.json(settingsObj);
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
};

// Atualizar configuração
exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        await db.query(
            'INSERT INTO settings_WED (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, value, value]
        );

        res.json({ message: 'Configuração atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar configuração:', error);
        res.status(500).json({ error: 'Erro ao atualizar configuração' });
    }
};

// Obter informações do casamento (público)
exports.getWeddingInfo = async (req, res) => {
    try {
        const [settings] = await db.query(`
            SELECT * FROM settings_WED 
            WHERE setting_key IN ('couple_name_1', 'couple_name_2', 'wedding_date', 'wedding_time', 'wedding_location')
        `);
        
        const info = {};
        settings.forEach(setting => {
            info[setting.setting_key] = setting.setting_value;
        });

        res.json(info);
    } catch (error) {
        console.error('Erro ao buscar informações do casamento:', error);
        res.status(500).json({ error: 'Erro ao buscar informações do casamento' });
    }
};
