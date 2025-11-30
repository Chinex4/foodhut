// app/riders/kyc/index.tsx
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import VehicleStep from "@/components/riders/kyc/VehicleStep";
import DocumentsStep from "@/components/riders/kyc/DocumentStep";
import ContactStep from "@/components/riders/kyc/ContactStep";
import { StepKey, steps, UploadFile } from "@/components/riders/kyc/kycTypes";
import KycProcessingModal from "@/components/riders/kyc/KycProcessingModal";
// import { api } from "@/lib/api"; // when you’re ready to call backend

export default function RiderKycScreen() {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>("vehicle");
  const stepIndex = steps.indexOf(step);

  // loading / processing state
  const [submitting, setSubmitting] = useState(false);

  // vehicle
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [vehicleReg, setVehicleReg] = useState("");

  // document
  const [idType, setIdType] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);

  // personal contact
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokAddress, setNokAddress] = useState("");

  const onBack = () => {
    if (stepIndex === 0) {
      router.back();
    } else {
      setStep(steps[stepIndex - 1]);
    }
  };

  const onNext = async () => {
    // normal navigation between steps
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
      return;
    }

    // last step -> submit KYC
    try {
      setSubmitting(true);

      // build payload
      const payload = {
        vehicle: {
          type: vehicleType,
          registration_number: vehicleReg,
        },
        document: {
          id_type: idType,
          id_number: idNumber,
          // you can send file URIs or convert to FormData here
          files,
        },
        contact: {
          name: nokName,
          relationship: nokRelationship,
          phone: nokPhone,
          address: nokAddress,
        },
      };

      // TODO: replace this with real API call
      // const res = await api.post("/riders/kyc", payload);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // on success, go back to rider dashboard
      router.replace("/riders/(tabs)");
    } catch (e) {
      // handle error (toast, etc.)
      console.log("KYC submit failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  const titleByStep: Record<StepKey, string> = {
    vehicle: "Vehicle Information",
    documents: "Document Uploads",
    contact: "Personal Contact Details",
  };

  const subtitleByStep: Record<StepKey, string> = {
    vehicle:
      "Enter your vehicle details to verify your account and get approved for deliveries",
    documents:
      "Upload your documents to verify your account and get approved for deliveries",
    contact:
      "Provide your details. This information is required for account verification and your safety",
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      <View className="px-5 pt-3">
        <ProgressHeader currentIndex={stepIndex} />
      </View>

      <View className="flex-row items-center justify-between px-5 mt-6 mb-2">
        <Pressable
          onPress={onBack}
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          disabled={submitting}
        >
          <Ionicons name="chevron-back" size={18} color="#111827" />
        </Pressable>
        <Text className="text-2xl text-center font-satoshiBold text-black">
          {titleByStep[step]}
        </Text>
        <View className="w-10" />
      </View>

      <Text className="px-5 text-sm text-gray-600 font-satoshi mb-3">
        {subtitleByStep[step]}
      </Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === "vehicle" && (
          <VehicleStep
            vehicleType={vehicleType}
            setVehicleType={setVehicleType}
            vehicleReg={vehicleReg}
            setVehicleReg={setVehicleReg}
          />
        )}

        {step === "documents" && (
          <DocumentsStep
            idType={idType}
            setIdType={setIdType}
            idNumber={idNumber}
            setIdNumber={setIdNumber}
            files={files}
            setFiles={setFiles}
          />
        )}

        {step === "contact" && (
          <ContactStep
            nokName={nokName}
            setNokName={setNokName}
            nokRelationship={nokRelationship}
            setNokRelationship={setNokRelationship}
            nokPhone={nokPhone}
            setNokPhone={setNokPhone}
            nokAddress={nokAddress}
            setNokAddress={setNokAddress}
          />
        )}
      </ScrollView>

      <View className="px-5 pb-6">
        <Pressable
          onPress={onNext}
          disabled={submitting}
          className={`rounded-2xl py-4 items-center ${
            submitting ? "bg-primary/60" : "bg-primary"
          }`}
        >
          <Text className="text-white font-satoshiMedium text-base">
            {stepIndex === steps.length - 1 ? "Submit" : "Next"}
          </Text>
        </Pressable>
      </View>

      {/* processing overlay */}
      <KycProcessingModal visible={submitting} />
    </SafeAreaView>
  );
}

function ProgressHeader({ currentIndex }: { currentIndex: number }) {
  return (
    <View className="flex-row items-center justify-between">
      {steps.map((_, index) => {
        const active = index <= currentIndex;
        return (
          <View
            key={index}
            className={`flex-1 h-1.5 rounded-full ${
              active ? "bg-primary" : "bg-gray-300"
            } mx-1`}
          />
        );
      })}
    </View>
  );
}
