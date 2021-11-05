import React, { useEffect } from "react";
import {SimpleGrid,Button,Center} from '@chakra-ui/react';
import Card from './Card';

function RandPoke(props) {
  const image = "https://upload.wikimedia.org/wikipedia/commons/3/33/White_square_with_question_mark.png";
  const {starter} = props;
  const [question, setQuestion] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [pokeList, setPokes] = React.useState([starter]);
  useEffect(()=>{
    getPoke();
    //getList();
  },[]);

  function getList(){
    fetch("/getList")
          .then((res)=>res.json())
          .then((data)=>setPokes(data))
  }
  function getPoke() {
    setQuestion(false);
    fetch("/getPoke")
          .then((res) => res.json())
          .then((data) => setData(data))
  }
  function flip(pokemon){
    if (!question && pokeList.length<6){
      console.log(pokemon.name);
      setQuestion(true);
      setPokes((m)=>[...m,pokemon]);
    }
  }
  return (
      <>
        <SimpleGrid columns={3} minChildWidth="300px" spacing="5px" spacingY="5px">
            {data && data.map((x,index)=>
            <div  key={index} onClick={()=>flip(x)}>
            <Card 
              image={question ? x.image : image} 
              name={question ? x.name[0].toUpperCase()+x.name.slice(1) : "?"} 
              types={question ? (x.types.length===1 ? x.types[0]:x.types[0]+"/"+x.types[1]) : "?"}
            />
            </div>
            
            )}
            
            
        </SimpleGrid>
        <Center> 
          <Button colorScheme="teal" onClick={()=>getPoke()} disabled={!question}>Click</Button> 
        </Center>
        {pokeList.map((pokemon,index)=><Center key={index}><p>{pokemon.name}</p></Center>)}
      </>
  );
}

export default RandPoke;