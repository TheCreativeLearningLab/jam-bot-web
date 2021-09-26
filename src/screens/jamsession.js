import React, {useState, useEffect} from 'react'
import JamBot from '../controllers/jambot'


//TODO: 
// -- Track Click in Jam Session and change config based on Session Events
// -- Dynamic loop lengths

var jambotConfig = {
    rootNote: 'C4', //is the 1 interval
    scalePattern: [6, 1 , 2, 3, 5 ], //Minor Pentatonic mode of major root C
    numBars: 2, 
    beatsPerBar: 4,
    beatIntervals: 2,
    loopLengthIntervals: 16,
    clickBaseInterval: '8n',
    kickUrl: "/samples/kick.wav",
    snareUrl: "/samples/snare.wav",
    kickLoop:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,],
    snareLoop: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,],
    leadLoop: new Array(16).fill(0),
    rhythmLoop: new Array(16).fill(0),
    rhythmGroove: [1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1],
    tempo: 120,
    keyRoot: 'A',
    scaleShape: 'Major Pent',
    chordList: [],
}

const JamSession = (pros) => {
    const [click, setClick] = useState(0)
    const [config, setConfig] = useState(jambotConfig)

    const updateConfig =(obj)=>{
        var key = Object.keys(obj)
        var value = obj[key];
        console.log(`Sate Updating ${key} with ${value}`)
        setConfig({...config, 
            key: value
        })

    }
    
    return (
        <div>
            <JamBot config={config} click={click} updateConfig={updateConfig}/>
        </div>
    )
}

export default JamSession
