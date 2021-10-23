import React from "react";
import {Button,SimpleGrid} from '@chakra-ui/react';
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
            {data == null ? <p style={{margin:"auto"}}>Loading</p>:
            <Card 
                image={data.image} 
                name={data.name[0].toUpperCase()+data.name.slice(1)} 
                types={data.types.length===1 ? data.types[0]:data.types[0]+"/"+data.types[1]}
                />
            }
        </SimpleGrid>
        {move===true ? 
            <Button onClick={()=>getPoke()}>click</Button>:
            <Button onClick={()=>props.func(false)}>move on</Button>
        }
    </div>
    );
}

export default Starter;