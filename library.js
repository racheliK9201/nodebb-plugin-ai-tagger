'use strict';

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');
const controllers = require('./lib/controllers');

const routeHelpers = require.main.require('./src/routes/helpers');

const DEFAULT_PROMPT = 'צור בין תגית אחת לחמש תגיות המתארות במדויק את נושא הפוסט. כל תגית צריכה להיות באורך 3 עד 15 תווים ויכולה לכלול יותר ממילה אחת. התגיות צריכות להיות רלוונטיות לנושא המרכזי, שימושיות לחיפוש בגוגל, וללא מילות קישור מיותרות (כמו "של", "עם", "על"). בחר רק את המילים החשובות ביותר שמייצגות את נושא הפוסט באופן ברור וספציפי. החזר רק את רשימת התגיות, מופרדות בפסיק, ללא טקסט נוסף.';

const plugin = {
    settings: {
        apiKey: '',
        customPrompt: DEFAULT_PROMPT
    }
};

// Add admin scripts and styles
plugin.addAdminScripts = async () => {
    return [
        'admin/plugins/ai-tagger.js'
    ];
};

plugin.init = async (params) => {
	const { router, middleware } = params;

	// Load existing settings
	const settings = await meta.settings.get('ai-tagger');
	plugin.settings = Object.assign({
		apiKey: '',
		customPrompt: DEFAULT_PROMPT,
	}, settings);

	// Setup Admin Page Route
	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/ai-tagger', middleware.admin.buildHeader, controllers.renderAdminPage);
	routeHelpers.setupAdminPageRoute(router, '/api/admin/plugins/ai-tagger', [], controllers.renderAdminPage);

	// Setup API Route for tag generation
	router.post('/api/ai-tagger/generate', [], controllers.generateTags);

	// Socket listeners for admin settings
	const SocketAdmin = require.main.require('./src/socket.io/admin');
	
	// Handler for getting settings
	SocketAdmin.settings.getAITaggerSettings = async function (socket, data) {
		try {
			winston.verbose('[ai-tagger] Attempting to retrieve settings');
			const settings = await meta.settings.get('ai-tagger');
			winston.info('[ai-tagger] Settings retrieved:', settings);
			return settings || plugin.settings;
		} catch (err) {
			winston.error('[ai-tagger] Error getting settings:', err);
			throw err;
		}
	};

	// Handler for setting settings
	SocketAdmin.settings.saveAITaggerSettings = async function (socket, data) {
		try {
			winston.info('[ai-tagger] Attempting to save settings:', {
				hasApiKey: !!data.apiKey,
				hasCustomPrompt: !!data.customPrompt
			});

			const settings = {
				apiKey: data.apiKey || '',
				customPrompt: data.customPrompt || DEFAULT_PROMPT
			};

			await meta.settings.set('ai-tagger', settings);
			plugin.settings = await meta.settings.get('ai-tagger');
			
			winston.info('[ai-tagger] Settings saved successfully');
			return { success: true };
		} catch (err) {
			winston.error('[ai-tagger] Error saving settings:', err);
			throw err;
		}
	};
};

plugin.addAdminNavigation = function (header) {
	header.plugins.push({
		route: '/plugins/ai-tagger',
		icon: 'fa-tags',
		name: 'AI Tagger'
	});
	return header;
};

module.exports = plugin;