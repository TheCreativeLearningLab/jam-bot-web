import React, {Component, useState} from 'react'
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection} from '../components/styledComponents'
import Keys from '../components/Keys';
const defaultConfig = {
    lengthBars: 4, 
    beatsPerBar: 4,
    beatIntervals: 4,
    loopLengthIntervals: 64,
    clickBaseInterval: '16n',
    kickLoop:[],
    snareLoop:[],
    rhythmLoop:[],
    leadLoop:[],


}

class JamBot extends Component {
    constructor(props){
        super(props);
        this.state = {
            isPlaying: false,
            tempo: 120,
            leadNoteDisplay: 0,
            beatDisplay: 0
        }
        this.currentInterval = 0;
        this.setup = false;
        this.leadNote = 0;
        this.keyup = this.keyup.bind(this)
        this.keypress = this.keypress.bind(this)
        if(this.props.config){
            this.config = this.props.config
        } else {
            this.config = defaultConfig;
        }
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
            this.clickLoop.stop(Tone.now());
            Tone.getTransport().stop(Tone.now())
            this.setState({isPlaying : false})
        }
    }

//Initialize ToneJS After User Input
    initToneJs() {
        //Setup Synth Instruments
        this.leadSynth = new Tone.Synth().toDestination();
        //Initialize Click Loop with quarter notes "4n"
        console.log("creating clickloop")
        this.clickLoop = new Tone.Loop(time=>{
            this.clickCallback(time);
            
        }, this.config.clickBaseInterval);
        //Set transport BPM to state variable tempo
        Tone.Transport.bpm.value = this.state.tempo;
        //Start the transport now
        //Tone.Transport.start();
        

        //Setup Complete
        console.log("Setup Synth");
        this.setup = true;  
    }    

//Metronome loop callback:
    clickCallback(time){
    
        //Get Lead Note
        const lNote = this.leadNote;


        

        //Increment Loop and State variables
        this.currentInterval = this.currentInterval + 1;
        if(this.currentInterval === this.config.loopLengthIntervals){
            this.currentInterval = 0;
        }
        this.setState({beatDisplay : this.currentInterval});
        
    }

//Callback Functions
    //Changes Metronome Tempofor both state and Tone loop tempo values 
    changeTempo(value){
        //React State Tempo value    
        this.setState({tempo: value});
        //Tone Loop tempo value
        Tone.getTransport().bpm.value = value;
    }

    //Keyboard Press: Event Listener Callback
    keypress(e){
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
        if(this.leadNote != keyNote){
            console.log('Lead Note: '+ keyNote)
            this.leadNote = keyNote;
            this.setState({leadNoteDisplay: keyNote})
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
        if(this.leadNote === keyNote){
            console.log("Released " + keyNote)
            this.setState({leadNoteDisplay: 0});
            this.leadNote = 0;
        }
    }


    render() {return (
        <Screen>
            <h1 style={{color: Colors.primary,textAlign:'center'}}>Jambot!</h1>
            <h2 style={{textAlign:'center'}} >Never Jam Alone</h2>
            <RowSection>
                <button onClick={this.startJambot.bind(this)}>{this.state.isPlaying ? 'Stop' : 'Start'}</button>
            </RowSection>
            <RowSection>
                <p> Bar: {Math.floor(this.state.beatDisplay/16)+1}, Beat: {Math.floor((this.state.beatDisplay/4)%4)+1}, Interval: {this.state.beatDisplay%4} </p>
                <p>Tempo: {this.state.tempo}</p>
                <input type='range' value={this.state.tempo} onChange={(event)=>{this.changeTempo(event.target.value)}} min="50" max="250"/>     
            </RowSection>
            <p> Lead Note: {this.state.leadNoteDisplay}</p>
            
            <Keys keypress={this.keypress} keyup={this.keyup} />
        </Screen>
    )}
}

export default JamBot
