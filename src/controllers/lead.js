import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection, InstrumentWrapper, InstTitle} from '../components/styledComponents'
import Sequencer from '../components/Sequencer';
import Keys from '../components/Keys';
export default class Lead extends Component {
    constructor(props){
        super(props);
        this.keyup = this.keyup.bind(this)
        this.keypress = this.keypress.bind(this)
        this.leadKeyNote = 0;//Tracks key press in real time
        this.leadPlayingNote = 0;//Tracks note being played by synth in real time
        this.state = {
            leadKeyNoteDisplay: 0,
            isLooping: false,
        }

    }
    init(){
        //Setup Synth Instruments
        this.leadGain = new Tone.Gain(0.5).toDestination();
        this.leadSynth = new Tone.Synth().connect(this.leadGain);
            
    }

    clickCallback(click, time){
        //const time = Tone.now()
        //Synth Lead Looper
        this.syncLeadLoop(click,time)
    }
    

    //Lead Synth Callbacks

    //Keyboard Press: Event Listener Callback Play Synth and Set note
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
        if(this.leadKeyNote != keyNote){
            this.leadKeyNote = keyNote;
            this.playLeadSynth(keyNote)
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
            this.playLeadSynth(0)
            this.setState({leadKeyNoteDisplay: 0});
            this.leadKeyNote = 0;
        }
    }
    //Returns the current note from either keypress or note
    syncLeadLoop(click, time){
        var loopInt = click % this.props.config.loopLengthIntervals;
        var synthNote = 0; //Set default synth note to 0
        //If a note is being played from the key press
        if(this.leadKeyNote > 0){ 
            //this.playLeadSynth(this.leadKeyNote,time)
            if(this.state.isLooping){
                var copyLoop = this.props.config.leadLoop; //Create copy of lead loop
                copyLoop[loopInt] = this.leadKeyNote; //change current value to note being played
                this.props.updateConfig({leadLoop: copyLoop}) //set new state
            }
        }else { // Key is not playing check if a note loop is in the loop
            var loopNote = this.props.config.leadLoop[loopInt]
            if(loopNote > 0){ // if the note in loop is not zero
                synthNote = loopNote;
                this.playLeadSynth(loopNote, time)
            } else {
                this.playLeadSynth(0, time)
            }
        }
    }
    //Play Lead Synth Given pentatonic note: 1-5
    playLeadSynth(synthNote){
        
        if (synthNote > 0){
            var playNote = this.props.config.key.scaleFreqs.majorPent[synthNote-1]
            if (playNote != this.leadPlayingNote){
                this.leadSynth.triggerAttack(playNote)
                this.leadPlayingNote = playNote;
            }
        } else {
            this.leadSynth.triggerRelease()
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
    render() {
        return (
            <InstrumentWrapper>
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
                    <button onClick={()=>{this.setState({isLooping: !this.state.isLooping})}}> {this.state.isLooping?'Looping':'Not Looping'} </button>
                    <button onClick={this.clearLeadLoop.bind(this)}> Reset Loop </button>
                </RowSection>
                <Sequencer intervals={this.props.config.leadLoop}  division={1} currentInterval={this.state.beatDisplay}/>
            
                <Keys keypress={this.keypress} keyup={this.keyup} />
            </InstrumentWrapper>
        )
    }
}
