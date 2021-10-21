import React from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);
  function getPoke() {
    fetch("/getPoke")
          .then((res) => res.json())
          .then((data) => setData(data))
  }
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
          <Grid style={{margin:"auto"}} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {data == null ? <p style={{margin:"auto"}}>Loading</p>:data.map((x,index)=>
            <Grid item xs={2} sm={4} md={4} key={index}>
            <Card sx={{ maxWidth: 200 }}>
                <CardMedia
                component="img"
                height="140"
                image={x.image}
                alt={x.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {x.name[0].toUpperCase()+x.name.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {x.types.length===1 ? x.types[0]:x.types[0]+"/"+x.types[1]}
                </Typography>
              </CardContent>
            </Card>
            </Grid>
            )}
            <Grid item xs={8}>
            <Button variant="contained" onClick={()=>getPoke()}>click</Button>
            </Grid>
            </Grid>
            
        </Box>
        
      </header>
    </div>
  );
}

export default App;