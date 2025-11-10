'use strict';

const meta = require.main.require('./src/meta');
const Controllers = module.exports;

	/*
		Make sure the route matches your path to template exactly.

		If your route was:
			myforum.com/some/complex/route
		your template should be:
			templates/some/complex/route.tpl
		and you would render it like so:
			res.render('some/complex/route');
	*/


Controllers.renderAdminPage = function (req, res/* , next */) {
	res.render('admin/plugins/ai-tagger', {});
};

Controllers.getApiKey = async function (req, res) {
		// get	api key from env variable if set, else from settings

	try {
		const settings = await meta.settings.get('ai-tagger');
		res.json({
			apiKey: process.env.OPENAI_API_KEY ||  settings.apiKey || ''
		});
	} catch (err) {
		res.status(500).json({
			error: 'Could not fetch API key'
		});
	}
};
