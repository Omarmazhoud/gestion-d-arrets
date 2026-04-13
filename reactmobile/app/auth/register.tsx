import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
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
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#0A84FF" />
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
          <Text style={styles.roleText}>Demandeur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "EXECUTEUR" && styles.activeRole
          ]}
          onPress={() => setRole("EXECUTEUR")}
        >
          <Text style={styles.roleText}>Exécuteur</Text>
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0A84FF",
    textAlign: "center",
    marginBottom: 25
  },
  subtitle: {
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#0A84FF",
    backgroundColor: "#EAF3FF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0A84FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5
  },
  activeRole: {
    backgroundColor: "#0A84FF"
  },
  roleText: {
    color: "#000"
  },
  typeItem: {
    borderWidth: 1,
    borderColor: "#0A84FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  activeType: {
    backgroundColor: "#0A84FF"
  },
  button: {
    backgroundColor: "#0A84FF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16
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
  }
});