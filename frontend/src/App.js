import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Starter from './components/Starter';
import RandPoke from './components/RandPoke';

function App() {
  const [start, setStart] = React.useState(true);

  return (
    <div>
      <header>
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                IDK
              </Typography>
              <Button color="inherit">Login</Button>
            </Toolbar>
          </AppBar>
          {start === true ? <Starter func={setStart}/>:<RandPoke/>}
            
        </Box>
        
      </header>
    </div>
  );
}

export default App;