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
import Drums from './drums'

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


          
    }
    

//Initialize ToneJS After User Input
    init() {
 
    }    
//Metronome loop callback: loop accesses any class variables
    clickCallback(click, time){
        
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
        //Tone.getTransport().bpm.value = value;
    }

//Groove Loop Setup




//Rhythm Setup



    render() {return (
        <Screen>
            

        </Screen>
    )}
}

export default JamBot
