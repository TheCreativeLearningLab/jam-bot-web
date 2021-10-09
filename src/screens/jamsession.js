import React, {useState, useEffect, useRef} from 'react'
import '../theme.css'
import styled from 'styled-components';
import { Colors, ColSection, RowSection, Screen } from '../components/styledComponents'
import * as Tone from 'tone';
import '../webaudio-controls'
import Drums from '../controllers/drums';
import Rhythm from '../controllers/rhythm';
import Lead from '../controllers/lead';
import kicktone from '../samples/kick.wav'
import snareotne from '../samples/snare.wav'

const midC = 261.625565;
const chromatic = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const natMaj = [0,2,4,5,7,9,11];

const getChromNotes = (c) =>{
    var chromNotes = []
    chromatic.map((item,index)=>{
        var freq = c * Math.pow(2,index/12)
        chromNotes.push(freq)
    })
    console.log(chromNotes)
    return chromNotes;
}
const chromNotes = getChromNotes(midC)
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
    kickUrl: kicktone,
    snareUrl: snareotne,
    kickLoop:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,],
    snareLoop: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,],
    leadLoop: new Array(16).fill(0),
    rhythmLoop: new Array(16).fill(0),
    rhythmGroove: [1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1],
    tempo: 120,
    keyRoot: 'A',
    scaleShape: 'Major Pent',
    chordList: [],
    key : {
        root: '',
        intervals : [
             {
                interval: 'I',
                note: 'Note',
                freq: 0,
                chordMode :'',
                chordFreqs: []
            },
            {
                interval: 'ii',
                note: 'Note',
                freq: 0,
                chordMode :'m',
                chordFreqs: []
            },
            {
                interval: 'iii',
                note: 'Note',
                freq: 0,
                chordMode :'m',
                chordFreqs: []
            },
            {
                interval: 'IV',
                note: 'Note',
                freq: 0,
                chordMode :'',
                chordFreqs: []
            },
            {
                interval: 'V',
                note: 'Note',
                freq: 0,
                chordMode :'',
                chordFreqs: []
            },
            {
                interval: 'vi',
                note: 'Note',
                freq: 0,
                chordMode :'m',
                chordFreqs: []
            },
            {
                interval: 'vii',
                note: 'Note',
                freq: 0,
                chordMode :'d',
                chordFreqs: []
            },
        ],
        scaleFreqs : {
            relMinorPent : [],  // for use when the 6 chord is the root chord
            minorPent: [],
            majorPent: [],
        }
    }
}

const BigButton = styled.button`
    background-color: ${Colors.light};
    font-size: 30px;
    height: 200px;
    border-radius: 30%;
`;

