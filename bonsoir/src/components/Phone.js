import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAudioRecorder } from 'react-audio-voice-recorder'

const Phone = () => {
  // chatlog is an array of chat instances. 
  // A chat instance is an object consisting of some text
  // and an audio blob URL. A new chat instance is generated
  // every time the user or chatGPT finishes a statement.
  const [chatlog, setChatlog] = useState([]);
  
  // the conversationID is fed to chatGPT with each request.
  // It allows chatGPT to keep track of what has been said previously.
  const [conversationID,setConversationID] = useState('');

  // various functions to record the user's voice.
  // RecordingBlob contains that latest recording.
  const { startRecording, stopRecording, togglePauseResume, recordingBlob,
          isRecording, isPaused, recordingTime, mediaRecorder
  } = useAudioRecorder();

  // tracks if whether recordingBlob has been updated yet
  const [blobUpdated,setBlobUpdated] = useState(false);

  // postQuery sends a user's statement to chatGPT, and returns
  // a reply in the form of a chat instance.
  function postQuery()
  {
        const headers = {'Content-Type': 'application/json'};
        const body = {'query':finalTranscript,'parentMessageId':conversationID}
        fetch('http://localhost:3001/post_query',{body:JSON.stringify(body),method:'POST',headers:headers})
        .then(reply => reply.json())
        .then(
            reply_jsonified => {
                // reply_jsonified is an object with
                // two labels: myText and myAudio.
                
                // myText stores the written response from chatGPT
                // along with a bunch of metadata.
                const myText = reply_jsonified.myText;

                // myText has some labels like
                // 'id' which we'll put into our conversationID
                // variable, and 'text' which contains the
                // actual text reply.
                const textReply = myText.text;
                const textID = myText.id;
                
                // myAudio just stores an audio BLOB of the written response
                // converted into speech. Convert this into an object URL.
                const audioBlob = reply_jsonified.myAudio;
                const audioBlobObject = new Blob([new Uint8Array(audioBlob)], { type: 'audio/mpeg' });
                const audioURL = URL.createObjectURL(audioBlobObject);

                // we want to pass the object containing the response's
                // text and audio url into chatlog.
                const newChat = {'textReply': textReply, 'audioBlob': audioURL,
                                 'conversationID':conversationID, 'speaker':'robot'};
                
                setChatlog(chatlog => [...chatlog,newChat]);
                setConversationID(textID);
          }
        )
  }

  // various functions to detect and convert the user's
  // speech to text
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // printedLogs takes the chat instances
  // and displays the audio and text of each
  // to the screen in a list format
  const printedLogs = chatlog.map(chatInstance => {
    const classes = 'chatInstance-container' + ' '
                      + chatInstance.speaker;
    return (
        <div className={classes}>
          <div className='chatInstance'>
            <li>{chatInstance.textReply}</li>
            <audio src={chatInstance.audioBlob} controls></audio>
          </div>
        </div>
    );
  })

  // after the user finishes a statement, finalTranscript is automatically.
  // updated by the react-speech-recognition package. We can use this update
  // as a signal to stop recording.
  useEffect(() => {
    stopRecording();
  },[finalTranscript])

  // After we stop recording, recordingBlob is automatically updated
  // by the react-audio-voice-recorder package, so we can set
  // blobUpdated to true.
  useEffect(() => {
    setBlobUpdated(true);
  },[recordingBlob])

  // if blobUpdated is true, then the recordingBLob is ready,
  // and thus the finalTranscript is also ready, so we can update
  // the chatlog array with a new chat instance, and post the text
  // of this instance to chatGPT.
  useEffect(() => {
    if (blobUpdated && recordingBlob)
    {
        setBlobUpdated(false);
        const blob = URL.createObjectURL(recordingBlob);
        const newChat = {'textReply': finalTranscript, 'audioBlob':blob,'conversationID':conversationID, 'speaker':'human'}
        setChatlog([...chatlog,newChat]);
        postQuery();
    }
  }, [blobUpdated,recordingBlob,chatlog,conversationID,finalTranscript,postQuery])

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // start listening; starts speech recognition and audio recording
  // simultaneously.
  function startListening()
  {
    SpeechRecognition.startListening({ language: 'fr-FR'});
    startRecording();
  }

  return (
    <div className='app-wrapper'>
      <div className='conversation-wrapper'>{printedLogs}</div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
    </div>
  );
};
export default Phone;