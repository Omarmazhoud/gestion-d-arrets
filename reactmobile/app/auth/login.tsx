import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "@/services/notificationService";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: normalizedEmail,
        password
      });

      const user = res.data;
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // 🔔 ENREGISTRER PUSH TOKEN
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await axios.put(`${BASE_URL}/utilisateurs/${user.id}/push-token`, token, {
            headers: { 'Content-Type': 'text/plain' }
          });
          console.log("Push token envoyé au backend");
        }
      } catch (e) {
        console.log("Erreur enregistrement notification:", e);
      }

      if (!user.actif) {
        Alert.alert("Compte non validé", "Attendez validation admin.");
        return;
      }

      if (user.role === "DEMANDEUR") {
        router.replace({
          pathname: "/demandeur",
          params: { userId: user.id }
        });
      } else {
        router.replace({
          pathname: "/executeur",
          params: { userId: user.id }
        });
      }

    } catch (error: any) {
      let errorMsg = "Email ou mot de passe incorrect";
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        errorMsg = "Impossible de se connecter au serveur. Vérifiez l'adresse IP et votre connexion.";
      }

      Alert.alert("Erreur", errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      
      <View style={styles.passwordContainer}>
        <TextInput 
          placeholder="Mot de passe" 
          secureTextEntry={!showPassword} 
          style={styles.passwordInput} 
          onChangeText={setPassword} 
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#0A84FF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={styles.link}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFFFFF"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 30,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#0A84FF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#EAF3FF"
  },
  button: {
    backgroundColor: "#0A84FF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold"
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0A84FF",
    borderRadius: 10,
    backgroundColor: "#EAF3FF",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
  },
  eyeIcon: {
    padding: 10,
  },
  link: {
    color: "#0A84FF",
    textAlign: "center",
    marginTop: 20
  }
});