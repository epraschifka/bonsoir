import { ChatGPTAPI } from 'chatgpt';
import express from 'express';
import cors from 'cors'
import ElevenLabs from 'elevenlabs-node';
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY
})

const voice = new ElevenLabs(
    {
        apiKey:  "7893e3f397a96eac30deba97f42ab4f8", // Your API key from Elevenlabs
        voiceId: "pNInz6obpgDQGcFmaJgB",             // A Voice ID from Elevenlabs
    }
);

// takes a query as input, posts the query
// to the chatGPT api, and returns the reply
// from chatGPT.
async function generateText(query,parentMessageId) {
    console.log("Server-side, baby")
    console.log(`received request with query ${query} and 
                 id ${parentMessageId}`);
  
    const reply = await api.sendMessage(query, {
      parentMessageId: parentMessageId
    });
    return reply;
}

async function generateSpeech(script) {
  await voice.textToSpeech({
    fileName: "audio.mp3",
    textInput: script
  })
}

// calls the ask function on the request body's query.
app.post('/post_query', async (req,res) => {
    const query = req.body.query;
    const parentMessageId = req.body.parentMessageId;
    const voiceID = "21m00Tcm4TlvDq8ikWAM";
    const reply = await generateText(query,parentMessageId);
    const reply_text = reply.text;
    await generateSpeech(reply_text);
    res.send({'text': reply});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
})