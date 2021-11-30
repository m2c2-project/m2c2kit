import { Layout } from ".";
import { Point } from "./Point";

export interface EntityOptions {
  name?: string;
  position?: Point;
  scale?: number;
  isUserInteractionEnabled?: boolean;
  hidden?: boolean;
  layout?: Layout;
}
