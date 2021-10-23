import React from 'react';
import Starter from './components/Starter';
import RandPoke from './components/RandPoke';
import Home from './components/Home';
import { useAuth0 } from '@auth0/auth0-react';
import {ChakraProvider} from '@chakra-ui/react';
import NavBar from './components/NavBar';

function App() {
  const [start, setStart] = React.useState(true);
  const { user, isAuthenticated } = useAuth0();

  return (
    <ChakraProvider>
        <NavBar auth={isAuthenticated}/>
        {isAuthenticated && <p>Welcome {user.sub}</p>}
        {!isAuthenticated ? <Home/>:(start === true ? <Starter func={setStart}/>:<RandPoke/>)}
    </ChakraProvider>
  );
}

export default App;