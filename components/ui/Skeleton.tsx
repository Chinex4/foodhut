import React from "react";
import { View } from "react-native";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <View
      className={`bg-neutral-200 animate-pulse ${className}`}
      style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
    />
  );
}
