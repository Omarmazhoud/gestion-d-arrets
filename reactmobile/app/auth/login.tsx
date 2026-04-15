import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
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
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>
      
      <View style={styles.formBox}>
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
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#005A9C" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.link}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F4F7FB"
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    width: 320,
    height: 120
  },
  formBox: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 25,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#005A9C",
    marginBottom: 30,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: "#F4F7FB",
    fontSize: 16,
    color: "#334155"
  },
  button: {
    backgroundColor: "#005A9C",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#F4F7FB",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#334155"
  },
  eyeIcon: {
    padding: 15,
  },
  link: {
    color: "#005A9C",
    textAlign: "center",
    marginTop: 25,
    fontWeight: "600",
    fontSize: 15
  }
});