import { useState } from 'react'
import "../App.css";

function QueryForm()
{
    // current query to be asked
    const [query,setQuery] = useState('');
    const [conversationID,setConversationID] = useState('');

    // chatlog of previous queries and
    // replies from chatGPT
    const [chatlog,setChatlog] = useState([]);

    const printedLogs = chatlog.map(chatInstance => {
        return(
            <div>
                <li>{chatInstance.textReply}</li>
                <audio src={chatInstance.audioBlob} controls></audio>
            </div>
        );
    })

    // changes query variable as the content of the
    // textbox changes
    function changeQuery(e)
    {
        setQuery(e.target.value)
    }

    // posts the current query to the server
    // and updates chatlog with query.
    // Returns chatGPT's reply from the server 
    // and updates chatlog
    function postQuery(e)
    {
        e.preventDefault();
        const newQuery = {'textReply': query, 'audioBlob': ''};
        setChatlog(chatlog => [...chatlog,newQuery])
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

    return(
    <div>
        <form onSubmit={postQuery}>
            <textarea className='query-field' onChange={changeQuery} value={query}></textarea>
            <input type='submit'></input>
        </form>
        <ul>
            {printedLogs}
        </ul>
    </div>
    )
}

export default QueryForm;