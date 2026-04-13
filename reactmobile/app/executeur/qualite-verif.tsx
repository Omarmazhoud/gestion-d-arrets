import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput
} from "react-native";

import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
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
      <Text style={styles.title}>Validation Qualité</Text>

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
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF", paddingTop: 50 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0A84FF", marginBottom: 20 },
  empty: { textAlign: "center", marginTop: 50, color: "gray" },
  card: { backgroundColor: "#EAF3FF", padding: 15, borderRadius: 10, marginBottom: 15 },
  type: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  desc: { color: "#555", marginBottom: 10 },
  subtitle: { fontWeight: "bold", fontSize: 14, marginTop: 5 },
  interventionBox: { backgroundColor: "#fff", padding: 10, borderRadius: 5, marginTop: 5 },
  buttons: { flexDirection: "row", marginTop: 15 },
  validate: { backgroundColor: "green", padding: 12, borderRadius: 8, marginRight: 10, flex: 1, alignItems: "center" },
  refuse: { backgroundColor: "red", padding: 12, borderRadius: 8, flex: 1, alignItems: "center" },
  btnText: { color: "white", fontWeight: "bold" },
  refuseInputBox: { marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, backgroundColor: "white" },
  btnConfirmRefuse: { backgroundColor: "red", padding: 10, borderRadius: 8, marginRight: 10, marginTop: 10 },
  btnCancel: { backgroundColor: "gray", padding: 10, borderRadius: 8, marginTop: 10 }
});
