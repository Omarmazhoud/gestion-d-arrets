import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from "react-native";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {

  const router = useRouter();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"DEMANDEUR" | "EXECUTEUR">("DEMANDEUR");
  const [typeExecuteur, setTypeExecuteur] = useState("");

  // ENUM BACKEND
  const TYPE_EXECUTEUR_LIST = [
    "maintenance",
    "informatique",
    "qualite",
    "logistique",
    "process",
    "batiment",
    "production",
    "autre"
  ];

  const handleRegister = async () => {

    if (!nom || !email || !matricule || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (role === "EXECUTEUR" && !typeExecuteur) {
      Alert.alert("Erreur", "Veuillez choisir un type exécuteur");
      return;
    }

    try {

      await axios.post(`${BASE_URL}/auth/register`, {
        nom,
        email,
        matricule,
        password,
        role,
        typeExecuteur: role === "EXECUTEUR"
          ? typeExecuteur
          : "autre"
      });

      Alert.alert("Succès", "Compte en attente validation admin");
      router.replace("/auth/login");

    } catch (error: any) {
      console.log("Erreur backend :", error.response?.data);
      Alert.alert("Erreur", "Impossible de créer le compte");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>

      <View style={styles.formBox}>
        <Text style={styles.title}>Créer un compte</Text>

        <TextInput
        placeholder="Nom"
        style={styles.input}
        value={nom}
        onChangeText={setNom}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Matricule"
        style={styles.input}
        value={matricule}
        onChangeText={setMatricule}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mot de passe"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#005A9C" />
        </TouchableOpacity>
      </View>

      {/* ROLE */}
      <Text style={styles.subtitle}>Choisir rôle :</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "DEMANDEUR" && styles.activeRole
          ]}
          onPress={() => {
            setRole("DEMANDEUR");
            setTypeExecuteur("");
          }}
        >
          <Text style={[styles.roleText, role === "DEMANDEUR" && {color: "#FFF"}]}>Demandeur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "EXECUTEUR" && styles.activeRole
          ]}
          onPress={() => setRole("EXECUTEUR")}
        >
          <Text style={[styles.roleText, role === "EXECUTEUR" && {color: "#FFF"}]}>Exécuteur</Text>
        </TouchableOpacity>
      </View>

      {/* TYPE EXECUTEUR AUTOMATIQUE */}
      {role === "EXECUTEUR" && (
        <>
          <Text style={styles.subtitle}>Type Exécuteur :</Text>

          {TYPE_EXECUTEUR_LIST.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeItem,
                typeExecuteur === type && styles.activeType
              ]}
              onPress={() => setTypeExecuteur(type)}
            >
              <Text style={{
                color: typeExecuteur === type ? "#FFFFFF" : "#000"
              }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F4F7FB"
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30
  },
  logo: {
    width: 280,
    height: 100
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
    borderColor: "#F1F5F9",
    marginBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#005A9C",
    textAlign: "center",
    marginBottom: 30
  },
  subtitle: {
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
    marginTop: 15,
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F4F7FB",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    fontSize: 16,
    color: "#334155"
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F4F7FB",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 5
  },
  activeRole: {
    backgroundColor: "#005A9C",
    borderColor: "#005A9C",
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  roleText: {
    color: "#334155",
    fontWeight: "700"
  },
  typeItem: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F4F7FB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  activeType: {
    backgroundColor: "#005A9C",
    borderColor: "#005A9C",
  },
  button: {
    backgroundColor: "#005A9C",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 25,
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
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#334155"
  },
  eyeIcon: {
    padding: 15,
  }
});