export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayInfo {
  id: number;
  name: string;
  bounds: WindowBounds;
  isPrimary: boolean;
}

export interface MoveWindowOptions {
  displayId: number;
  centerWindow?: boolean;
  maintainSize?: boolean;
}
