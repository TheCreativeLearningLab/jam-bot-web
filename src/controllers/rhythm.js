import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection, InstrumentWrapper, InstTitle} from '../components/styledComponents'
import Progression from '../components/Progression';
import Sequencer from '../components/Sequencer';


export default class Rhythm extends Component {
    constructor(props){
        super(props);

        this.rhythmPlayingNote = '';

        this.state = {

        }

    }

    //Component Mounts Add listeners for Knobs
    componentDidMount(){
        let rhythmNode = ReactDOM.findDOMNode(this.rhythmRef)
        rhythmNode.addEventListener("input", this.changeRhythmGain.bind(this))  
    }

    init() {
        //Rhythm Instrument
        this.rhythmGain = new Tone.Gain(0.5).toDestination();
        this.rhythmSynth = new Tone.PolySynth().connect(this.rhythmGain);
    }
    clickCallback(click, time){
        //Play Rhythm Loop
        var rhythmLoop = this.props.config.rhythmLoop;
        if(rhythmLoop[click % rhythmLoop.length]){
            if(this.props.config.rhythmGroove[click % this.props.config.loopLengthIntervals]){
                console.log(`Click: ${click}`)
                console.log(`RhythmLoop: ${rhythmLoop}`)
                console.log(`Chord: ${rhythmLoop[click % rhythmLoop.length]}`)
                this.playRhythm(rhythmLoop[click % rhythmLoop.length], time)

            }
            }
    }

    
        //Add Chord to phrase list
    addChord(chord){
        var chordListCpy = this.props.config.chordList;
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
    async clearRhythmLoop(){
        await this.props.updateConfig({chordList:[]})
        this.props.updateConfig({rhythmLoop:[]})
    }
    //Trigger Rhythm when chord changes
    playRhythm(chord, time, length="8n",){
            const chordObj = this.props.config.key.intervals.find((interval)=> interval.interval == chord)
            this.rhythmSynth.triggerAttackRelease(chordObj.chordFreqs,length, time);
            console.log("playing Rhythm")
            this.rhythmPlayingNote = chord;
        
    }
    changeRhythmGain(event){
        this.rhythmGain.gain.value = event.target.value/100
    }

    render() {
        return (
            <>  
            <InstrumentWrapper>
            <RowSection> 
                <InstTitle>Rhythm</InstTitle>
                
                <webaudio-knob ref={node=>this.rhythmRef = node} src={'/knob_1.png'} value={50} diameter="50" id="knobRhythm" />
            </RowSection>
            <RowSection> 
                <button onClick={()=>this.playRhythm('I')}>Play I Chord: {this.props.config.key.intervals[0].note + this.props.config.key.intervals[0].chordMode}</button>
                <button onClick={()=>this.playRhythm('ii')}>Play ii Chord {this.props.config.key.intervals[1].note+ this.props.config.key.intervals[1].chordMode}</button>
                <button onClick={()=>this.playRhythm('iii')}>Play iii Chord {this.props.config.key.intervals[2].note+ this.props.config.key.intervals[2].chordMode}</button>
                <button onClick={()=>this.playRhythm('IV')}>Play IV Chord {this.props.config.key.intervals[3].note+ this.props.config.key.intervals[3].chordMode}</button>
                <button onClick={()=>this.playRhythm('V')}>Play V Chord {this.props.config.key.intervals[4].note+ this.props.config.key.intervals[4].chordMode}</button>
                <button onClick={()=>this.playRhythm('vi')}>Play vi Chord {this.props.config.key.intervals[5].note+ this.props.config.key.intervals[5].chordMode}</button>
            </RowSection>
            <Progression addChord={this.addChord.bind(this)} chordList={this.props.config.chordList} chords={this.props.config.key.intervals} clearChords={this.clearRhythmLoop.bind(this)}/>
            <p>Groove Pattern</p>
            <Sequencer intervals={this.props.config.rhythmGroove} setIntervals={(intervals)=>{this.props.updateConfig({rhythmGroove:intervals})}} division={1}/>
            </InstrumentWrapper>
            </>
        )
    }
}
