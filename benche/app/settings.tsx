import { useEffect } from "react";
import { useRouter } from "expo-router";

/**
 * Ayarlar artık Profil sayfasında birleştirildi.
 * /settings deep link'i profil sekmesine yönlendirir.
 */
export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/profile");
  }, [router]);
  return null;
}
