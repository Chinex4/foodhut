import React from "react";
import { View } from "react-native";

interface LineProps {
  w?: string;
  h?: string;
  className?: string;
}

export default function Line({ w = "w-full", h = "h-4", className = "" }: LineProps) {
  return <View className={`bg-neutral-300 rounded ${w} ${h} ${className}`} />;
}
