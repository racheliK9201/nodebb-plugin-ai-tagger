/**
 * AI Tagger Plugin for NodeBB
 * 
 * This script enhances the NodeBB composer by adding an AI-powered tag generation button.
 * When clicked, it sends the post content to the server for intelligent tag generation
 * using AI algorithms.
 * 
 * @module ai-tagger
 */

(function () {
    // Constants for DOM selectors and configuration
    const SELECTORS = {
        COMPOSER_TAGS: '.composer .tags-input, .composer [data-tag-input], .composer .tags, .composer-tags',
        CONTENT_AREA: '.composer textarea.write, .composer [data-write] textarea, .composer textarea',
        TAGS_CONTAINER: '.tags-container',
        BOOTSTRAP_TAGS_INPUT: '.bootstrap-tagsinput',
        TAG_ROW: '.tag-row'
        };

    const CONFIG = {
        BUTTON_ID: 'ai-generate-tags',
        BUTTON_CLASS: 'ai-tagger-btn',
        API_ENDPOINT: '/api/ai-tagger/generate'
    };

    // HTML templates
    const TEMPLATES = {
        BUTTON_CONTENT: `
            <svg class="ai-tagger-btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#2196f3" d="M23.426,31.911l-1.719,3.936c-0.661,1.513-2.754,1.513-3.415,0l-1.719-3.936 c-1.529-3.503-4.282-6.291-7.716-7.815l-4.73-2.1c-1.504-0.668-1.504-2.855,0-3.523l4.583-2.034 c3.522-1.563,6.324-4.455,7.827-8.077l1.741-4.195c0.646-1.557,2.797-1.557,3.443,0l1.741,4.195 c1.503,3.622,4.305,6.514,7.827,8.077l4.583,2.034c1.504,0.668,1.504,2.855,0,3.523l-4.73,2.1 C27.708,25.62,24.955,28.409,23.426,31.911z"></path>
                <path fill="#7e57c2" d="M38.423,43.248l-0.493,1.131c-0.361,0.828-1.507,0.828-1.868,0l-0.493-1.131 c-0.879-2.016-2.464-3.621-4.44-4.5l-1.52-0.675c-0.822-0.365-0.822-1.56,0-1.925l1.435-0.638c2.027-0.901,3.64-2.565,4.504-4.65 l0.507-1.222c0.353-0.852,1.531-0.852,1.884,0l0.507,1.222c0.864,2.085,2.477,3.749,4.504,4.65l1.435,0.638 c0.822,0.365,0.822,1.56,0,1.925l-1.52,0.675C40.887,39.627,39.303,41.232,38.423,43.248z"></path>
            </svg>
            <span class="ai-tagger-btn-text">צור תגיות באמצעות AI</span>
        `,
        LOADING_CONTENT: `
            <div class="ai-tagger-loading">
                <div class="ai-tagger-spinner"></div>
                <span class="ai-tagger-loading-text">מייצר תגיות...</span>
            </div>
        `
    };

    /**
     * Finds the tag input element in the composer
     * @returns {HTMLElement|null} The tag input element or null if not found
     */
    function findTagInput(composerTags) {
        try {
            // Primary method: Look for bootstrap-tagsinput
            const container = document.querySelector(SELECTORS.TAGS_CONTAINER);
            if (container) {
                const input = container
                    .querySelector(SELECTORS.BOOTSTRAP_TAGS_INPUT)
                    ?.querySelector('input');
                if (input) return input;
            }

            // Fallback method 1: Direct input search in composer tags
            const directInput = composerTags.querySelector('input[type="text"], input, textarea');
            if (directInput) return directInput;

            // Fallback method 2: Generic composer input search
            return document.querySelector('.composer input[data-tag-input], .composer input.tags-input, .composer input[type="text"]');
        } catch (e) {
            console.warn('[AI Tagger] Error finding tag input:', e);
            return null;
        }
    }

    /**
     * Shows loading state on the button
     * @param {HTMLButtonElement} button - The button element
     */
    function showLoadingState(button) {
        button.innerHTML = TEMPLATES.LOADING_CONTENT;
        button.disabled = true;
        button.classList.add('loading');
    }

    /**
     * Restores the button to its original state
     * @param {HTMLButtonElement} button - The button element
     */
    function restoreButtonState(button) {
        button.innerHTML = TEMPLATES.BUTTON_CONTENT;
        button.disabled = false;
        button.classList.remove('loading');
        setupButtonHoverEffects(button);
    }

    /**
     * Fetches AI-generated tags from the server
     * @param {string} text - The post content to generate tags from
     * @param {HTMLButtonElement} button - The button element to show loading state
     * @returns {Promise<string[]>} Array of generated tags
     */
    async function generateTags(text, button) {
        showLoadingState(button);
        console.log('[AI Tagger] Sending content to server for tag generation');
        
        try {
            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate tags');
            }
            
            console.log('[AI Tagger] Server response:', data);
            return data.tags || [];
        } finally {
            restoreButtonState(button);
        }
    }

    /**
     * Applies the generated tags to the tag input field
     * @param {HTMLInputElement} input - The tag input element
     * @param {string[]} tags - Array of tags to apply
     */
    function applyTagsToInput(input, tags) {
        if (!input || !tags.length) return;

        // Reset input state
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('focus', { bubbles: true }));
        input.focus();

        // Add tags
        input.value = tags.join(',') + ',';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Finalize
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        input.blur();
    }

    /**
     * Sets up hover effects for a button
     * @param {HTMLButtonElement} button - The button to set up hover effects for
     */
    function setupButtonHoverEffects(button) {
        button.onmouseenter = () => {
            const span = button.querySelector('.ai-tagger-btn-text');
            span?.classList.add('ai-tagger-btn-text-visible');
        };
        
        button.onmouseleave = () => {
            const span = button.querySelector('.ai-tagger-btn-text');
            span?.classList.remove('ai-tagger-btn-text-visible');
        };
    }

    /**
     * Creates and initializes the AI tag generation button
     * @returns {HTMLButtonElement} The created button element
     */
    function createTagButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = CONFIG.BUTTON_ID;
        btn.className = CONFIG.BUTTON_CLASS;
        btn.innerHTML = TEMPLATES.BUTTON_CONTENT;

        return btn;
    }

    /**
     * Adds an AI tag generation button to the NodeBB composer interface
     */
    function addAutoTagButton() {
            // Look for the tags container first
            const composerTags = document.querySelector('.tags-container');
        if (!composerTags || document.getElementById(CONFIG.BUTTON_ID)) {
            return;
        }

            // Look for either bootstrap-tagsinput or a direct input
            const tagContainer = composerTags.querySelector('.bootstrap-tagsinput');
            if (!tagContainer) {
            return;
        }

        const btn = createTagButton();
        setupButtonHoverEffects(btn);


        btn.onclick = async function() {
            const contentBox = document.querySelector(SELECTORS.CONTENT_AREA);
            if (!contentBox) return;

            const text = contentBox.value.trim();
            if (!text) return;

            try {
                const tags = await generateTags(text, btn);
                const currentTagInput = findTagInput(document.querySelector(SELECTORS.COMPOSER_TAGS));
                applyTagsToInput(currentTagInput, tags);
            } catch (err) {
                console.error('[AI Tagger] Error generating tags:', err);
                app.alerts.error('Failed to generate tags: ' + err.message);
            }
        };

            // Try to insert the button in the most appropriate location
            const tagSpans = tagContainer.querySelectorAll('span.tag');
            const input = tagContainer.querySelector('input');
        
            if (tagSpans.length > 0) {
                // Insert after the last tag
                const lastTag = tagSpans[tagSpans.length - 1];
                lastTag.parentNode.insertBefore(btn, lastTag.nextSibling);
            } else if (input) {
                // If no tags exist, insert before the input
                input.parentNode.insertBefore(btn, input);
            } else {
                // Fallback: insert at the beginning
                tagContainer.insertBefore(btn, tagContainer.firstChild);
            }

            // Make sure the button is visible
            btn.style.display = 'inline-flex';
    }

    /**
     * Initialize the AI Tagger plugin
     * Sets up observers and event listeners to add the tag button when needed
     */
    function initializeAITagger() {
        // Watch for dynamic changes in the DOM
        const observer = new MutationObserver(() => addAutoTagButton());
        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for NodeBB composer loaded event
        $(window).on('action:composer.loaded', addAutoTagButton);
    }

    // Start the plugin
    initializeAITagger();
})();
