import React, {Component, useState} from 'react'
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection} from '../components/styledComponents'
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



const defaultPhraseConfig = {
    rootNote: 'C4', //is the 1 interval
    scalePattern: [6, 1 , 2, 3, 5 ], //Minor Pentatonic mode of major root C
    numBars: 2, 
    beatsPerBar: 4,
    beatIntervals: 2,
    loopLengthIntervals: 16,
    clickBaseInterval: '8n',
    kickUrl: "/samples/kick.wav",
    snareUrl: "/samples/snare.wav"
}

/**
 * TODO: 
 * 
 * -Instrument configurations & UI
 *      -Kick/Snare Select Sample files, Adjust Gain
 *      -Lead Tone and Octave Changer, Scale Selection
 * 
 * -Lead Loop Visualizer
 *      -canvas midi type visualizer
 * 
 * -Alternate phrases - save song configuration
 * 
 * -Selectable Keyboard instruments - Link keys to instrument on selection
 */

class JamBot extends Component {
    constructor(props){
        super(props);
        this.config = defaultPhraseConfig;//Used when config not provided
        this.state = {
            isPlaying: false,
            isLooping: false,
            tempo: 120,
            leadKeyNoteDisplay: 0,
            beatDisplay: 0,
            keyRoot: 'A',
            scaleShape: 'Major Pent',
            chordList: [],

            //TODO: Generate loops from backend
            kickLoop:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,],
            snareLoop: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,],
            leadLoop: new Array(this.config.loopLengthIntervals).fill(0),
            rhythmLoop: new Array(this.config.loopLengthIntervals).fill(0),
            rhythmGroove: [1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1]


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
        this.currentInterval = 0;
        this.setup = false;
        this.leadKeyNote = 0;//Tracks key press in real time
        this.leadPlayingNote = 0;//Tracks note being played by synth in real time
        this.rhythmPlayingNote = '';
        this.keyup = this.keyup.bind(this)
        this.keypress = this.keypress.bind(this)
        this.loadKey(this.state.keyRoot);
        
        
    }
    
//Component Mount
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
        this.leadSynth = new Tone.Synth().toDestination();
        this.rhythmSynth = new Tone.PolySynth().toDestination();
        //Kick
        this.kickSampler = new Tone.Player(this.config.kickUrl).toDestination();
        //Snare
        this.snareSampler = new Tone.Player(this.config.snareUrl).toDestination();
        //Initialize Click Loop with base interval set in config
        console.log("creating clickloop")
        this.clickLoop = new Tone.Loop(time=>{
            this.clickCallback(time);
            
        }, this.config.clickBaseInterval);
        //Set transport BPM to state variable tempo
        Tone.Transport.bpm.value = this.state.tempo;
        //Start the transport now
        Tone.Transport.start(Tone.now());
        

        //Setup Complete
        console.log("Setup Synth");
        this.setup = true;  
    }    
//Metronome loop callback: loop accesses any class variables
    clickCallback(times){
        const time = Tone.now()
        //Synth Lead Looper
        this.syncLeadLoop(time)

        //Play Kick at Loop Interval
        if(this.state.kickLoop[this.currentInterval]===1){
            this.kickSampler.start(time)
        }
        //Play Snare at Loop Interval
        if(this.state.snareLoop[this.currentInterval]===1){
            this.snareSampler.start(time)
        }

        //Play Rhythm Loop
        if(this.state.rhythmLoop[this.currentInterval]){
            this.playRhythm(this.state.rhythmLoop[this.currentInterval], time)
        }
        

        //Increment Loop and State variables
        this.currentInterval = this.currentInterval + 1;
        if(this.currentInterval >= this.config.loopLengthIntervals){
            this.currentInterval = 0;
        }
        
        this.setState({beatDisplay : this.currentInterval});
        
    }

