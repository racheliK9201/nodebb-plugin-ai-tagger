'use strict';

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');

const controllers = require('./lib/controllers');

const routeHelpers = require.main.require('./src/routes/helpers');

const plugin = {};

plugin.init = async (params) => {
	const { router /* , middleware , controllers */ } = params;

	// Settings saved in the plugin settings can be retrieved via settings methods
	const { setting1, setting2 } = await meta.settings.get('ai-tagger');
	if (setting1) {
		console.log(setting2);
	}

	/**
	 * We create two routes for every view. One API call, and the actual route itself.
	 * Use the `setupPageRoute` helper and NodeBB will take care of everything for you.
	 *
	 * Other helpers include `setupAdminPageRoute` and `setupAPIRoute`
	 * */
	routeHelpers.setupPageRoute(router, '/ai-tagger', [(req, res, next) => {
		winston.info(`[plugins/ai-tagger] In middleware. This argument can be either a single middleware or an array of middlewares`);
		setImmediate(next);
	}], (req, res) => {
		winston.info(`[plugins/ai-tagger] Navigated to ${nconf.get('relative_path')}/ai-tagger`);
		res.render('ai-tagger', { uid: req.uid });
	});

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/ai-tagger', controllers.renderAdminPage);

	// Add this route to serve the API key
	router.get('/api/ai-tagger/key', (req, res) => {
		res.json({ apiKey: process.env.OPENAI_API_KEY || '' });
	});
};

module.exports = plugin;