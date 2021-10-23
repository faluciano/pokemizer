import React, { useEffect } from "react";
import {SimpleGrid,Button} from '@chakra-ui/react';
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
      <SimpleGrid minChildWidth="120px" spacing="40px">
          {data == null ? <p style={{margin:"auto"}}>Loading</p>:data.map((x,index)=>
          <Card 
          key={index}
          image={x.image} 
          name={x.name[0].toUpperCase()+x.name.slice(1)} 
          types={x.types.length===1 ? x.types[0]:x.types[0]+"/"+x.types[1]}
          />
          )}
          <Button variant="contained" onClick={()=>getPoke()}>click</Button>
      </SimpleGrid>
  );
}

export default RandPoke;