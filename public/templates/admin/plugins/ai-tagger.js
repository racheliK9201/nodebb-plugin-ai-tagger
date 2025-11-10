/* global $, app, socket */
'use strict';

define('admin/plugins/ai-tagger', ['settings'], function (Settings) {
    var ACP = {};

    ACP.init = function () {
        Settings.load('ai-tagger', $('.ai-tagger-settings'));

        $('#save').on('click', function () {
            Settings.save('ai-tagger', $('.ai-tagger-settings'), function () {
                app.alert({
                    type: 'success',
                    alert_id: 'ai-tagger-saved',
                    title: 'Settings Saved',
                    message: 'Please reload your NodeBB to apply these settings',
                    clickfn: function () {
                        socket.emit('admin.reload');
                    }
                });
            });
        });
    };

    return ACP;
});