import React, {Component, useState} from 'react'
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection} from '../components/styledComponents'
import Keys from '../components/Keys';
import Sequencer from '../components/Sequencer';
const defaultPhraseConfig = {
    rootNote: 'C4', //is the 1 interval
    scalePattern: [6, 1 , 2, 3, 5 ], //Minor Pentatonic mode of major root C
    numBars: 2, 
    beatsPerBar: 4,
    beatIntervals: 4,
    loopLengthIntervals: 32,
    clickBaseInterval: '16n',
    kickUrl: "/samples/kick.wav",
    snareUrl: "/samples/snare.wav",
    keyRootFreq: {
        'A': 220,

    }
}

/**
 * TODO: 
 * -Instrument configurations
 *     -Add Rhythm Instrument
 *     -Kick/Snare Select Sample files, Adjust Gain
 *     -Key Changes for Lead Synth
 * 
 * -Lead Loop Visualizer
 *     -canvas midi type visualizer
 * 
 * -Alternate phrases - save song configuration
 * 
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

            //TODO: Change to default loop generation function
            kickLoop: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,],
            snareLoop: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,],
            leadLoop: new Array(this.config.loopLengthIntervals).fill(0),
            rhythmLoop: new Array(this.config.loopLengthIntervals).fill(0)

        }
        this.currentInterval = 0;
        this.setup = false;
        this.leadKeyNote = 0;//Tracks key press in real time
        this.leadPlayingNote = 0;//Tracks note being played by synth in real time
        this.keyup = this.keyup.bind(this)
        this.keypress = this.keypress.bind(this)
        
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
    clickCallback(time){
    
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


        //Increment Loop and State variables
        this.currentInterval = this.currentInterval + 1;
        if(this.currentInterval >= this.config.loopLengthIntervals){
            this.currentInterval = 0;
        }
        this.setState({beatDisplay : this.currentInterval});
        
    }

//Loop Callback Functions - respond to UI, change values for loop and state
    //Get Key Notes from Loop
    getKeyNotes(){

    }
    //Changes Metronome Tempofor both state and Tone loop tempo values 
    changeTempo(value){
        //React State Tempo value    
        this.setState({tempo: value});
        //Tone Loop tempo value
        Tone.getTransport().bpm.value = value;
    }
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
    //Kick set Intervals
    kickSetLoop(intervals){
        this.setState({kickLoop: intervals})
        //With backend this could be a mutation to update phrase config
    }
    //Snare set Intervals
    snareSetLoop(intervals){
        this.setState({snareLoop:intervals})
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
            var playNote;
            switch (synthNote){
                case 1:
                    playNote = 220;//A3 note frequency
                    break
                case 2:
                    playNote = "C4"
                    break
                case 3:
                    playNote = "D4"
                    break
                case 4:
                    playNote = "E4"
                    break
                case 5:
                    playNote = "G4"
                    break
            }
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


    render() {return (
        <Screen>
            <h1 style={{color: Colors.primary,textAlign:'center'}}>Jambot!</h1>
            <h2 style={{textAlign:'center'}} >Never Jam Alone</h2>
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
            <Sequencer intervals={this.state.kickLoop} setIntervals={this.kickSetLoop.bind(this)} division={2} currentInterval={this.state.beatDisplay}/>
            <p>Snare Sequencer</p>
            <Sequencer intervals={this.state.snareLoop} setIntervals={this.snareSetLoop.bind(this)} division={2} currentInterval={this.state.beatDisplay}/>
            <RowSection>
            <p> Lead Note: {this.state.leadKeyNoteDisplay}</p>
            <button onClick={this.clearLeadLoop.bind(this)}> Reset Loop </button>
            </RowSection>
            <Sequencer intervals={this.state.leadLoop} setIntervals={this.snareSetLoop.bind(this)} division={1} currentInterval={this.state.beatDisplay}/>
        
            <Keys keypress={this.keypress} keyup={this.keyup} />
        </Screen>
    )}
}

export default JamBot
