import { AppResponse, AppResponseErrorCode } from "./AppResponse";
import { DriverRequest } from "./DriverRequest";
import { Session, Game, Scene } from "@m2c2kit/core";
import { base64ArrayBuffer } from "./Encoding";

export class M2c2Listener {
  constructor(session: Session, port: string | number) {
    const socket = new WebSocket(`ws://localhost:${port.toString()}?role=app`);

    socket.addEventListener("error", () => {
      console.error("socket error in M2C2Listener");
    });

    socket.addEventListener("open", () => {
      console.log("app successful connection to automation controller");
    });

    socket.addEventListener("message", async (event) => {
      const req: DriverRequest = Object.assign({}, JSON.parse(event.data));
      const appResponse: AppResponse = {
        requestUuid: req.requestUuid,
      };

      if (!req.find) {
        appResponse.error = {
          code: AppResponseErrorCode.INVALID_QUERY,
          reason: `request ${req.requestUuid} missing findEntity query`,
        };
        socket.send(JSON.stringify(appResponse));
        return;
      }

      const entityName = req.find.replace("#", "");

      const gameScenes = (session.currentActivity as Game).entities
        .filter((e) => e.type === "Scene")
        .map((e) => e as Scene);

      const currentScene = gameScenes.filter((s) => s._active).find(Boolean);
      if (!currentScene) {
        appResponse.error = {
          code: AppResponseErrorCode.NO_ACTIVE_SCENE,
          reason: `request ${req.requestUuid} no active game scene. Has the session started?`,
        };
        socket.send(JSON.stringify(appResponse));
        return;
      }

      const entity = currentScene.descendants
        .concat(currentScene)
        .filter((d) => d.name === entityName)
        .find(Boolean);
      if (!entity) {
        appResponse.error = {
          code: AppResponseErrorCode.ENTITY_NOT_FOUND,
          reason: `request ${req.requestUuid} could not locate entity with the following query: ${req.find}`,
        };
        socket.send(JSON.stringify(appResponse));
        return;
      }

      appResponse.entityType = entity.type;

      if (req.screenshot) {
        const image = await currentScene.game.takeScreenshot(
          entity.absolutePosition.x - entity.size.width / 2,
          entity.absolutePosition.y - entity.size.height / 2,
          entity.size.width,
          entity.size.height
        );

        if (!image) {
          appResponse.error = {
            code: AppResponseErrorCode.COULD_NOT_TAKE_SCREEENSHOT,
            reason: `request ${req.requestUuid} could not take screenshot`,
          };
          socket.send(JSON.stringify(appResponse));
          return;
        }

        appResponse.imageAsBase64String = base64ArrayBuffer(image);
        socket.send(JSON.stringify(appResponse));
        return;
      }

      if (req.propertyName) {
        let propertyFound = false;
        for (const [key, value] of Object.entries(entity)) {
          if (key === req.propertyName) {
            appResponse.error = undefined;
            appResponse.propertyValue = JSON.stringify(value);
            propertyFound = true;
          }
        }

        if (!propertyFound) {
          appResponse.error = {
            code: AppResponseErrorCode.PROPERTY_NOT_FOUND,
            reason: `request ${req.requestUuid} found entity with query ${req.find}, but could not get property: ${req.propertyName}`,
          };
          socket.send(JSON.stringify(appResponse));
          return;
        }

        socket.send(JSON.stringify(appResponse));
        return;
      }

      appResponse.error = {
        code: AppResponseErrorCode.INVALID_REQUEST,
        reason: `request ${req.requestUuid} invalid`,
      };
      socket.send(JSON.stringify(appResponse));
    });
  }
}
