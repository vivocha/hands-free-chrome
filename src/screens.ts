export interface ScreenMetrics {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  mobile?: boolean;
  fitWindow?: boolean;  
};
export const DesktopScreenMetrics: ScreenMetrics = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 0,
  mobile: false,
  fitWindow: false
};
export const BasicScreenMetrics: ScreenMetrics = {
  width: 1280,
  height: 800,
  deviceScaleFactor: 0,
  mobile: false,
  fitWindow: false,
};