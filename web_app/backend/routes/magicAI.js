import { Router } from 'express';
import { Ollama } from 'ollama';
import "dotenv/config";

const router = Router();

// Put the following in your .env: AI_HOST=ai.japples.ca
const ollama = new Ollama({ host: process.env.AI_HOST + ":80"});

router.post('/ollama', async (req, res) => {
    console.log('Received request:', req.body);
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    const model = "gemma3";
    const message = { role: 'user', content: prompt };
    
    try {
        const response = await ollama.chat( {model: model, messages: [message], stream: false} );
        res.json(response.message.content);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }


});

export default router;
