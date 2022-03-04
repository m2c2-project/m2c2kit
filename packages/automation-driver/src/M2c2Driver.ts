import { Point } from "@m2c2kit/core";
import { DriverRequest } from "./DriverRequest";
import { AppResponse } from "./AppResponse";
import { PendingRequest } from "./PendingRequest";
import { Uuid } from "./Uuid";

export class M2c2Driver {
  socket: WebSocket;
  locator = "";
  connectedToController = false;
  verbose = false;
  pendingRequests: Array<PendingRequest> = [];

  /**
   * Specifies m2c2 entity to locate
   *
   * @param locator - Name of entity in current scene to find
   * @returns object to chain to getProperty() or takeScreenshot() method
   */
  findEntity(locator: string) {
    this.locator = locator;
    return this;
  }

  /**
   * Takes PNG image screenshot of found entity
   *
   * @returns PNG as base64 string
   */
  takeScreenshot(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.connectedToController || this.socket.readyState === 0) {
        reject("driver not connected to automation controller");
        return;
      }
      const req: DriverRequest = {
        requestUuid: Uuid.generate(),
        find: this.locator,
        screenshot: true,
      };
      this.savePendingRequest(req, resolve, reject);
      this.sendRequest(req);
    });
  }

  /**
   * Gets property on found entity
   *
   * @param propertyName - Property of entity to get
   * @returns Value of the property
   */
  getProperty<T>(propertyName: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.connectedToController || this.socket.readyState === 0) {
        reject("driver not connected to automation controller");
        return;
      }
      const req: DriverRequest = {
        requestUuid: Uuid.generate(),
        find: this.locator,
        propertyName: propertyName,
      };
      this.savePendingRequest(req, resolve, reject);
      this.sendRequest(req);
    });
  }

  /**
   * Creates an automation driver and connects to automation controller
   *
   * @param port - Port on the automation controller to connect to
   * @param verbose - Enable verbose logging to console. Default is false.
   */
  constructor(port: string | number, verbose = false) {
    this.verbose = verbose;
    this.socket = new WebSocket(
      `ws://localhost:${port.toString()}?role=driver`
    );

    this.socket.addEventListener("open", () => {
      this.connectedToController = true;
      if (this.verbose) {
        console.log(
          `${Timestamp.now()}: driver successfully connected to automation controller`
        );
      }
    });

    this.socket.addEventListener("message", (event) => {
      const res: AppResponse = Object.assign({}, JSON.parse(event.data));
      if (this.verbose) {
        console.log(
          `${Timestamp.now()}: driver received from controller message: ${
            event.data
          }`
        );
      }

      const pendingRequest = this.pendingRequests
        .filter((r) => r.request.requestUuid === res.requestUuid)
        .find(Boolean);
      if (!pendingRequest) {
        throw new Error(
          `request ${res.requestUuid} not found in array of pending requests`
        );
      }
      if (!pendingRequest.resolvePromise || !pendingRequest.rejectPromise) {
        this.removePendingRequest(pendingRequest);
        throw new Error(
          `request ${res.requestUuid} could not fulfill promise in driver`
        );
      }
      if (res.error) {
        pendingRequest.rejectPromise(res.error);
        this.removePendingRequest(pendingRequest);
        return;
      }

      if (pendingRequest.request.screenshot) {
        if (res.imageAsBase64String) {
          pendingRequest.resolvePromise(res.imageAsBase64String);
        } else {
          pendingRequest.rejectPromise(
            `request ${res.requestUuid} image is null`
          );
        }
        this.removePendingRequest(pendingRequest);
        return;
      }

      if (res.propertyValue) {
        switch (pendingRequest.request.propertyName) {
          case "absolutePosition": {
            const point: Point = Object.assign(
              new Point(),
              JSON.parse(res.propertyValue)
            );
            pendingRequest.resolvePromise(point);
            break;
          }
          case "name":
          case "text": {
            const string_ = JSON.parse(res.propertyValue) as string;
            pendingRequest.resolvePromise(string_);
            break;
          }
          case "hidden": {
            const boolean_ = JSON.parse(res.propertyValue) as boolean;
            pendingRequest.resolvePromise(boolean_);
            break;
          }
          default: {
            pendingRequest.rejectPromise(
              `request ${res.requestUuid} returned value for property ${pendingRequest.request.propertyName}, but driver cannot deserialize value. Raw value is ${res.propertyValue}`
            );
          }
        }
        this.removePendingRequest(pendingRequest);
        return;
      }

      pendingRequest.rejectPromise(
        `request ${res.requestUuid} returned, but driver could not handle response.`
      );
      this.removePendingRequest(pendingRequest);
    });
  }

  private savePendingRequest(
    req: DriverRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (value: any) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (value: any) => void
  ): void {
    this.pendingRequests.push({
      request: req,
      resolvePromise: resolve,
      rejectPromise: reject,
    });
  }

  private removePendingRequest(pendingRequest: PendingRequest): void {
    this.pendingRequests = this.pendingRequests.filter(
      (r) => r.request.requestUuid !== pendingRequest.request.requestUuid
    );
  }

  private sendRequest(req: DriverRequest): void {
    if (this.verbose) {
      this.logSendingRequest(req);
    }
    this.socket.send(JSON.stringify(req));
  }

  private logSendingRequest(req: DriverRequest): void {
    console.log(
      `${Timestamp.now()}: driver sending to controller message: ${JSON.stringify(
        req
      )}`
    );
  }
}

class Timestamp {
  static now(): string {
    return new Date().toISOString();
  }
}
