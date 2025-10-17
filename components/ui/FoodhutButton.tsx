import React from "react";
import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
};

export function FoodhutButton({
  title,
  onPress,
  loading,
  disabled,
  style,
  className = "",
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full rounded-2xl bg-primary px-4 py-4 items-center justify-center ${
        isDisabled ? "opacity-60" : ""
      } ${className}`}
      style={style}
      android_ripple={{ color: "rgba(0,0,0,0.08)" }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-white text-base font-satoshiBold">{title}</Text>
      )}
    </Pressable>
  );
}
export default FoodhutButton;
