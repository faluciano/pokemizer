const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
const m = [{"name":"bulbasaur","types":["grass","poison"],"image":"https://art.pixilart.com/6ba93206eb9dad5.png"}]
// Handle GET requests to /api route
app.get("/api", (req, res) => {
  console.log(m);
  res.json({ message: m[0] });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
});