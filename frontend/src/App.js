import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Starter from './components/Starter';
import RandPoke from './components/RandPoke';
import Home from './components/Home';
import Login from './components/Login';
import Logout from './components/Logout';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const [start, setStart] = React.useState(true);
  const [login, setLogin] = React.useState(false);
  const { user, isAuthenticated } = useAuth0();

  return (
    <div>
      <header>
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              IDK
            </Typography>
            {isAuthenticated ? 
              <Logout user={user}/>:
              <Login/>
            }
          </Toolbar>
        </AppBar>
        {isAuthenticated && <p>Welcome {user.sub}</p>}
        {login=== false ? <Home func={setLogin}/>:(start === true ? <Starter func={setStart}/>:<RandPoke/>)}
        
        </Box>
        
      </header>
    </div>
  );
}

export default App;