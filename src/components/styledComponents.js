import styled from 'styled-components'
const Colors = {
    primary: '#36322F',
    secondary: '#3A2317',
    pop: '#B6781B',
    logo: '#D2CDC9',
    light: '#dca',
    mid: '#a85',
    dark: '#753',
}

const Screen = styled.div`
    flex-grow: 1;
    display:flex;
    alig-content: center;
    flex-direction: column;
    justify-content: space-around;
    background-color: ${Colors.primary};
    background-size: 15px 15px;
`;

const CarbonScreen = styled.div`
flex-grow: 1;
display:flex;
alig-content: center;
flex-direction: column;
justify-content: space-around;
background: 
linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px,
linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px,
linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px,
linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px,
linear-gradient(90deg, #1b1b1b 10px, transparent 10px),
linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424);
background-color: #131313;
background-size: 15px 15px;
`;

const InstrumentWrapper = styled.div`
    flex-grow: 1;
    display:flex;
    alig-content: center;
    flex-direction: column;
    justify-content: space-around;
    border-radius: 15px;
    border-style: solid;
    border-color: ${Colors.logo};
    border-width: 3px;
    padding: 10px;
    margin: 10px;
    background: linear-gradient(45deg, ${Colors.light} 12%, transparent 0, transparent 88%, ${Colors.light} 0),
    linear-gradient(135deg, transparent 37%, ${Colors.mid} 0, ${Colors.mid} 63%, transparent 0),
    linear-gradient(45deg, transparent 37%, ${Colors.light} 0, ${Colors.light} 63%, transparent 0) ${Colors.dark};
    background-size: 4px px;
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
    flex-direction: column;
    justify-content: space-around;
`;

const InstTitle = styled.p`
    font-weight: bold;
    font-size: 20px;
    color: ${Colors.secondary}
`;


export {Colors, Screen, RowSection, ColSection, InstrumentWrapper, InstTitle}