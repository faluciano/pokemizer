import React, { useEffect } from "react";
import {SimpleGrid,Button,Center} from '@chakra-ui/react';
import Card from './Card';

function RandPoke() {
  const [data, setData] = React.useState(null);
  useEffect(()=>{
    getPoke();
  },[]);
  function getPoke() {
    fetch("/getPoke")
          .then((res) => res.json())
          .then((data) => setData(data))
  }
  return (
      <>
        <SimpleGrid columns={3} minChildWidth="300px" spacing="5px" spacingY="5px">
            {data && data.map((x,index)=>
            <Card 
            key={index}
            image={x.image} 
            name={x.name[0].toUpperCase()+x.name.slice(1)} 
            types={x.types.length===1 ? x.types[0]:x.types[0]+"/"+x.types[1]}
            />
            )}
            
            
        </SimpleGrid>
        <Center> 
          <Button colorScheme="teal" onClick={()=>getPoke()}>Click</Button> 
        </Center>
      </>
  );
}

export default RandPoke;