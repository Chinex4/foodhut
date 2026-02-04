import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import FoodhutButtonComponent from "@/components/ui/FoodhutButton";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export default function KycPromptModal({
  visible,
  onClose,
  onContinue,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View className="w-full rounded-3xl bg-white px-6 py-7">
          <Ionicons
            name="shield-checkmark"
            size={48}
            color="#ffa800"
            style={{ alignSelf: "center", marginBottom: 16 }}
          />
          <Text className="text-2xl text-center font-satoshiBold text-black mb-2">
            Complete your KYC
          </Text>
          <Text className="text-sm text-center font-satoshi text-gray-600 mb-5">
            Verify your details to start receiving delivery payouts and keep
            your account secure.
          </Text>

          <FoodhutButtonComponent title="Verify now" onPress={onContinue} />

          <Pressable onPress={onClose} className="mt-3 items-center">
            <Text className="text-sm font-satoshiMedium text-gray-500">
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
