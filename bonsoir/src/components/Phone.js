import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useReactMediaRecorder } from 'react-media-recorder';
import Recorder from "./Recorder";

const Phone = () => {
  const [chatlog, setChatlog] = useState([]);
  const [query,setQuery] = useState('');
  const [conversationID,setConversationID] = useState('');

  function postQuery()
  {
        const headers = {'Content-Type': 'application/json'};
        const body = {'query':query,'parentMessageId':conversationID}
        fetch('http://localhost:3001/post_query',{body:JSON.stringify(body),method:'POST',headers:headers})
        .then(reply => reply.json())
        .then(
            reply_jsonified => {
                // reply_jsonified is a dictionary with
                // two labels: myText and myAudio
                
                // myText stores the written response from chatGPT
                // along with a bunch of metadata.
                const myText = reply_jsonified.myText;

                // myText then has some labels like
                // 'id' which we'll put into our conversationID
                // variable, and 'text' which contains the
                // actual text reply
                const textReply = myText.text;
                const textID = myText.id;
                
                // myAudio just stores an audio BLOB of the written response
                // converted into speech. Convert this into an object URL.
                const audioBlob = reply_jsonified.myAudio;
                const audioBlobObject = new Blob([new Uint8Array(audioBlob)], { type: 'audio/mpeg' });
                const audioURL = URL.createObjectURL(audioBlobObject);

                // we want to pass dictionary containing the response's
                // text and tts url into chatlog.
                const newChat = {'textReply': textReply, 'audioBlob': audioURL};
                
                setChatlog(chatlog => [...chatlog,newChat]);
                setConversationID(textID);
          }
        )
  }

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const printedLogs = chatlog.map(chatInstance => {
    return(
        <div>
            <li>{chatInstance.textReply}</li>
            <audio src={chatInstance.audioBlob} controls></audio>
        </div>
    );
  })

  useEffect(() => {
    if (finalTranscript)
    {
        setChatlog([...chatlog,{'textReply': finalTranscript, 'audioBlob':''}]);
        setQuery(finalTranscript);
    }
  }, [finalTranscript])

  useEffect(() => {
    if (query)
    {
        postQuery();
    }
  }, [query])

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <div className='conversation-wrapper'>{printedLogs}</div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={() => SpeechRecognition.startListening({ language: 'fr-FR'})}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
    </div>
  );
};
export default Phone;