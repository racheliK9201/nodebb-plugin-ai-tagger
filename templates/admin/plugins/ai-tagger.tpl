<!-- הגדרות תוסף תיוג AI -->
<div id="ai-tagger-settings" class="card p-4 shadow-sm">
    <div class="card-header bg-primary text-white mb-4">
        <h4 class="mb-0">הגדרות AI Tagger</h4>
    </div>
    <form class="form-horizontal">
        <div class="form-group mb-4">
            <label class="control-label fw-bold mb-2" for="ai-tagger-api-key">OpenAI API Key</label>
            <div class="input-group">
                <input type="password" 
                       class="form-control" 
                       id="ai-tagger-api-key" 
                       name="apiKey" 
                       placeholder="הזן את מפתח ה-API שלך" 
                       dir="ltr" />
                <button class="btn btn-outline-secondary" 
                        type="button" 
                        id="toggle-api-key" 
                        onclick="toggleApiKeyVisibility()">
                    <i class="fa fa-eye"></i>
                </button>
            </div>
            <small class="text-muted">מפתח ה-API שלך ל OpenAI API</small>
        </div>

        <div class="form-group mb-4">
            <label class="control-label fw-bold mb-2" for="ai-tagger-custom-prompt">הנחיה מותאמת אישית</label>
            <div>
                <textarea class="form-control" 
                          id="ai-tagger-custom-prompt" 
                          name="customPrompt" 
                          rows="4" 
                          placeholder="הזן הנחיה מותאמת אישית ליצירת תגים"
                          dir="auto"></textarea>
                <small class="text-muted">הנחיה מותאמת אישית להכוונת ה-AI ביצירת תגים</small>
            </div>
        </div>

        <div class="form-group">
            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" id="reset">איפוס</button>
                <button type="button" class="btn btn-primary" id="save">
                    <i class="fa fa-save me-2"></i>שמירת הגדרות
                </button>
            </div>
        </div>
    </form>

    <div class="alert alert-success mt-3 d-none" id="settings-saved">
        ההגדרות נשמרו בהצלחה!
    </div>
</div>

<style>
#ai-tagger-settings {
    max-width: 800px;
    margin: 0 auto;
    direction: rtl;
}

#ai-tagger-settings .card-header {
    border-radius: 0.5rem 0.5rem 0 0;
}

#ai-tagger-settings .form-control:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

#ai-tagger-settings .btn-primary:hover {
    transform: translateY(-1px);
    transition: transform 0.2s;
}
</style>

<script>
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('ai-tagger-api-key');
    const toggleButton = document.getElementById('toggle-api-key').querySelector('i');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        apiKeyInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}
</script>
