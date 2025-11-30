import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
};

export default function KycProcessingModal({ visible }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-8">
        <View className="w-full rounded-3xl bg-white px-6 py-7 items-center">
          <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-4">
            <ActivityIndicator size="small" color="#ffa800" />
          </View>

          <Text className="text-lg font-satoshiBold text-black mb-1">
            Submitting your KYC
          </Text>
          <Text className="text-sm font-satoshi text-gray-600 text-center">
            Hang on while we securely upload your documents and verify your
            details.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
