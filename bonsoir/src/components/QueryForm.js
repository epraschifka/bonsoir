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

    const printedLogs = chatlog.map(string => {
        return(<li>{string}</li>);
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
        setChatlog(chatlog => [...chatlog,query])
        const headers = {'Content-Type': 'application/json'};
        const body = {'query':query,'parentMessageId':conversationID}
        console.log("Sending request");
        console.log(`request text is ${query}`);
        console.log(`request id is ${conversationID}`);
        fetch('http://localhost:3001/post_query',{body:JSON.stringify(body),method:'POST',headers:headers})
        .then(reply => reply.json())
        .then(
            reply_jsonified => {
                setChatlog(chatlog => [...chatlog,reply_jsonified.text.text]);
                setConversationID(reply_jsonified.text.id);
                console.log("received response");
                console.log(`response text is ${reply_jsonified.text.text}`);
                console.log(`response id is ${reply_jsonified.text.id}`);
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