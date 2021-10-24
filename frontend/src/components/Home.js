import React from 'react';
import {
    Center,
    Text,
    Heading,
    Stack,
    Tag    
} from '@chakra-ui/react'

function Home(){
    return(
        <Stack>
            <Center>
                <Heading as="h1" size="4xl">Pokemizer</Heading>
            </Center>
            <Center>
                <Text>Here are the rules:</Text>
            </Center>
        </Stack>
    )
}

export default Home;