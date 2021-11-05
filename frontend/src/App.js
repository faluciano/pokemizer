import React from 'react';
import Starter from './components/Starter';
import RandPoke from './components/RandPoke';
import Home from './components/Home';
import { useAuth0 } from '@auth0/auth0-react';
import {ChakraProvider,Center} from '@chakra-ui/react';
import NavBar from './components/NavBar';

function App() {
  const [start, setStart] = React.useState(true);
  const { user, isAuthenticated } = useAuth0();
  const [starter,setStarter] = React.useState("");

  return (
    <ChakraProvider>
        <NavBar auth={isAuthenticated}/>
        {isAuthenticated && <Center>Welcome {user.name}</Center>}
        {!isAuthenticated ? <Home/>:(start === true ? <Starter func={setStart} setStarter={setStarter}/>:<RandPoke starter={starter}/>)}
    </ChakraProvider>
  );
}

export default App;