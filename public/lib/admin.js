/* global $, app, socket */
$(document).ready(function () {
    var settingsForm = $('#ai-tagger-settings');
    var alertBox = $('#ai-tagger-settings-alert');

    // Load settings

    socket.emit('admin.settings.get', { plugin: 'ai-tagger' }, function (err, settings) {
        if (!err && settings) {
            settingsForm.find('#apiKey').val(settings.apiKey || '');
            settingsForm.find('#confidenceThreshold').val(settings.confidenceThreshold || '0.5');
            settingsForm.find('#customPrompt').val(settings.customPrompt || '');
        }
    });

    // Save settings
    settingsForm.on('submit', function (e) {
        e.preventDefault();
        var data = {
            apiKey: settingsForm.find('#apiKey').val(),
            confidenceThreshold: settingsForm.find('#confidenceThreshold').val(),
            customPrompt: settingsForm.find('#customPrompt').val(),
        };
        socket.emit('admin.settings.set', { plugin: 'ai-tagger', settings: data }, function (err) {
            if (err) {
                alertBox.removeClass('alert-success').addClass('alert-danger').text('Error saving settings!').show();
            } else {
                alertBox.removeClass('alert-danger').addClass('alert-success').text('Settings saved!').show();
            }
            setTimeout(function () { alertBox.hide(); }, 2000);
        });
    });
});
