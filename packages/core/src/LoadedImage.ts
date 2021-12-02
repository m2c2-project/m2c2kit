import { Image } from "canvaskit-wasm";

export class LoadedImage {
  constructor(
    public name: string,
    public image: Image,
    public width: number,
    public height: number
  ) {}
}
