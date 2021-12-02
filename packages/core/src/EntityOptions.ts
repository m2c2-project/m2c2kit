import { Layout } from "./Layout";
import { Point } from "./Point";

export interface EntityOptions {
  name?: string;
  position?: Point;
  scale?: number;
  isUserInteractionEnabled?: boolean;
  hidden?: boolean;
  layout?: Layout;
}
