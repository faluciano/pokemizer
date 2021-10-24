import React from "react";
import {Button,SimpleGrid,Center} from '@chakra-ui/react';
import Card from './Card';

function Starter(props){
    const [data, setData] = React.useState(null);
    const [move, setMove] = React.useState(true);
    function getPoke() {
        fetch("/getStart")
            .then((res) => res.json())
            .then((data) => setData(data))
        setMove(false);
    }
    return (
    <div>
        <SimpleGrid minChildWidth="120px" spacing="40px">
            {data &&
            <Card 
                image={data.image} 
                name={data.name[0].toUpperCase()+data.name.slice(1)} 
                types={data.types.length===1 ? data.types[0]:data.types[0]+"/"+data.types[1]}
                />
            }
        </SimpleGrid>
        <Center>
            {move===true ? 
                <Button colorScheme="teal" onClick={()=>getPoke()}>Click</Button>:
                <Button colorScheme="teal" onClick={()=>props.func(false)}>Move on</Button>
            }
        </Center>
    </div>
    );
}

export default Starter;