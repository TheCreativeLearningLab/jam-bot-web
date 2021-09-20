import styled from 'styled-components'
const Colors = {
    primary: '#0B4583'
}

const Screen = styled.div`
    display:flex;
    alig-content: center;
    flex-direction: column;
    justify-content: space-around;
`;

const RowSection = styled.div`
    display:flex;
    alig-content: center;
    flex-direction: row;
    justify-content: space-around;
`;

const ColSection = styled.div`
    display:flex;
    alig-content: center;
    flex-direction: col;
    justify-content: space-around;
`;

export {Colors, Screen, RowSection, ColSection}