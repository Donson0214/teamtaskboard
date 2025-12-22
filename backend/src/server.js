const app = require("./app");
const http = require("http");
const server = http.createServer(app);

const { initSocket } = require("./realtime/socket");
initSocket(server); 

const PORT = process.env.PORT || 5000;


async function start() {
  server.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}

start();
