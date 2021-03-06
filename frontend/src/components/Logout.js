import React from 'react';
import {Button} from '@chakra-ui/react';
import { useAuth0} from '@auth0/auth0-react';

function Logout(){
    const { logout } = useAuth0();
    return(
        <Button
              fontSize={'sm'}
              fontWeight={600}
              colorScheme="red"
              href={'#'}
              onClick={()=>logout({ returnTo: window.location.origin })}
              _hover={{
                bg: 'red.300',
              }}>
              Log out
        </Button>
    )
}

export default Logout;