import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={()=>{
          fetch("/api")
          .then((res) => res.json())
          .then((data) => setData(data.message))
        }}>click</button>
        <p>{data===null ? "Loading..." :  data.name}</p>
        <p>{data===null ? "Loading..." : <img src={data.image} />}</p>
        <p>{data===null ? "Loading..." : data.types[0] }</p>
      </header>
    </div>
  );
}

export default App;