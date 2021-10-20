import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);
  function getPoke() {
    fetch("/getPoke")
          .then((res) => res.json())
          .then((data) => setData(data))
  }
  return (
    <div className="App">
      <header className="App-header">
        {data == null ? "Loading":data.map((x)=>
        <div key={data.name}>
          <p>{x.name}</p>
          <p>{<img src={x.image} />}</p>
          <p>{x.types[0] }</p>
        </div>
        )}
        <button onClick={()=>getPoke()}>click</button>
      </header>
    </div>
  );
}

export default App;