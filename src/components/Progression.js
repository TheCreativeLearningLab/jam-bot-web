import React, {useState} from 'react'
import { RowSection, ColSection } from './styledComponents';

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
            {chordList.map(({chord,len}, index)=> 
                <div key={index}> 
                    <p> {chord.interval} : {chord.note}</p>
                    <p>{len}</p>
                </div>
            )}
        <ColSection > 
                    <p>Chord</p>
                    <select value={chord.interval} onChange={handleChange}> 
                        {chords.map(option => <option value={option.interval}>{option.interval} : {option.note+option.chordMode}</option>)}
                    </select>
                    <select  onChange={(event)=>setLength(event.target.value)}> 
                        {lengths.map(option => <option value={option}>{option}</option>)}
                    </select>
    
            <button onClick={newChord}>New Chord</button>
            <button onClick={clearChords}>Clear Chords</button>
        </ColSection>
        </RowSection>
    )
}

export default Progression
