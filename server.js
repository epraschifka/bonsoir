import { ChatGPTAPI } from 'chatgpt';
import express from 'express';
import cors from 'cors'

const app = express();
const PORT = 3001;
const systemMessage = `You are Bonsoir, a cheerful French tutor who helps
                      french learners practice speaking and listening to French
                      by simulating authentic, real conversations in French.
                      Be as concise in your responses as possible. If you are
                      generating a list, do not have too many items. Do not
                      ask the user if they need help with anything, as this
                      sounds unnatural - remember that your job is to simulate
                      a conversation with a french person on the street, so
                      ask about their day, their hobbies, or anything else.
                      If asked these questions, come up with responses
                      as if you are a human. If something they say
                      doesn't make sense or sounds ungrammatical,
                      either correct them or ask for clarification.
                      Try to be warm, friendly and intimate rather than cold 
                      and robotic. Your plans today are to go shopping,
                      walk on the beach and make dinner.`

app.use(cors());
app.use(express.json());

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
  systemMessage: systemMessage
                    
})

// takes a query as input, posts the query
// to the chatGPT api, and returns the reply
// from chatGPT.
async function generateText(query,parentMessageId) {
    const reply = await api.sendMessage(query, {
      parentMessageId: parentMessageId,
      systemMessage: systemMessage

    });
    return reply;
}

// takes a string as input, converts it into
// speech. Returns a BLOB.

async function generateSpeech(script,voiceId,apiKey) {
  const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + voiceId;
  const options = {
    method: 'POST',
    headers: {
      accept: 'audio/mpeg',
      'content-type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      model_id: "eleven_multilingual_v2",
      text: script,
      voice_settings:{"similarity_boost":1,"stability":1,"style":0,"use_speaker_boost":false}
    }),
    responseType: 'arraybuffer',
  };

  try {
    const speechDetails = await fetch(url, options);
    const audioBuffer = await speechDetails.arrayBuffer();
    const mp3Blob = new Uint8Array(audioBuffer);
    return mp3Blob;
  } catch (error) {
    console.error('Error:', error);
  }
}

// calls the ask function on the request body's query.
app.post('/post_query', async (req,res) => {
    const query = req.body.query;
    const parentMessageId = req.body.parentMessageId;
    const maleVoiceID = "z5QwUJ8lCPK64PB6okBk";
    const femaleVoiceID = "hsDNToeZAyHpjnC5X924";
    const apiKey = '7893e3f397a96eac30deba97f42ab4f8'
    const reply = await generateText(query,parentMessageId);
    const reply_text = reply.text;
    const reply_audio = await generateSpeech(reply_text,femaleVoiceID,apiKey);
    // console.log(`Sending back a response with myText=${reply} and myAudio=${reply_audio}`);
    res.send({'myText': reply, 'myAudio': Array.from(reply_audio)});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
})