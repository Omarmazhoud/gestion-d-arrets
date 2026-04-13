import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            if (!projectId || projectId === "VOTRE-PROJECT-ID-ICI") {
                console.error("❌ ERREUR : Project ID non configuré dans app.json.");
                console.error("Veuillez récupérer votre Project ID sur expo.dev et le mettre dans app.json -> extra.eas.projectId");
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId
            })).data;
            console.log("Expo Push Token:", token);
        } catch (e) {
            console.error("Error getting expo push token:", e);
        }
    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token;
}
