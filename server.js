import { ChatGPTAPI } from 'chatgpt';
import express from 'express';
import cors from 'cors'
import ElevenLabs from 'elevenlabs-node';
import fs from 'fs/promises'
import path from 'path'

const app = express();
const PORT = 3001;
let audioDir = process.cwd();

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
    const reply = await api.sendMessage(query, {
      parentMessageId: parentMessageId
    });
    return reply;
}

// takes a string as input, converts it into
// speech. Returns a BLOB.

async function generateSpeech(script) {
  const audioFilePath = path.join(process.cwd(), 'audio.mp3');

  await voice.textToSpeech({
    fileName: "audio.mp3",
    textInput: script
  });

  try {
    const mp3Buffer = await fs.readFile(audioFilePath);
    const mp3Blob = new Uint8Array(mp3Buffer);
    return mp3Blob;
  } catch (err) {
    console.error("Error reading mp3 file: ", err);
    throw err;
  }
}

// calls the ask function on the request body's query.
app.post('/post_query', async (req,res) => {
    const query = req.body.query;
    const parentMessageId = req.body.parentMessageId;
    const voiceID = "21m00Tcm4TlvDq8ikWAM";
    const reply = await generateText(query,parentMessageId);
    const reply_text = reply.text;
    const reply_audio = await generateSpeech(reply_text);
    // console.log(`Sending back a response with myText=${reply} and myAudio=${reply_audio}`);
    res.send({'myText': reply, 'myAudio': Array.from(reply_audio)});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
})