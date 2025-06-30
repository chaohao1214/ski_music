import { WebSocketServer } from "ws";
let wss;

/**
 * Initializes the WebSocket server and attaches it to the existing HTTP server.
 * @param {http.Server} server - The HTTP server instance from Express.
 */

export function setupWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on("message", (message) => {
    console.log("Received WebSocket message: %s", message);
  });

  wss.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  console.log("WebSocket service has been set up.");
}

/**
 * Broadcasts data to all connected WebSocket clients.
 * @param {object} data - The JSON data object to be sent to all clients.
 */

export function broadcast(data) {
  if (!wss) {
    console.error("WebSocket server is not initialized!");
    return;
  }

  const message = JSON.stringify(data);
  console.log("Broadcasting message to all clients:", message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message, (err) => {
        if (err) {
          console.error("Failed to send message to a client:", err);
        }
      });
    }
  });
}
