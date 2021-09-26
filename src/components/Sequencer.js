import React from 'react'
import { Colors, RowSection, ColSection } from './styledComponents';
import styled from 'styled-components';

const Pad = styled.button`
    background-color: #71F79F;
    width: 15%;
    height: 50px;
`;

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
                if(index%2===0){
                    var label = (Math.floor(index/2)%4)+1;
                } else {
                    var label = '+'
                }
                if(currentInterval === index){
                    var outline = Colors.logo
                } else {
                    var outline = Colors.primary
                }
                switch (item){
                    case 0:
                        var color = Colors.dark
                        break;
                    case 1:
                        var color = Colors.pop
                        break;
                    case 2:
                        var color = '#6320EE'
                        break;
                    case 3:
                        var color = '#218380'
                        break;
                    case 4:
                        var color = '#73D2DE'
                        break;
                    case 5:
                        var color = '#8F2D56'
                        break;
                }

                return(
                <ColSection key={index}> 
                    
                    <Pad key={index} 
                        style = {{backgroundColor:color}}
                        onClick={()=>{toggleState(index)}}> 
                        <p style={{textAlign:'center', color:outline, fontWeight:'bold'}}>{label}</p>
                    </Pad>
                </ColSection>
            )}}
                )}
        </RowSection>
    )
}

export default Sequencer
