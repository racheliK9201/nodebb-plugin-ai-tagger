// This script adds a button to the tags section of the new post composer in NodeBB
// When clicked, it generates tags from the first words of the post content

(function () {
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
        btn.className = 'ai-tagger-btn';

        // Use SVG icon and hover text
        btn.innerHTML = `
            <svg class="ai-tagger-btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#2196f3" d="M23.426,31.911l-1.719,3.936c-0.661,1.513-2.754,1.513-3.415,0l-1.719-3.936	c-1.529-3.503-4.282-6.291-7.716-7.815l-4.73-2.1c-1.504-0.668-1.504-2.855,0-3.523l4.583-2.034	c3.522-1.563,6.324-4.455,7.827-8.077l1.741-4.195c0.646-1.557,2.797-1.557,3.443,0l1.741,4.195	c1.503,3.622,4.305,6.514,7.827,8.077l4.583,2.034c1.504,0.668,1.504,2.855,0,3.523l-4.73,2.1	C27.708,25.62,24.955,28.409,23.426,31.911z"></path>
                <path fill="#7e57c2" d="M38.423,43.248l-0.493,1.131c-0.361,0.828-1.507,0.828-1.868,0l-0.493-1.131	c-0.879-2.016-2.464-3.621-4.44-4.5l-1.52-0.675c-0.822-0.365-0.822-1.56,0-1.925l1.435-0.638c2.027-0.901,3.64-2.565,4.504-4.65	l0.507-1.222c0.353-0.852,1.531-0.852,1.884,0l0.507,1.222c0.864,2.085,2.477,3.749,4.504,4.65l1.435,0.638	c0.822,0.365,0.822,1.56,0,1.925l-1.52,0.675C40.887,39.627,39.303,41.232,38.423,43.248z"></path>
            </svg>
            <span class="ai-tagger-btn-text">צור תגיות באמצעות AI</span>
        `;

        btn.onmouseenter = function () {
            var span = btn.querySelector('.ai-tagger-btn-text');
            if (span) span.classList.add('ai-tagger-btn-text-visible');
        };
        btn.onmouseleave = function () {
            var span = btn.querySelector('.ai-tagger-btn-text');
            if (span) span.classList.remove('ai-tagger-btn-text-visible');
        };

        btn.onclick = async function () {
            // Fetch the API key from the server
            let apiKey = '';
            try {
                const keyRes = await fetch('/api/ai-tagger/key');
                const keyData = await keyRes.json();
                console.log('[AI Tagger] Fetched API key from server:', keyData);
                apiKey = keyData.apiKey || '';
            } catch (e) {
                console.error('[AI Tagger] Could not fetch API key from server');
                return;
            }

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

            // Send the text to OpenAI to summarize
            console.log('[AI Tagger] Sending content to OpenAI for tag generation:', text);
            let summary = '';
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'You are a tags generator for post that should be indexed using the tags. Take the post and create between 1 to 3 tags that represents the content of the post. Each tag must be at least 3 characters long. Do not use general finance terms, be as specific as possible. Return only the tags with no other prefix, suffix or anything else. Each tag may have more that one word. use comma to separate between tags.' },
                            { role: 'user', content: "Post: " + text }
                        ],
                        max_tokens: 32,
                        temperature: 1
                    })
                });
                const data = await response.json();
                console.log('[AI Tagger] OpenAI response:', data);

                summary = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                    ? data.choices[0].message.content.trim()
                    : '';
                console.log('[AI Tagger] Summary from OpenAI:', summary);
            } catch (err) {
                console.error('[AI Tagger] Error calling OpenAI API:', err);
                // Fallback: use original text if API fails
                summary = text;
            }

            // Use the summary's first 5 words as tags
            var tags = summary.split(",").map(function (word) {
                // Allow Hebrew (U+0590–U+05FF), English letters, numbers, hyphens, underscores, and spaces
                return word.replace(/[^\w\u0590-\u05FF\- ]/g, '').toLowerCase().trim();
            }).filter(Boolean);

            console.log('[AI Tagger] Generated tags:', tags);

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
                tags.forEach(function (tag, idx) {
                    tagInput.value += tag + ",";
                    tagInput.dispatchEvent(new Event('input', { bubbles: true }));
                });

                // Optionally blur to trigger any finalization
                tagInput.dispatchEvent(new Event('blur', { bubbles: true }));
                tagInput.blur();
            }
        };
        // Insert the button as the first child of the div with class "tag-row"
        var tagRowDiv = composerTags.closest('.tag-row');
        if (tagRowDiv && !tagRowDiv.querySelector('#ai-generate-tags')) {
            tagRowDiv.insertBefore(btn, tagRowDiv.firstChild);
        } else if (composerTags && !composerTags.querySelector('#ai-generate-tags')) {
            composerTags.insertBefore(btn, composerTags.firstChild);
        }
    }

    // Use MutationObserver to watch for composer
    var observer = new MutationObserver(function () {
        addAutoTagButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also try on composer loaded event
    $(window).on('action:composer.loaded', function () {
        addAutoTagButton();
    });
})();
