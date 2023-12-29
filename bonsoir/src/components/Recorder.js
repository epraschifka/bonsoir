import { useReactMediaRecorder } from 'react-media-recorder';

function Recorder()
{
    const {status, startRecording, stopRecording, mediablobUrl} = useReactMediaRecorder({audio:true})

    function startListening()
    {
        startRecording();
    }
}

export default Recorder;
