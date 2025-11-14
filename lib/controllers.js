'use strict';

const meta = require.main.require('./src/meta');
const Controllers = module.exports;

	/*
		Make sure the route matches your path to template exactly.

		If your route was:
			myforum.com/some/complex/route
		your template should be:
			templates/some/complex/route.tpl
		and you would render it like so:
			res.render('some/complex/route');
	*/


Controllers.renderAdminPage = function (req, res/* , next */) {
	res.render('admin/plugins/ai-tagger', {});
};

Controllers.generateTags = async function (req, res) {
    try {
        // console.log('[ai-tagger] Starting tag generation request');
        
        // Get settings
        const settings = await meta.settings.get('ai-tagger');
        const {apiKey, customPrompt} = settings || {};
        
        // console.log('[ai-tagger] Settings loaded:', {
        //     hasApiKey: !!apiKey,
        //     hasCustomPrompt: !!customPrompt,
        //     promptLength: customPrompt?.length || 0
        // });
        
        if (!apiKey) {
            console.error('[ai-tagger] API key not configured');
            return res.status(500).json({
                error: 'API key not configured'
            });
        }

        const { text } = req.body;
        if (!text) {
            console.error('[ai-tagger] No text provided in request');
            return res.status(400).json({
                error: 'No text provided'
            });
        }

        console.log('[ai-tagger] Processing text:', {
            textLength: text.length,
            textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });

        // Make request to OpenAI
        const requestBody = {
            model: 'gpt-4o-mini',
            messages: [
                { 
                    role: 'system', 
                    content: customPrompt
                },
                { 
                    role: 'user', 
                    content: "Post: " + text 
                }
            ],
            max_tokens: 64,
            temperature: 0.7
        };

        // console.log('[ai-tagger] Sending request to OpenAI API:', {
        //     model: requestBody.model,
        //     max_tokens: requestBody.max_tokens,
        //     temperature: requestBody.temperature
        // });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('[ai-tagger] OpenAI API response status:', response.status);

        const data = await response.json();
        
        if (!response.ok) {
            console.error('[ai-tagger] OpenAI API error:', {
                status: response.status,
                error: data.error
            });
            throw new Error(data.error?.message || 'OpenAI API request failed');
        }
        
        if (!data.choices?.[0]?.message?.content) {
            console.error('[ai-tagger] Invalid response structure from OpenAI:', data);
            throw new Error('Invalid response from OpenAI');
        }

        const rawTags = data.choices[0].message.content;
        // console.log('[ai-tagger] Raw tags from OpenAI:', rawTags);

        const tags = rawTags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length >= 3);

        // console.log('[ai-tagger] Successfully generated tags:', {
        //     count: tags.length,
        //     tags: tags
        // });

        res.json({ tags });
    } catch (err) {
        console.error('[ai-tagger] Error generating tags:', {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: 'Could not generate tags',
            details: err.message
        });
    }
};
