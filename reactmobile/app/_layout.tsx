import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";

// Configurer comment les notifications s'affichent quand l'app est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}