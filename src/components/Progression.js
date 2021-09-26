import React, {useState} from 'react'
import { Colors, RowSection, ColSection } from './styledComponents';
import styled from 'styled-components';

const ChordList = styled.div`
    display: flex;
    flex-direction: row;
    background-color: ${Colors.primary};
    margin: 20px 20px;
    padding: 20px 20px;
    width: 80%;
    height: 100px
`;

const AddChord = styled.div`
    color: ${Colors.primary};
    align-self: start;
`;

const Chord = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 5px;
    background-color: ${Colors.dark};
    border-radius: 10px;
    width: 75px;
    height: 90%;
`;

const CText = styled.p`
    flex:0;
    text-align: center;
    color: ${Colors.logo};
    padding:0px;
    
`;


//Sequencer displays a list of intervals either on(1) or off(0)
//Takes the intervals to be displayed, current interval to highligh
const Progression = ({addChord, chordList, chords, clearChords }) => {
    const lengths = [0,1,2,3,4,5,6,7,8]
    const [chord, setChord] = useState(chords[0])
    const [length, setLength] = useState(0)

    const newChord = () =>{
        var newChord = {chord:chord, len:length};
        addChord(newChord)
    }
    const handleChange =(event)=>{
        console.log("Changed Chord")
        console.log(event.target.value)
        var chd = chords.find((obj)=>obj.interval===event.target.value)
        console.log(chd.note)
        setChord(chd)

    }

    return (
       
       <RowSection>
           <AddChord>
            <ColSection > 
                <p>Chord</p>
                <select value={chord.interval} onChange={handleChange}> 
                    {chords.map(option => <option value={option.interval}>{option.interval} : {option.note+option.chordMode}</option>)}
                </select>
                <select  onChange={(event)=>setLength(event.target.value)}> 
                    {lengths.map(option => <option value={option}>{option}</option>)}
                </select>

                <button onClick={newChord}>Add</button>
                <button onClick={clearChords}>Clear</button>
            </ColSection>
        </AddChord>
        <ChordList>
            {chordList.map(({chord,len}, index)=> 
                <Chord key={index}> 
                    <CText> {chord.interval} : {chord.note}</CText>
                    <CText>Beats:</CText>
                    <CText>{len}</CText>
                </Chord>
            )}
        </ChordList>        
        </RowSection>
    )
}

export default Progression
