import type { KitchenCity } from "@/redux/kitchen/kitchen.types";
import { clearSelectedCity, getSelectedCity, saveSelectedCity } from "@/storage/city";
import { useEffect, useState } from "react";

export function useSelectedCity() {
  const [selectedCity, setSelectedCity] = useState<KitchenCity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCity();
  }, []);

  const loadCity = async () => {
    try {
      const city = await getSelectedCity();
      setSelectedCity(city);
    } catch (error) {
      console.error("Failed to load selected city:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCity = async (city: KitchenCity) => {
    try {
      await saveSelectedCity(city);
      setSelectedCity(city);
    } catch (error) {
      console.error("Failed to update city:", error);
    }
  };

  const removeCity = async () => {
    try {
      await clearSelectedCity();
      setSelectedCity(null);
    } catch (error) {
      console.error("Failed to remove city:", error);
    }
  };

  return {
    selectedCity,
    isLoading,
    updateCity,
    removeCity,
    loadCity,
  };
}
