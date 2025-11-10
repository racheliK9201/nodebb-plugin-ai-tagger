/* global $, app, socket */
'use strict';

$('document').ready(function () {
    var settingsForm = $('#ai-tagger-settings');
    const DEFAULT_PROMPT = 'You are a tags generator for post that should be indexed using the tags. Take the post and create between 1 to 3 tags that represents the content of the post. Each tag must be 3-15 characters long. Return only the tags with no other prefix, suffix or anything else. Each tag may have more that one word. use comma to separate between tags.';

    // Add reset button after custom prompt textarea
    const resetButton = $('<button class="btn btn-warning" id="reset-prompt" style="margin-left: 10px;">Reset to Default</button>');
    $('#ai-tagger-custom-prompt').after(resetButton);

    // Reset prompt handler
    resetButton.on('click', function(e) {
        e.preventDefault();
        $('#ai-tagger-custom-prompt').val(DEFAULT_PROMPT);
    });

    // Load settings
    socket.emit('admin.settings.getAITaggerSettings', {}, function (err, settings) {
        if (err) {
            console.error('[ai-tagger] Error loading settings:', err);
            app.alertError('Failed to load settings');
            return;
        }
        
        console.log('[ai-tagger] Settings loaded:', settings);
        if (settings) {
            $('#ai-tagger-api-key').val(settings.apiKey || '');
            $('#ai-tagger-custom-prompt').val(settings.customPrompt || DEFAULT_PROMPT);
        }
    });

    // Save settings
    $('#save').on('click', function (e) {
        e.preventDefault();
        console.log('[ai-tagger] Attempting to save settings...');

        var data = {
            apiKey: $('#ai-tagger-api-key').val(),
            customPrompt: $('#ai-tagger-custom-prompt').val()
        };

        console.log('[ai-tagger] Sending settings data:', { 
            apiKey: data.apiKey ? '(set)' : '(empty)', 
            customPrompt: data.customPrompt 
        });

        socket.emit('admin.settings.saveAITaggerSettings', data, function (err) {
            if (err) {
                console.error('[ai-tagger] Error saving settings:', err);
                app.alertError('Failed to save settings: ' + err.message);
                return;
            }

            console.log('[ai-tagger] Settings saved successfully');
            app.alertSuccess('Settings saved and applied!', 2000);

            // Optionally reload to ensure settings are applied
            app.alert({
                type: 'info',
                title: 'Settings Saved',
                message: 'Reload NodeBB to fully apply changes?',
                timeout: 5000,
                clickfn: function () {
                    socket.emit('admin.reload');
                }
            });
        });
    });
});