//Loop Callback Functions - respond to UI, change values for loop and state
//Song Config - keys, metronome
    //Load Key changes
    loadKey(root){
        this.key.root = root;
        this.setState({keyRoot:root})
        const rootIndex = chromatic.indexOf(root)
        
        //Get Key Intervals - Notes and Frequencies
        natMaj.map((semitone,index)=>{
            var chromIndex =  semitone + rootIndex;
            if(chromIndex>11){
                chromIndex = chromIndex - 12 //reset to 0
            }
            //Set note letter note
            this.key.intervals[index].note = (chromatic[chromIndex])
            //Set note frequency
            this.key.intervals[index].freq = (chromNotes[chromIndex])
    
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
        const rootFreq = chromNotes[rootIndex]
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
        this.setState({tempo: value});
        //Tone Loop tempo value
        Tone.getTransport().bpm.value = value;
    }

//Groove Loop Setup
    //Kick set Intervals
    kickSetLoop(intervals){
        this.setState({kickLoop: intervals})
        //With backend this could be a mutation to update phrase config
    }
    //Snare set Intervals
    snareSetLoop(intervals){
        this.setState({snareLoop:intervals})
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
                var copyLoop = this.state.leadLoop; //Create copy of lead loop
                copyLoop[this.currentInterval] = this.leadKeyNote; //change current value to note being played
                this.setState({leadLoop: copyLoop}) //set new state
            }
        }else { // Key is not playing check if a note loop is in the loop
            var loopNote = this.state.leadLoop[this.currentInterval]
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
        var blankLoop = new Array(this.config.loopLengthIntervals).fill(0)
        this.setState({leadLoop: blankLoop});
    }
//Rhythm Setup
    //Add Chord to phrase list
    addChord(chord){
        var chordListCpy = this.state.chordList;
        chordListCpy.push(chord)
        this.setState({chordList:chordListCpy})
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
        this.setState({rhythmLoop: rhythmLoop})
    
    }
    clearRhythmLoop(){
        this.setState({chordList:[]})
        this.setState({rhythmLoop:[]})
    }
    //Trigger Rhythm when chord changes
    playRhythm(chord, time, length="8n",){
        if(this.state.rhythmGroove[this.currentInterval]===1){
        const chordObj = this.key.intervals.find((interval)=> interval.interval == chord)
        this.rhythmSynth.triggerAttackRelease(chordObj.chordFreqs,length, time);
        this.rhythmPlayingNote = chord;
        }
    }


    render() {return (
        <Screen>
            <h1 style={{color: Colors.primary,textAlign:'center'}}>Jambot!</h1>
            <h2 style={{textAlign:'center'}} >"Never Jam Alone Again"</h2>
            <RowSection>
                <button onClick={this.startJambot.bind(this)}>{this.state.isPlaying ? 'Stop' : 'Start'}</button>
                <button onClick={()=>{this.setState({isLooping:!this.state.isLooping})}}>{this.state.isLooping ? 'Looping' : 'Not Looping'}</button>
            </RowSection>
            <RowSection>
                <p> Bar: {Math.floor(this.state.beatDisplay/16)+1}, Beat: {Math.floor((this.state.beatDisplay/4)%4)+1}, Interval: {this.state.beatDisplay%4} </p>
                <p>Tempo: {this.state.tempo}</p>
                <input type='range' value={this.state.tempo} onChange={(event)=>{this.changeTempo(event.target.value)}} min="50" max="250"/>     
            </RowSection>
            <p>Kick Sequencer</p>
            <Sequencer intervals={this.state.kickLoop} setIntervals={this.kickSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
            <p>Snare Sequencer</p>
            <Sequencer intervals={this.state.snareLoop} setIntervals={this.snareSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
            <p>Rhythm chords</p>
            <RowSection> 
                <button onClick={()=>this.playRhythm('I')}>Play I Chord: {this.key.intervals[0].note + this.key.intervals[0].chordMode}</button>
                <button onClick={()=>this.playRhythm('ii')}>Play ii Chord {this.key.intervals[1].note+ this.key.intervals[1].chordMode}</button>
                <button onClick={()=>this.playRhythm('iii')}>Play iii Chord {this.key.intervals[2].note+ this.key.intervals[2].chordMode}</button>
                <button onClick={()=>this.playRhythm('IV')}>Play IV Chord {this.key.intervals[3].note+ this.key.intervals[3].chordMode}</button>
                <button onClick={()=>this.playRhythm('V')}>Play V Chord {this.key.intervals[4].note+ this.key.intervals[4].chordMode}</button>
                <button onClick={()=>this.playRhythm('vi')}>Play vi Chord {this.key.intervals[5].note+ this.key.intervals[5].chordMode}</button>
            </RowSection>
            <Progression addChord={this.addChord.bind(this)} chordList={this.state.chordList} chords={this.key.intervals} clearChords={this.clearRhythmLoop.bind(this)}/>
            <RowSection>
                <p> Lead Interval: {this.state.leadKeyNoteDisplay}</p>
                <ColSection>
                    <p>Scale: {this.state.scaleShape} </p>
                    <RowSection> 
                        <p>Root: </p>
                        <select value={this.state.keyRoot} onChange={(event)=>{this.loadKey(event.target.value)}} name="keySelect"> 
                            {chromatic.map((root, index)=>
                                <option key={index} value={root}>{root}</option>
                            )}
                        </select>
                    </RowSection>
                </ColSection>
                <button onClick={this.clearLeadLoop.bind(this)}> Reset Loop </button>
            </RowSection>
            <Sequencer intervals={this.state.leadLoop} setIntervals={this.snareSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
        
            <Keys keypress={this.keypress} keyup={this.keyup} />
        </Screen>
    )}
}

export default JamBot
