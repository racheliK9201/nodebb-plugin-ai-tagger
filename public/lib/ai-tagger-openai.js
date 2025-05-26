// Adds a button to generate tags using OpenAI summarization

(function() {
    // Set your OpenAI API key here
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

    function addOpenAIAutoTagButton() {
        console.log('[AI-Tagger] Checking for composer tags input...');
        var composerTags = document.querySelector('.composer .tags-input, .composer [data-tag-input], .composer .tags, .composer-tags');
        if (!composerTags) {
            console.log('[AI-Tagger] Composer tags input not found.');
            return;
        }
        if (document.getElementById('ai-generate-tags-openai')) {
            console.log('[AI-Tagger] AI tag button already exists.');
            return;
        }

        // Create the button
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'ai-generate-tags-openai';
        btn.className = 'btn btn-sm btn-primary';
        btn.textContent = 'AI Tags (OpenAI)';
        btn.style.marginLeft = '8px';
        btn.onclick = window.generateTagsWithOpenAI;

        // Expose OpenAI tag generation as a global function
        window.generateTagsWithOpenAI = async function() {
            console.log('[AI-Tagger] Generate tags button clicked.');
            var contentBox = document.querySelector('.composer textarea.write, .composer [data-write] textarea, .composer textarea');
            if (!contentBox) contentBox = document.querySelector('.composer textarea');
            if (!contentBox) {
                console.log('[AI-Tagger] Composer textarea not found.');
                return;
            }
            var text = contentBox.value.trim();
            if (!text) {
                console.log('[AI-Tagger] No text found in composer.');
                return;
            }

            var tagInput;
            try {
                tagInput = document.getElementsByClassName("tags-container")[0]
                    .getElementsByClassName("bootstrap-tagsinput")[0]
                    .getElementsByTagName("input")[0];
                console.log('[AI-Tagger] Found tag input via bootstrap-tagsinput.');
            } catch (e) {
                tagInput = composerTags.querySelector('input[type="text"], input, textarea');
                if (!tagInput) {
                    tagInput = document.querySelector('.composer input[data-tag-input], .composer input.tags-input, .composer input[type="text"]');
                }
                if (tagInput) {
                    console.log('[AI-Tagger] Found tag input via fallback selector.');
                } else {
                    console.log('[AI-Tagger] Tag input not found.');
                }
            }
            if (!tagInput) return;

            // Optionally, you can show a loading state on the OpenAI button if you want
            var btn = document.getElementById('ai-generate-tags-openai');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Generating...';
            }

            try {
                const prompt = `Summarize the following message in 3-7 comma-separated keywords suitable as tags:\n\n${text}`;
                console.log('[AI-Tagger] Sending request to OpenAI API...');
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 32,
                        temperature: 0.5,
                    }),
                });
                const data = await response.json();
                console.log('[AI-Tagger] OpenAI API response:', data);
                let tags = '';
                if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    tags = data.choices[0].message.content
                        .replace(/\n/g, '')
                        .replace(/tags?:?/i, '')
                        .replace(/\.$/, '')
                        .trim();
                    console.log('[AI-Tagger] Extracted tags:', tags);
                } else {
                    console.log('[AI-Tagger] No tags found in OpenAI response.');
                }
                if (tags) {
                    tagInput.focus();
                    tagInput.value = tags;
                    tagInput.dispatchEvent(new Event('input', { bubbles: true }));
                    tagInput.dispatchEvent(new Event('change', { bubbles: true }));
                    tagInput.blur();
                    console.log('[AI-Tagger] Tags inserted into input.');
                }
            } catch (err) {
                console.error('[AI-Tagger] Failed to generate tags using OpenAI.', err);
                alert('Failed to generate tags using OpenAI.');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'AI Tags (OpenAI)';
                }
            }
        };

        var tagRowDiv = composerTags.closest('.tag-row');
        if (tagRowDiv && !tagRowDiv.querySelector('#ai-generate-tags-openai')) {
            tagRowDiv.appendChild(btn);
            console.log('[AI-Tagger] Button added to tag-row.');
        } else if (composerTags && !composerTags.querySelector('#ai-generate-tags-openai')) {
            composerTags.appendChild(btn);
            console.log('[AI-Tagger] Button added to composerTags.');
        }
    }

    var observer = new MutationObserver(function() {
        addOpenAIAutoTagButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    $(window).on('action:composer.loaded', function() {
        addOpenAIAutoTagButton();
    });

    console.log('[AI-Tagger] MutationObserver and event listener initialized.');
})();
