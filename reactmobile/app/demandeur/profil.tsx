import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "@/constants/api";

export default function ProfilDemandeur() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/utilisateurs/${userId}`);
      setUserProfile(res.data);
    } catch (error) {
      console.log("Erreur chargement profil:", error);
      Alert.alert("Erreur", "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setSaving(true);
      // Préparer le payload avec les anciennes données + le nouveau mot de passe
      const payload = {
        ...userProfile,
        password: newPassword
      };

      await axios.put(`${BASE_URL}/utilisateurs/${userId}`, payload);
      Alert.alert("Succès", "Votre mot de passe a été modifié avec succès.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log("Erreur modif mot de passe", error);
      Alert.alert("Erreur", "Impossible de modifier le mot de passe.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#005A9C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#005A9C" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="person-circle-outline" size={80} color="#005A9C" style={{alignSelf: 'center'}} />
          <Text style={styles.name}>{userProfile?.nom}</Text>
          <Text style={styles.matricule}>Matricule: {userProfile?.matricule}</Text>
        </View>

        <Text style={styles.sectionTitle}>Changer de mot de passe</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmer le nouveau mot de passe"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleChangePassword}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Enregistrer le mot de passe</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    paddingTop: 45
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 10
  },
  backButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: "#F0F5FA",
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#005A9C",
    marginLeft: 10
  },
  content: {
    padding: 20
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 12
  },
  matricule: {
    fontSize: 16,
    color: "#475569",
    marginTop: 6,
    fontWeight: "500"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 15,
    paddingLeft: 5
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
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
    elevation: 6
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
