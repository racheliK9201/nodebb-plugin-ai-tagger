'use strict';

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');
const controllers = require('./lib/controllers');

const routeHelpers = require.main.require('./src/routes/helpers');

const plugin = {};

plugin.init = async (params) => {
	const { router, middleware } = params;

	// Load existing settings
	const settings = await meta.settings.get('ai-tagger');
	plugin.settings = Object.assign({
		apiKey: '',
		customPrompt: 'Please suggest relevant tags for this content:',
	}, settings);

	// Setup Admin Page Route
	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/ai-tagger', middleware.admin.buildHeader, controllers.renderAdminPage);
	routeHelpers.setupAdminPageRoute(router, '/api/admin/plugins/ai-tagger', [], controllers.renderAdminPage);

	// Setup API Route for fetching API key
	// router.get('/api/ai-tagger/key', [], controllers.getApiKey);
	
	router.get('/api/ai-tagger/key', [], controllers.getApiKey);

	// Socket listeners for admin settings
	const SocketAdmin = require.main.require('./src/socket.io/admin');
	SocketAdmin.settings.saveAITaggerSettings = async function (socket, data) {
		await meta.settings.set('ai-tagger', {
			apiKey: data.apiKey,
			customPrompt: data.customPrompt
		});
		plugin.settings = await meta.settings.get('ai-tagger');
	};

	SocketAdmin.settings.getAITaggerSettings = async function (socket, data) {
		return await meta.settings.get('ai-tagger');
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