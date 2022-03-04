import { WebSocketServer, WebSocket, AddressInfo } from "ws";

enum Role {
  APP = "app",
  DRIVER = "driver",
}

interface AutomationClient {
  ws: WebSocket;
  uuid: string;
  role: Role;
}

class Timestamp {
  static now(): string {
    return new Date().toISOString();
  }
}

let clients = new Array<AutomationClient>();
const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
  const address = wss.address();
  // eslint-disable-next-line no-prototype-builtins
  if (address.hasOwnProperty("port")) {
    console.log(
      `${Timestamp.now()}: m2c2kit automation controller listening on port ${
        (address as AddressInfo).port
      } `
    );
  } else {
    console.log(`${Timestamp.now()}: m2c2kit automation controller listening.`);
  }
});

wss.on("connection", function connection(ws, req) {
  let role: Role;
  if (req.url?.includes("role=app")) {
    role = Role.APP;
  } else if (req.url?.includes("role=driver")) {
    role = Role.DRIVER;
  } else {
    console.error("unknown client role. client rejected.");
    return;
  }

  const client = { uuid: Uuid.generate(), role: role, ws: ws };
  /**
   * Currently, we can have only one app and one driver connected,
   * so remove any existing one before adding another client of the same type
   */
  clients = clients.filter((c) => c.role != client.role);
  clients.push(client);

  console.log(
    `${Timestamp.now()}: client ${client.role}:${client.uuid} connected`
  );
  console.log(
    `${Timestamp.now()}: total connected clients = ${clients.length}`
  );

  ws.on("message", (data) => {
    const msg = data.toString();

    let recipient: AutomationClient | undefined;

    if (client.role === Role.DRIVER) {
      recipient = clients.filter((c) => c.role === Role.APP).find(Boolean);
    } else if (client.role === Role.APP) {
      recipient = clients.filter((c) => c.role === Role.DRIVER).find(Boolean);
    }

    if (!recipient) {
      console.log(
        `${Timestamp.now()}: client ${client.role}:${
          client.uuid
        } sent message: ${msg}`
      );
      console.warn(
        `${Timestamp.now()}: no recipient connected to server; message will be lost`
      );
    } else {
      console.log(
        `${Timestamp.now()}: message from sender ${client.role}:${
          client.uuid
        } to recipient ${recipient.role.toString()}:${recipient.uuid}: ${msg}`
      );
      recipient.ws.send(msg);
    }
  });

  ws.on("close", () => {
    console.log(
      `${Timestamp.now()}: client ${client.role}:${client.uuid} disconnected`
    );
    clients = clients.filter((c) => c.uuid !== client.uuid);
    console.log(
      `${Timestamp.now()}: total connected clients = ${clients.length}`
    );
  });
});

class Uuid {
  // https://stackoverflow.com/a/8809472
  static generate(): string {
    let d = new Date().getTime(),
      d2 = (performance && performance.now && performance.now() * 1000) || 0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
    });
  }
}
