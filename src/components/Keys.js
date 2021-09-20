import React, {useEffect} from 'react'
import { RowSection } from './styledComponents';


const Keys = ({keypress, keyup}) => {
    const keyConfig = {
        'f':1,
        'g':2,
        'h':3,
        'j':4,
        'k':5
    }

    useEffect(() => {
        //Key Press: Listener
        document.addEventListener('keypress', keypress)
        //Syth Key Up event handler
        document.addEventListener('keyup', keyup)
        return () => {
            document.removeEventListener('keypress', keypress);
            document.removeEventListener('keyup', keyup)
        }
    }, [])
    
    return (
        <RowSection>
            {Object.entries(keyConfig).map((entry,index)=>
                <button key={index} onMouseDown={()=>keypress({key:entry[0]})} onMouseUp={()=>keyup({key:entry[0]})}>
                    <p>{`Note: ${entry[1]}`}</p>
                    <p>{`Key: ${entry[0]}`}</p>
                    
                </button>
            )}
        </RowSection>
    )
}

export default Keys
