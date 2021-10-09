import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import * as Tone from 'tone'
import {Colors, Screen, RowSection, ColSection, InstrumentWrapper, InstTitle} from '../components/styledComponents'
import Sequencer from '../components/Sequencer';
import knob from '../logos/knob_1.png'
import kickicon from '../logos/kickIcon.png'
import snareicon from '../logos/snareIcon.png'

export default class Drums extends Component {
    constructor(props){
        super(props);
        this.state = {
            kickGain:0.5,
        }
    }
    componentDidMount(){
        let kickNode = ReactDOM.findDOMNode(this.knobRef)
        let snareNode = ReactDOM.findDOMNode(this.snareRef)
        kickNode.addEventListener("input", this.changeKickGain.bind(this))
        snareNode.addEventListener("input", this.changeSnareGain.bind(this))
    }
    //Must be triggered by user action
    init(){
        //Kick
        this.kickGain = new Tone.Gain(0.5).toDestination();
        this.kickSampler = new Tone.Player(this.props.config.kickUrl).connect(this.kickGain);
        //Snare
        this.snareGain = new Tone.Gain(0.5).toDestination();
        this.snareSampler = new Tone.Player(this.props.config.snareUrl).connect(this.snareGain);
    }

    clickCallback(click, time){
            //Play Kick at Loop Interval
            var kickLoop = this.props.config.kickLoop;
            if(kickLoop[ click %kickLoop.length ]===1){
                this.kickSampler.start(time)
            }
            //Play Snare at Loop Interval
            var snareLoop = this.props.config.snareLoop;
            if(snareLoop[click%snareLoop.length]===1){
                this.snareSampler.start(time)
            }

    }
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


    render() {
        return (
            <div>
                <InstrumentWrapper> 
                <RowSection> 
                   <InstTitle>Kick </InstTitle>
                    <img src={kickicon} width="50" height="50"/>
                    <webaudio-knob ref={node=>this.knobRef = node} src={knob} value={50} diameter="50" id="knob1" />
                    
                </RowSection>
                <Sequencer intervals={this.props.config.kickLoop} setIntervals={this.kickSetLoop.bind(this)} division={1} currentInterval={this.props.click%this.props.config.kickLoop.length}/>
            </InstrumentWrapper>
            <InstrumentWrapper>
                <RowSection> 
                    <InstTitle>Snare</InstTitle>
                    <img src={snareicon} width="70" height="70"/>
                    <ColSection>
                    <webaudio-knob ref={node=>this.snareRef = node} src={knob} value={50} diameter="50" id="knobSnare" />
                    </ColSection>
                </RowSection>
                <Sequencer intervals={this.props.config.snareLoop} setIntervals={this.snareSetLoop.bind(this)} division={1} currentInterval={this.props.click%this.props.config.kickLoop.length}/>
            </InstrumentWrapper>
            </div>
        )
    }
}
