import React, { Component, useState} from 'react'
import ReactDOM from 'react-dom'
import '../theme.css'
import '../webaudio-controls'
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection, InstrumentWrapper, InstTitle} from '../components/styledComponents'
import Keys from '../components/Keys';
import Sequencer from '../components/Sequencer';
import Progression from '../components/Progression';
import { FrequencyClass } from 'tone';

console.log('loaded')
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
//Root of C yields key array of C, D, E, F, G, A, B


/**
 * TODO: 
 * 
 * -Instrument props.configurations & UI
 *      -Lead & Rhythm Tone and Octave Changer, Scale Selection
 *      -Kick/Snare Select Sample files
 * 
 * -Lead Loop Visualizer
 *      -Canvas midi type visualizer
 * 
 * -Alternate phrases 
 *      -Save phrases 
 *      -Save song (alternating phrases)
 * 
 * -Selectable Keyboard instruments - Link keys to instrument on selection
 */

class JamBot extends Component {
    constructor(props){
        super(props);
        //Used when props.config not provided
        this.state = {
            isPlaying: false,
            isLooping: false,
            leadKeyNoteDisplay: 0,
            beatDisplay: 0,

        }
        this.key = {
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
        //Non state variables primarily used in the Tone loop
        this.setup = false;
        this.leadKeyNote = 0;//Tracks key press in real time
        this.leadPlayingNote = 0;//Tracks note being played by synth in real time
        this.rhythmPlayingNote = '';
        this.keyup = this.keyup.bind(this)
        this.keypress = this.keypress.bind(this)
        this.loadKey(this.state.keyRoot);
        this.knobRef = React.createRef();
        
        
    }
    
//Component Mounts Add listeners for Knobs
componentDidMount(){
    let kickNode = ReactDOM.findDOMNode(this.knobRef)
    let snareNode = ReactDOM.findDOMNode(this.snareRef)
    let rhythmNode = ReactDOM.findDOMNode(this.rhythmRef)
    kickNode.addEventListener("input", this.changeKickGain.bind(this))
    snareNode.addEventListener("input", this.changeSnareGain.bind(this))
    rhythmNode.addEventListener("input", this.changeRhythmGain.bind(this))
    
    
}
//Component Unmount

//Start/Stop Toggle Jambot
    startJambot(){
        if(!this.setup){
            this.initToneJs()
        }
        if(!this.state.isPlaying){
            this.clickLoop.start(Tone.now());
            Tone.getTransport().start(Tone.now())
            this.setState({isPlaying : true})
        } else {
            this.leadSynth.triggerRelease(Tone.now())
            this.clickLoop.stop(Tone.now());
            Tone.getTransport().stop(Tone.now())
            this.setState({isPlaying : false})
        }
    }
//Initialize ToneJS After User Input
    initToneJs() {
        //Setup Synth Instruments
        this.leadGain = new Tone.Gain(0.5).toDestination();
        this.leadSynth = new Tone.Synth().connect(this.leadGain);
        
        //Rhythm Instrument
        this.rhythmGain = new Tone.Gain(0.5).toDestination();
        this.rhythmSynth = new Tone.PolySynth().connect(this.rhythmGain);
        //Kick
        this.kickGain = new Tone.Gain(0.5).toDestination();
        this.kickSampler = new Tone.Player(this.props.config.kickUrl).connect(this.kickGain);
        //Snare
        this.snareGain = new Tone.Gain(0.5).toDestination();
        this.snareSampler = new Tone.Player(this.props.config.snareUrl).connect(this.snareGain);
        //Initialize Click Loop with base interval set in props.config
        console.log("creating clickloop")
        this.clickLoop = new Tone.Loop(time=>{
            this.clickCallback(time);
            
        }, this.props.config.clickBaseInterval);
        //Set transport BPM to state variable tempo
        Tone.Transport.bpm.value = this.props.config.tempo;
        //Start the transport now
        Tone.Transport.start(Tone.now());
        

        //Setup Complete
        console.log("Setup Synth");
        this.setup = true;  
    }    
//Metronome loop callback: loop accesses any class variables
    clickCallback(time){
        //const time = Tone.now()
        //Synth Lead Looper
        this.syncLeadLoop(time)

        //Play Kick at Loop Interval
        if(this.props.config.kickLoop[this.props.click]===1){
            this.kickSampler.start(time)
        }
        //Play Snare at Loop Interval
        if(this.props.config.snareLoop[this.props.click]===1){
            this.snareSampler.start(time)
        }

        //Play Rhythm Loop
        if(this.props.config.rhythmLoop[this.props.click]){
            this.playRhythm(this.props.config.rhythmLoop[this.props.click], time)
        }
        

        //Increment Loop and State variables
        this.props.click = this.props.click + 1;
        if(this.props.click >= this.props.config.loopLengthIntervals){
            this.props.click = 0;
        }
        
        this.setState({beatDisplay : this.props.click});
        
    }

//Loop Callback Functions - respond to UI, change values for loop and state
//Song props.config - keys, metronome
    //Load Key changes
    loadKey(root){
        this.key.root = root;
        this.props.updateConfig({keyRoot:root})//Update config in session
        const rootIndex = chromatic.indexOf(root)
        const rootFreq = chromNotes[rootIndex]

        //Get Key Intervals - Notes and Frequencies
        natMaj.map((semitone,index)=>{
            var chromIndex =  semitone + rootIndex;
            if(chromIndex>11){
                chromIndex = chromIndex - 12 //reset to 0
            }
            //Set note letter note
            this.key.intervals[index].note = (chromatic[chromIndex])
            //Set note frequency
            //TODO: To have ascending frequencies on all keys make this absolute
            //this.key.intervals[index].freq = (chromNotes[chromIndex])
            this.key.intervals[index].freq = rootFreq* Math.pow(2,semitone/12)
    
        })
    
        //Get Chord frequencies for each interval
        var majorChordShape = [0,4,7];
        var minorChordShape = [0,3,7];
        this.key.intervals.map((interval)=>{
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
        this.key.scaleFreqs.minorPent = []
        minorPent.map(semitone=>{
            var freq = rootFreq * Math.pow(2,semitone/12)
            this.key.scaleFreqs.minorPent.push(freq)
        })
        var majorPent = [0,2,4,7,9]
        this.key.scaleFreqs.majorPent = []
        majorPent.map(semitone=>{
            var freq = rootFreq * Math.pow(2,semitone/12)
            this.key.scaleFreqs.majorPent.push(freq)
        })
        var relMinorPent = [-3, 0,2,4,7]
        this.key.scaleFreqs.relMinorPent = []
        relMinorPent.map(semitone=>{
            var freq = rootFreq * Math.pow(2,semitone/12)
            this.key.scaleFreqs.relMinorPent.push(freq)
        })
        console.log(this.key)
    }
    //Changes Metronome Tempofor both state and Tone loop tempo values 
    changeTempo(value){
        //React State Tempo value    
        this.props.updateConfig({tempo: value});
        //Tone Loop tempo value
        Tone.getTransport().bpm.value = value;
    }

//Groove Loop Setup
    //Kick set Intervals
    kickSetLoop(intervals){
        this.props.updateConfig({kickLoop: intervals})
        //With backend this could be a mutation to update phrase props.config
    }
    changeKickGain(event){
        this.kickGain.gain.value = event.target.value/100
    }
    //Snare set Intervals
    snareSetLoop(intervals){
        this.props.updateConfig({snareLoop:intervals})
    }
    changeSnareGain(event){
        this.snareGain.gain.value = event.target.value/100
    }

//Lead Synth Callbacks
    //Keyboard Press: Event Listener Callback Play Synth and Set note
    keypress(e){
        if(!this.setup){
            this.initToneJs()
        }
        var keyNote = 0;
        switch(e.key){
            case 'f':
                keyNote = 1;
                break
            case 'g':
                keyNote = 2;
                break
            case 'h':
                keyNote = 3;
                break
            case 'j':
                keyNote = 4;
                break
            case 'k':
                keyNote = 5;
                break
        }
        if(this.leadKeyNote != keyNote){
            this.leadKeyNote = keyNote;
            this.playLeadSynth(keyNote, Tone.now())
            this.setState({leadKeyNoteDisplay: keyNote})
        } 
    }
    //Keyboard Press: Event Listener Callback
    keyup(e){
        var keyNote = 0;
        switch(e.key){
            case 'f':
                keyNote = 1;
                break
            case 'g':
                keyNote = 2;
                break
            case 'h':
                keyNote = 3;
                break
            case 'j':
                keyNote = 4;
                break
            case 'k':
                keyNote = 5;
                break
        }
        if(this.leadKeyNote === keyNote){
            this.playLeadSynth(0, Tone.now())
            this.setState({leadKeyNoteDisplay: 0});
            this.leadKeyNote = 0;
        }
    }
    //Returns the current note from either keypress or note
    syncLeadLoop(time){
        var synthNote = 0; //Set default synth note to 0
        //If a note is being played from the key press
        if(this.leadKeyNote > 0){ 
            //this.playLeadSynth(this.leadKeyNote,time)
            if(this.state.isLooping){
                var copyLoop = this.props.config.leadLoop; //Create copy of lead loop
                copyLoop[this.props.click] = this.leadKeyNote; //change current value to note being played
                this.props.updateConfig({leadLoop: copyLoop}) //set new state
            }
        }else { // Key is not playing check if a note loop is in the loop
            var loopNote = this.props.config.leadLoop[this.props.click]
            if(loopNote > 0){ // if the note in loop is not zero
                synthNote = loopNote;
                this.playLeadSynth(loopNote, time)
            } else {
                this.playLeadSynth(0, time)
            }
        }
    }
    //Play Lead Synth Given pentatonic note: 1-5
    playLeadSynth(synthNote, time){
        
        if (synthNote > 0){
            var playNote = this.key.scaleFreqs.majorPent[synthNote-1]
            if (playNote != this.leadPlayingNote){
                this.leadSynth.triggerAttack(playNote,  time)
                this.leadPlayingNote = playNote;
            }
        } else {
            this.leadSynth.triggerRelease(time)
            this.leadPlayingNote = 0;
        }
    }
    //Clear Loop
    clearLeadLoop(){
        var blankLoop = new Array(this.props.config.loopLengthIntervals).fill(0)
        this.props.updateConfig({leadLoop: blankLoop});
    }
    //Change gain
    changeLeadGain(value){
        this.leadGain.gain.value = value/100
    }

//Rhythm Setup
    //Add Chord to phrase list
    addChord(chord){
        var chordListCpy = this.state.chordList;
        chordListCpy.push(chord)
        this.props.updateConfig({chordList:chordListCpy})
        console.log(chordListCpy)
        this.setRhythmLoop(chordListCpy)
    }
    //Set the Rhythm Loop based on Chord Values
    setRhythmLoop(chordList){
        var rhythmLoop=[];
        chordList.forEach(chord => {
            console.log(chord.len)
            for (var i=0; i<chord.len ;i++){
                rhythmLoop.push(chord.chord.interval)
                console.log('Adding ' + chord.chord)
            }
        })
        
        console.log("Rhythm Loop Set")
        console.log(rhythmLoop)
        this.props.updateConfig({rhythmLoop: rhythmLoop})
    
    }
    clearRhythmLoop(){
        this.props.updateConfig({chordList:[]})
        this.props.updateConfig({rhythmLoop:[]})
    }
    //Trigger Rhythm when chord changes
    playRhythm(chord, time, length="8n",){
        if(this.props.config.rhythmGroove[this.props.click]===1){
        const chordObj = this.key.intervals.find((interval)=> interval.interval == chord)
        this.rhythmSynth.triggerAttackRelease(chordObj.chordFreqs,length, time);
        this.rhythmPlayingNote = chord;
        }
    }
    changeRhythmGain(event){
        this.rhythmGain.gain.value = event.target.value/100
    }


    render() {return (
        <Screen>
            <h1 style={{color: Colors.pop,textAlign:'center'}}>The Jam-Bot</h1>
            <RowSection>
                <button onClick={this.startJambot.bind(this)}>{this.state.isPlaying ? 'Stop' : 'Start'}</button>
                <p>Root: </p>
                        <select value={this.props.config.keyRoot} onChange={(event)=>{this.loadKey(event.target.value)}} name="keySelect"> 
                            {chromatic.map((root, index)=>
                                <option key={index} value={root}>{root}</option>
                            )}
                        </select>
                <button onClick={()=>{this.setState({isLooping:!this.state.isLooping})}}>{this.state.isLooping ? 'Looping' : 'Not Looping'}</button>
            </RowSection>
            <RowSection>
                <p> Bar: {Math.floor(this.state.beatDisplay/8)+1}, Beat: {Math.floor((this.state.beatDisplay/2)%4)+1}, Interval: {this.state.beatDisplay%2} </p>
                <p>Tempo: {this.state.tempo}</p>
                <input type='range' value={this.props.config.tempo} onChange={(event)=>{this.changeTempo(event)}} min="50" max="250"/>     
            </RowSection>
            <InstrumentWrapper> 
                <RowSection> 
                   <InstTitle>Kick</InstTitle>
                    <img src={'/kickIcon.png'} width="50" height="50"/>
                    <webaudio-knob ref={node=>this.knobRef = node} src={'/knob_1.png'} value={50} diameter="50" id="knob1" />
                    
                </RowSection>
                <Sequencer intervals={this.props.config.kickLoop} setIntervals={this.kickSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
            </InstrumentWrapper>
            <InstrumentWrapper>
                <RowSection> 
                    <InstTitle>Snare</InstTitle>
                    <img src={'/snareIcon.png'} width="70" height="70"/>
                    <ColSection>
                    <webaudio-knob ref={node=>this.snareRef = node} src={'/knob_1.png'} value={50} diameter="50" id="knobSnare" />
                    </ColSection>
                </RowSection>
                <Sequencer intervals={this.props.config.snareLoop} setIntervals={this.snareSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
            </InstrumentWrapper>
            <InstrumentWrapper>
            <RowSection> 
                <InstTitle>Rhythm</InstTitle>
                
                <webaudio-knob ref={node=>this.rhythmRef = node} src={'/knob_1.png'} value={50} diameter="50" id="knobRhythm" />
            </RowSection>
            <RowSection> 
                <button onClick={()=>this.playRhythm('I')}>Play I Chord: {this.key.intervals[0].note + this.key.intervals[0].chordMode}</button>
                <button onClick={()=>this.playRhythm('ii')}>Play ii Chord {this.key.intervals[1].note+ this.key.intervals[1].chordMode}</button>
                <button onClick={()=>this.playRhythm('iii')}>Play iii Chord {this.key.intervals[2].note+ this.key.intervals[2].chordMode}</button>
                <button onClick={()=>this.playRhythm('IV')}>Play IV Chord {this.key.intervals[3].note+ this.key.intervals[3].chordMode}</button>
                <button onClick={()=>this.playRhythm('V')}>Play V Chord {this.key.intervals[4].note+ this.key.intervals[4].chordMode}</button>
                <button onClick={()=>this.playRhythm('vi')}>Play vi Chord {this.key.intervals[5].note+ this.key.intervals[5].chordMode}</button>
            </RowSection>
            <Progression addChord={this.addChord.bind(this)} chordList={this.props.config.chordList} chords={this.key.intervals} clearChords={this.clearRhythmLoop.bind(this)}/>
            </InstrumentWrapper>
            <RowSection> 
                <p>Lead</p>
                <p>Volume</p>
                <input type='range' onChange={(event)=>this.changeLeadGain(event.target.value)}/>
            </RowSection>
            <RowSection>
                <p> Lead Interval: {this.state.leadKeyNoteDisplay}</p>
                <ColSection>
                    <p>Scale: {this.props.config.scaleShape} </p>
                    <RowSection> 

                    </RowSection>
                </ColSection>
                <button onClick={this.clearLeadLoop.bind(this)}> Reset Loop </button>
            </RowSection>
            <Sequencer intervals={this.props.config.leadLoop} setIntervals={this.snareSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
        
            <Keys keypress={this.keypress} keyup={this.keyup} />
        </Screen>
    )}
}

export default JamBot
