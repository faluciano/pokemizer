import React from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';


function Starter(props){
    const [data, setData] = React.useState(null);
    const [move, setMove] = React.useState(true);
    function getPoke() {
        fetch("/getStart")
            .then((res) => res.json())
            .then((data) => setData(data))
        setMove(false);
    }
    return (
    <div>
        <Box sx={{ flexGrow: 1 }}>
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
                {move===true ? 
                <Button variant="contained" onClick={()=>getPoke()}>click</Button>:
                <Button variant="contained" onClick={()=>props.func(false)}>move on</Button>
                }
                </Grid>
            </Grid>
        </Box>
    </div>
    );
}

export default Starter;