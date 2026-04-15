import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  description: string;
  statut: string;
  commentaireIntervention: string;
};

export default function QualiteVerif() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refusalMessage, setRefusalMessage] = useState("");
  const [refusingId, setRefusingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tickets`);
      const aVerifierQualite = res.data.filter(
        (t: any) => t.statut === "A_VERIFIER_QUALITE"
      );
      setTickets(aVerifierQualite);
    } catch (err) {
      console.log(err);
    }
  };

  const validerTicket = async (id: string) => {
    try {
      await axios.put(`${BASE_URL}/tickets/${id}/validerQualite`);
      Alert.alert("Succès", "Ticket validé par la Qualité");
      fetchTickets();
    } catch {
      Alert.alert("Erreur", "Impossible de valider");
    }
  };

  const refuserTicket = async (id: string) => {
    if (!refusalMessage) {
      Alert.alert("Erreur", "Veuillez saisir un motif de refus");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/tickets/${id}/refuserQualite?message=${refusalMessage}`
      );
      Alert.alert("Ticket refusé", "L'exécuteur a été notifié");
      setRefusingId(null);
      setRefusalMessage("");
      fetchTickets();
    } catch {
      Alert.alert("Erreur", "Impossible de refuser");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#005A9C" />
        </TouchableOpacity>
        <Text style={styles.title}>Validation Qualité</Text>
      </View>

      {tickets.length === 0 ? (
        <Text style={styles.empty}>Aucun ticket à valider</Text>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.type}>{item.typePanne}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              
              <View style={styles.interventionBox}>
                <Text style={styles.subtitle}>Commentaire Intervention:</Text>
                <Text>{item.commentaireIntervention || "Aucun commentaire"}</Text>
              </View>

              {refusingId === item.id ? (
                <View style={styles.refuseInputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="Motif du refus..."
                    value={refusalMessage}
                    onChangeText={setRefusalMessage}
                  />
                  <View style={styles.buttons}>
                    <TouchableOpacity
                      style={styles.btnConfirmRefuse}
                      onPress={() => refuserTicket(item.id)}
                    >
                      <Text style={styles.btnText}>Confirmer Refus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnCancel}
                      onPress={() => {
                        setRefusingId(null);
                        setRefusalMessage("");
                      }}
                    >
                      <Text style={styles.btnText}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={styles.validate}
                    onPress={() => validerTicket(item.id)}
                  >
                    <Text style={styles.btnText}>VALIDER OK</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.refuse}
                    onPress={() => setRefusingId(item.id)}
                  >
                    <Text style={styles.btnText}>REFUSER</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
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
    marginBottom: 20
  },
  backButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: "#F0F5FA",
    borderRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#005A9C",
    marginLeft: 10
  },
  empty: { textAlign: "center", marginTop: 50, color: "gray", fontSize: 16, fontWeight: "500" },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  type: { fontWeight: "800", fontSize: 18, marginBottom: 8, color: "#1e293b" },
  desc: { color: "#475569", marginBottom: 15, fontSize: 14, lineHeight: 22 },
  subtitle: { fontWeight: "700", fontSize: 14, marginTop: 5, color: "#1e293b" },
  interventionBox: { backgroundColor: "#F8FAFC", padding: 15, borderRadius: 12, marginTop: 5, borderWidth: 1, borderColor: "#e2e8f0" },
  buttons: { flexDirection: "row", marginTop: 20 },
  validate: { backgroundColor: "#10B981", padding: 16, borderRadius: 16, marginRight: 10, flex: 1, alignItems: "center", shadowColor: "#10B981", shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: {width:0, height:4}, elevation: 5 },
  refuse: { backgroundColor: "#EF4444", padding: 16, borderRadius: 16, flex: 1, alignItems: "center", shadowColor: "#EF4444", shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: {width:0, height:4}, elevation: 5 },
  btnText: { color: "white", fontWeight: "800", fontSize: 14 },
  refuseInputBox: { marginTop: 15 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 15, borderRadius: 16, backgroundColor: "white", fontSize: 16 },
  btnConfirmRefuse: { backgroundColor: "#EF4444", padding: 14, borderRadius: 12, marginRight: 10, marginTop: 15, flex: 1, alignItems: "center" },
  btnCancel: { backgroundColor: "#64748b", padding: 14, borderRadius: 12, flex: 1, alignItems: "center", marginTop: 15 }
});
