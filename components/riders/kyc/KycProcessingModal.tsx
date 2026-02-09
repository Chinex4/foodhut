import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  isDark: boolean;
};

export default function KycProcessingModal({ visible, isDark }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-8">
        <View className={`w-full rounded-3xl px-6 py-7 items-center ${
          isDark ? "bg-neutral-900" : "bg-white"
        }`}>
          <View className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${
            isDark ? "bg-primary/20" : "bg-primary/10"
          }`}>
            <ActivityIndicator size="small" color="#ffa800" />
          </View>

          <Text className={`text-lg font-satoshiBold mb-1 ${
            isDark ? "text-white" : "text-black"
          }`}>
            Submitting your KYC
          </Text>
          <Text className={`text-sm font-satoshi text-center ${
            isDark ? "text-neutral-400" : "text-gray-600"
          }`}>
            Hang on while we securely upload your documents and verify your
            details.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
