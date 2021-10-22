import React from 'react';
import Button from '@mui/material/Button';

function Home(props){
    return(
        <div>
            <p>Home</p>
            <Button onClick={()=>props.func(true)}>Login</Button>
        </div>
    )
}

export default Home;