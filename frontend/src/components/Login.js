import React from 'react';
import {Button} from '@chakra-ui/react';
import { useAuth0} from '@auth0/auth0-react';

function Login(){
    const {loginWithRedirect} = useAuth0();
    return(
        <Button
              fontSize={'sm'}
              fontWeight={600}
              colorScheme="teal"
              href={'#'}
              onClick={()=>loginWithRedirect()}
              _hover={{
                bg: 'teal.300',
              }}>
              Log in
        </Button>
    )
}

export default Login;