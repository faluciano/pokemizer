import React from 'react';
import Button from '@mui/material/Button';
import { useAuth0} from '@auth0/auth0-react';
import Toolbar from '@mui/material/Toolbar';

function Logout(props){
    const { logout } = useAuth0();
    const {user} = props;
    return(
        <>
        <Toolbar>
            <img src={user.picture} alt={user.name} />
        </Toolbar>
        <Button style={{color:"white"}} onClick={()=>logout({ returnTo: window.location.origin })}>
            Log out
        </Button>
        </>
    )
}

export default Logout;