// This script adds a button to the tags section of the new post composer in NodeBB
// When clicked, it generates tags from the first words of the post content

(function() {
    /**
     * Adds an "Auto-generate tags" button to the NodeBB composer interface.
     * 
     * The button, when clicked, extracts the first 5 words from the post content,
     * sanitizes them, and inserts them as tags into the tag input field.
     * 
     * The function ensures the button is only added once and only if the tag input is present.
     * It also dispatches an input event to notify any listeners of the tag input change.
     */
    function addAutoTagButton() {
        // Find the composer tags input area using a more reliable selector
        var composerTags = document.querySelector('.composer .tags-input, .composer [data-tag-input], .composer .tags, .composer-tags');
        if (!composerTags) {
            return;
        }
        if (document.getElementById('ai-generate-tags')) {
            return;
        }
        // Try to find a suitable place to insert the button
        var tagInput;
        try {
            tagInput = document.getElementsByClassName("tags-container")[0]
                .getElementsByClassName("bootstrap-tagsinput")[0]
                .getElementsByTagName("input")[0];
        } catch (e) {
            tagInput = composerTags.querySelector('input[type="text"], input, textarea');
            if (!tagInput) {
                tagInput = document.querySelector('.composer input[data-tag-input], .composer input.tags-input, .composer input[type="text"]');
            }
        }
        if (!tagInput) {
            return;
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'ai-generate-tags';
        btn.className = 'btn btn-sm btn-info';
        btn.textContent = 'Auto-generate tags';
        btn.style.marginLeft = '8px';
        btn.style.display = 'inline-block'; // Ensure button is visible
        btn.onclick = function() {
            var contentBox = document.querySelector('.composer textarea.write, .composer [data-write] textarea, .composer textarea');
            if (!contentBox) {
                // Fallback: try to find any textarea in composer
                contentBox = document.querySelector('.composer textarea');
            }
            if (!contentBox) {
                return;
            }
            var text = contentBox.value.trim();
            if (!text) {
                return;
            }
            // Take the first 5 words as tags
            var tags = text.split(/\s+/).slice(0, 5).map(function(word) {
                return word.replace(/[^\w-]/g, '').toLowerCase();
            }).filter(Boolean);

            tagInput = document.getElementsByClassName("tags-container")[0]
                .getElementsByClassName("bootstrap-tagsinput")[0]
                .getElementsByTagName("input")[0];
                
            if (tagInput && tags.length) {
                // Clear the input first
                tagInput.value = '';
                tagInput.dispatchEvent(new Event('input', { bubbles: true }));
                tagInput.dispatchEvent(new Event('focus', { bubbles: true }));
                tagInput.focus();

                // Simulate typing each tag and pressing comma (or Enter) to trigger tag addition
                tags.forEach(function(tag, idx) {
                    tagInput.value += tag +",";
                    tagInput.dispatchEvent(new Event('input', { bubbles: true }));
                });

                // Optionally blur to trigger any finalization
                tagInput.dispatchEvent(new Event('blur', { bubbles: true }));
                tagInput.blur();
            }
        };
        // Insert the button as the last child of the div with class "tag-row"
        var tagRowDiv = composerTags.closest('.tag-row');
        if (tagRowDiv && !tagRowDiv.querySelector('#ai-generate-tags')) {
            tagRowDiv.appendChild(btn);
        } else if (composerTags && !composerTags.querySelector('#ai-generate-tags')) {
            composerTags.appendChild(btn);
        }
    }

    // Use MutationObserver to watch for composer
    var observer = new MutationObserver(function() {
        addAutoTagButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also try on composer loaded event
    $(window).on('action:composer.loaded', function() {
        addAutoTagButton();
    });
})();
