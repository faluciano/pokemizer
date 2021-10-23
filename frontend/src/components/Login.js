import React from 'react';
import {Button} from '@chakra-ui/react';
import { useAuth0} from '@auth0/auth0-react';

function Login(){
    const {loginWithRedirect} = useAuth0();
    return(
        <Button
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'orange.400'}
              href={'#'}
              onClick={()=>loginWithRedirect()}
              _hover={{
                bg: 'orange.300',
              }}>
              Log in
        </Button>
    )
}

export default Login;