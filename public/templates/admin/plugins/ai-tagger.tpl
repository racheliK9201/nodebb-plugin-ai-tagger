<!-- Admin Settings Page for AI Tagger Plugin -->
<div id="ai-tagger-settings">
    <form class="form-horizontal">
        <div class="form-group">
            <label class="col-sm-2 control-label" for="ai-tagger-api-key">API Key</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="ai-tagger-api-key" name="apiKey" />
            </div>
        </div>
        <div class="form-group">
            <label class="col-sm-2 control-label" for="ai-tagger-threshold">Tagging Threshold</label>
            <div class="col-sm-10">
                <input type="number" class="form-control" id="ai-tagger-threshold" name="threshold" min="0" max="1" step="0.01" />
            </div>
        </div>
        <div class="form-group">
            <div class="col-sm-offset-2 col-sm-10">
                <button type="button" class="btn btn-primary" id="save">Save Settings</button>
            </div>
        </div>
    </form>
</div>
