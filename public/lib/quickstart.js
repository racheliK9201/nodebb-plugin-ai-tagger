'use strict';

/*
	This file is located in the "modules" block of plugin.json
	It is only loaded when the user navigates to /ai-tagger page
	It is not bundled into the min file that is served on the first load of the page.
*/

define('forum/ai-tagger', function () {
	var module = {};
	module.init = function () {
		$('#last-p').text('ai-tagger.js loaded!');
	};
	return module;
});
