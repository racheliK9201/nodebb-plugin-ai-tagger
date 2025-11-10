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
        // Get settings
        const settings = await meta.settings.get('ai-tagger');
        const {apiKey, customPrompt} = settings || {};
		
        
        if (!apiKey) {
            return res.status(500).json({
                error: 'API key not configured'
            });
        }

        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                error: 'No text provided'
            });
        }

        // Make request to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5-mini',
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
                max_tokens: 32,
                temperature: 1
            })
        });

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response from OpenAI');
        }

        const tags = data.choices[0].message.content
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length >= 3);

        res.json({ tags });
    } catch (err) {
        console.error('[ai-tagger] Error generating tags:', err);
        res.status(500).json({
            error: 'Could not generate tags',
            details: err.message
        });
    }
};
