import React from 'react';
import Button from '@mui/material/Button';
import { useAuth0} from '@auth0/auth0-react';

function Login(){
    const {loginWithRedirect} = useAuth0();
    return(
        <Button style={{color:"white"}} onClick={()=>loginWithRedirect()}>
            Log in
        </Button>
    )
}

export default Login;