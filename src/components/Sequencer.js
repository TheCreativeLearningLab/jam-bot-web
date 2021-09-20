import React from 'react'
import { RowSection, ColSection } from './styledComponents';

//Sequencer displays a list of intervals either on(1) or off(0)
//Takes the intervals to be displayed, current interval to highligh
const Sequencer = ({intervals, setIntervals, division, currentInterval, }) => {
   const toggleState = (index) =>{
        var intervalsCopy = intervals;
        if (intervalsCopy[index] === 1){
            intervalsCopy[index] = 0;
        } else {
            intervalsCopy[index] =1;
        }
        setIntervals(intervalsCopy)
   }

    return (
        <RowSection>
            {intervals.map((item, index)=>{if((index%division)===0){
                if(index%4===0){
                    var label = (Math.floor(index/4)%4)+1;
                } else {
                    var label = '+'
                }
                if(currentInterval === index){
                    var outline = 'bold'
                } else {
                    var outline = 'normal'
                }
                return(
                <ColSection key={index}> 
                    <p style={{textAlign:'center', fontWeight:outline}}>{label}</p>
                    <button key={index} onClick={()=>{toggleState(index)}}> {item} </button>
                </ColSection>
            )}}
                )}
        </RowSection>
    )
}

export default Sequencer