const JamSession = (pros) => {
    var click = 0;
    const [layout, setLayout] = useState("Setup");//Setup, Loop, Review
    const [clickDisplay, setClickDisplay] = useState(0)
    const [config, setConfig] = useState(jambotConfig)
    const [setup, setSetup] = useState(false);
    const [playing, setPlaying] = useState(false);
    const DrumRef = useRef();
    const RhythmRef = useRef();
    const LeadRef = useRef();
    

//Listener for Config Changes
    useEffect(() => {
        console.log("Config Changes")
        console.log(config)
        return () => {
            
        }
    }, [config])

    const init = async ()=>{
        console.log("initializing Tone JS")
        await Tone.start()
        setTimeout(()=>{
            DrumRef.current.init()
            RhythmRef.current.init()
            LeadRef.current.init()

        }, 1000)

        loadKey(config.keyRoot)
        setLayout("Loop")

    }
    //Session Timer Loop
    const clickCallback = (time) =>{
        LeadRef.current.clickCallback(click, time)
        DrumRef.current.clickCallback(click, time)
        RhythmRef.current.clickCallback(click, time)
        
        click++;
        setClickDisplay(click);
    }

//Update Config Callback passed to children
    const updateConfig =(obj)=>{
        var key = Object.keys(obj)
        var value = obj[key];
        console.log(`Updating ${key} with ${value}`)
        setConfig({...config, 
            [key] :value
        })

    }
//Session Commands
    const select = () =>{

    }
    const start = () =>{
        if(!setup){
        const clickLoop = new Tone.Loop(time=>{
            clickCallback(time);
            
        }, config.clickBaseInterval).start();
        setSetup(true);
        }

        //Set transport BPM to state variable tempo
        Tone.Transport.bpm.value = config.tempo;
        //Start the transport now
        Tone.Transport.start();
        setPlaying(true)
    }
    const pause = ()=>{
        Tone.Transport.stop();
        setPlaying(false)
    }
    const togglePlay = ()=>{
        if(!setup){
            const clickLoop = new Tone.Loop(time=>{
                clickCallback(time);
                
            }, config.clickBaseInterval).start();
            setSetup(true);
            }
        if(playing){
            Tone.Transport.stop();
            setPlaying(false)
        } else {
            Tone.Transport.start();
            setPlaying(true)
        }
    }
    const stop = () =>{
        setLayout("Review")
    }
    //Load session from Storage/API
    const load = ()=>{

    }
    //Save session to Storage/API
    const save = ()=>{
        console.log(`Saving`)
        console.log(config)
    }
    const changeTempo = (value) =>{
        //React State Tempo value    
        updateConfig({tempo: value});
        //Tone Loop tempo value
        Tone.getTransport().bpm.value = value;
    }
    const loadKey = async (root) => {
        var key = config.key;
        key.root = root;
        const rootIndex = chromatic.indexOf(root)
        const rootFreq = chromNotes[rootIndex]

        //Get Key Intervals - Notes and Frequencies
        natMaj.map((semitone,index)=>{
            var chromIndex =  semitone + rootIndex;
            if(chromIndex>11){
                chromIndex = chromIndex - 12 //reset to 0
            }
            //Set note letter note
            key.intervals[index].note = (chromatic[chromIndex])
            //Set note frequency
            //TODO: To have ascending frequencies on all keys make this absolute
            //this.key.intervals[index].freq = (chromNotes[chromIndex])
            key.intervals[index].freq = rootFreq* Math.pow(2,semitone/12)
    
        })
    
        //Get Chord frequencies for each interval
        var majorChordShape = [0,4,7];
        var minorChordShape = [0,3,7];
        key.intervals.map((interval)=>{
            interval.chordFreqs = []
            if (interval.chordMode === 'm'){//minor chord
                minorChordShape.map((st)=>{
                    const freq = interval.freq * Math.pow(2,st/12)
                    interval.chordFreqs.push(freq)
                })
                
            } else {
                majorChordShape.map((st)=>{
                    const freq = interval.freq * Math.pow(2,st/12)
                    interval.chordFreqs.push(freq)
                })
            }
    
        })
    
    
        //Get key Scales

        var minorPent = [0,3,5,7,10]
        key.scaleFreqs.minorPent = []
        minorPent.map(semitone=>{
            var freq = rootFreq * Math.pow(2,semitone/12)
            key.scaleFreqs.minorPent.push(freq)
        })
        var majorPent = [0,2,4,7,9]
        key.scaleFreqs.majorPent = []
        majorPent.map(semitone=>{
            var freq = rootFreq * Math.pow(2,semitone/12)
            key.scaleFreqs.majorPent.push(freq)
        })
        var relMinorPent = [-3, 0,2,4,7]
        key.scaleFreqs.relMinorPent = []
        relMinorPent.map(semitone=>{
            var freq = rootFreq * Math.pow(2,semitone/12)
            key.scaleFreqs.relMinorPent.push(freq)
        })
        console.log(key)
        updateConfig({key:key})
    }

//Initialize Real Time Loop and refs
    //InitToneJS


    
        //TODO Change screens to theme
    return (
        <Screen>
            <RowSection> 
            <ColSection>
            <h1 style={{color: Colors.pop,textAlign:'center'}}>The Jam-Bot</h1>
            {layout==="Setup" && <BigButton onClick={init}>Start Jambot</BigButton>}
            {layout==="Review" && 
                <div>
                    <p>Reviewing Session</p>
                    <button onClick={start} >Start New Session</button>
                </div>}
    
            {layout=="Loop" && 
            <ColSection>
                <button onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
                <p> Bar: {Math.floor(clickDisplay/8)+1}, Beat: {Math.floor((clickDisplay/2)%4)+1}, Interval: {clickDisplay%2} </p>
                </ColSection>
                }
                <p>1. Select the kick and snare pattern</p>
            
            <RowSection>
                <p> 2. Set the Tempo: {config.tempo}</p>
                <input type='range' value={config.tempo} onChange={(event)=>{changeTempo(event.target.value)}} min="50" max="180"/>  
           
            </RowSection>
            <p> 3. Set the chord progression. Select a cord and how many beats (eighth notes) it should play for. </p>
                <p>Experiment with different groove patterns for the Rhythm!</p>
            <RowSection> 
            <p>4. Select the Key you want to jam in: </p>
                        <select value={config.key.root} onChange={(event)=>{loadKey(event.target.value)}} name="keySelect"> 
                            {chromatic.map((root, index)=>
                                <option key={index} value={root}>{root}</option>
                            )}
                        </select>
            </RowSection>
 
            <p> 5. Play the lead synth with your keyboard keys F,G,H,J,K</p>
            <p> 6. Set the lead synth to looping to create a melody to jam with.</p>
            </ColSection>
            
            <ColSection> 
            <Drums ref={DrumRef} config={config} click={clickDisplay} updateConfig={updateConfig}/>
            <Rhythm ref={RhythmRef} config={config} click={click} updateConfig={updateConfig}/>
            <Lead ref={LeadRef} config={config} click={click} updateConfig={updateConfig}/>
            </ColSection>
            
            </RowSection>
        </Screen>
    )
}

export default JamSession
