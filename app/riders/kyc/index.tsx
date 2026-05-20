// app/riders/kyc/index.tsx
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { fetchRiderProfile, submitRiderKyc } from "@/redux/logistics/logistics.thunks";
import { selectRiderProfile } from "@/redux/logistics/logistics.selectors";
import { showError, showSuccess } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import VehicleStep from "@/components/riders/kyc/VehicleStep";
import DocumentsStep from "@/components/riders/kyc/DocumentStep";
import ContactStep from "@/components/riders/kyc/ContactStep";
import { StepKey, steps, UploadFile } from "@/components/riders/kyc/kycTypes";
import KycProcessingModal from "@/components/riders/kyc/KycProcessingModal";
// import { api } from "@/lib/api"; // when you’re ready to call backend

export default function RiderKycScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const riderProfile = useAppSelector(selectRiderProfile);
  const [step, setStep] = useState<StepKey>("vehicle");
  const stepIndex = steps.indexOf(step);

  // loading / processing state
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (!riderProfile) dispatch(fetchRiderProfile());
  }, [dispatch, riderProfile]);

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

      if (!riderProfile?.id) {
        throw new Error("Rider profile is required before KYC submission.");
      }

      await dispatch(
        submitRiderKyc({
          rider_id: riderProfile.id,
          id_type: idType || "",
          id_number: idNumber,
          id_document_id: files[0]?.id || files[0]?.name || "",
          vehicle_type: vehicleType || "",
          vehicle_registration_number: vehicleReg,
          next_of_kin_full_name: nokName,
          next_of_kin_relationship: nokRelationship,
          next_of_kin_phone_number: nokPhone,
          next_of_kin_address: nokAddress,
        })
      ).unwrap();

      await dispatch(fetchRiderProfile()).unwrap();
      showSuccess("KYC submitted for review.");

      // on success, go back to rider dashboard
      router.replace("/riders/(tabs)");
    } catch (e) {
      showError(e instanceof Error ? e.message : "KYC submit failed");
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
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-3">
        <ProgressHeader currentIndex={stepIndex} isDark={isDark} />
      </View>

      <View className="flex-row items-center justify-between px-5 mt-6 mb-2">
        <Pressable
          onPress={onBack}
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          disabled={submitting}
        >
          <Ionicons name="chevron-back" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
        </Pressable>
        <Text className={`text-2xl text-center font-satoshiBold ${isDark ? "text-white" : "text-black"}`}>
          {titleByStep[step]}
        </Text>
        <View className="w-10" />
      </View>

      <Text className={`px-5 text-sm font-satoshi mb-3 ${isDark ? "text-neutral-400" : "text-gray-600"}`}>
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
            isDark={isDark}
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
            isDark={isDark}
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
            isDark={isDark}
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
      <KycProcessingModal visible={submitting} isDark={isDark} />
    </SafeAreaView>
  );
}

function ProgressHeader({
  currentIndex,
  isDark,
}: {
  currentIndex: number;
  isDark: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      {steps.map((_, index) => {
        const active = index <= currentIndex;
        return (
          <View
            key={index}
            className={`flex-1 h-1.5 rounded-full ${
              active ? "bg-primary" : isDark ? "bg-neutral-800" : "bg-gray-300"
            } mx-1`}
          />
        );
      })}
    </View>
  );
}
