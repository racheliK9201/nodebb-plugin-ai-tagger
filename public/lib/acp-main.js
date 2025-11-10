'use strict';

$(document).ready(function () {
	// Load settings
	require(['settings'], function (Settings) {
		var wrapper = $('#ai-tagger-settings');
		var settings = new Settings('ai-tagger', 'ai-tagger', wrapper);
		settings.load();

		$('#save').on('click', function () {
			settings.save();
		});
	});
});
