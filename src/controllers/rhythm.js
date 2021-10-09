import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection, InstrumentWrapper, InstTitle} from '../components/styledComponents'
import Progression from '../components/Progression';
import Sequencer from '../components/Sequencer';
import knob from '../logos/knob_1.png'
import { PluckSynth } from 'tone';


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
        let rhythmOct = ReactDOM.findDOMNode(this.rhythmOct)
        rhythmOct.addEventListener("input", this.changeRhythmOct.bind(this)) 
    }

    init() {
        //Rhythm Instrument
        this.rhythmGain = new Tone.Gain(0.5).toDestination();
        this.rhythmSynth = new Tone.PolySynth().connect(this.rhythmGain);
        this.rhythmSynth.set({detune:-2400})
    }
    clickCallback(click, time){
        //Play Rhythm Loop
        var rhythmLoop = this.props.config.rhythmLoop;
        if(rhythmLoop[click % rhythmLoop.length]){
            if(this.props.config.rhythmGroove[click % this.props.config.loopLengthIntervals]){
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

    delChord(index){
        var clCopy = this.props.config.chordList;
        var newC = clCopy.splice(index,1)
        console.log(index)
        console.log(`chord at ${index} removed`)
        this.props.updateConfig({chordList:clCopy})
        this.setRhythmLoop(clCopy)
        

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
            
            this.rhythmPlayingNote = chord;
        
    }
    changeRhythmGain(event){
        this.rhythmGain.gain.value = event.target.value/100
    }
    changeRhythmOct(event){
        var oct = Math.floor(event.target.value / 30)
        console.log(oct)
        switch (oct){
            case 0:
                this.rhythmSynth.set({detune:-2400})
                break;
            case 1:
                this.rhythmSynth.set({detune:-1200})
                break;
            case 2:
                this.rhythmSynth.set({detune:0})
                break;
        }

    }

    render() {
        return (
            <>  
            <InstrumentWrapper>
            <RowSection> 
                <InstTitle>Rhythm</InstTitle>
                <webaudio-knob ref={node=>this.rhythmOct = node} src={knob} value={25} diameter="50" id="knobRhythm" />
                <webaudio-knob ref={node=>this.rhythmRef = node} src={knob} value={50} diameter="50" id="knobRhythm" />
            </RowSection>
            <RowSection> 
                <button onClick={()=>this.playRhythm('I')}>Play I Chord: {this.props.config.key.intervals[0].note + this.props.config.key.intervals[0].chordMode}</button>
                <button onClick={()=>this.playRhythm('ii')}>Play ii Chord {this.props.config.key.intervals[1].note+ this.props.config.key.intervals[1].chordMode}</button>
                <button onClick={()=>this.playRhythm('iii')}>Play iii Chord {this.props.config.key.intervals[2].note+ this.props.config.key.intervals[2].chordMode}</button>
                <button onClick={()=>this.playRhythm('IV')}>Play IV Chord {this.props.config.key.intervals[3].note+ this.props.config.key.intervals[3].chordMode}</button>
                <button onClick={()=>this.playRhythm('V')}>Play V Chord {this.props.config.key.intervals[4].note+ this.props.config.key.intervals[4].chordMode}</button>
                <button onClick={()=>this.playRhythm('vi')}>Play vi Chord {this.props.config.key.intervals[5].note+ this.props.config.key.intervals[5].chordMode}</button>
            </RowSection>
            <Progression delChord={this.delChord.bind(this)} addChord={this.addChord.bind(this)} chordList={this.props.config.chordList} chords={this.props.config.key.intervals} clearChords={this.clearRhythmLoop.bind(this)}/>
            <p>Groove Pattern</p>
            <Sequencer intervals={this.props.config.rhythmGroove} setIntervals={(intervals)=>{this.props.updateConfig({rhythmGroove:intervals})}} division={1}/>
            </InstrumentWrapper>
            </>
        )
    }
}
