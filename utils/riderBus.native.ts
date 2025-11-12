import { DeviceEventEmitter } from "react-native";
const EVENT = "rider:picked";
export const emitRiderPicked = (payload: any) =>
  DeviceEventEmitter.emit(EVENT, payload);
export const listenRiderPicked = (fn: (p: any) => void) => {
  const sub = DeviceEventEmitter.addListener(EVENT, fn);
  return () => sub.remove();
};
