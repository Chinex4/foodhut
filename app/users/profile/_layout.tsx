import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { useEnsureAuthenticated } from "@/hooks/useEnsureAuthenticated";

export default function ProfileLayout() {
  const { isAuthenticated, redirectToLogin } = useEnsureAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin]);

  if (!isAuthenticated) {
    return null;
  }

  return <Slot />;
}
