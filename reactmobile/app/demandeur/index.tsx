import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Alert
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  description: string;
  statut: string;
};

export default function HomeDemandeur() {

  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchTickets();

    // Heartbeat (Ping) toutes les 45 secondes
    const pingInterval = setInterval(() => {
      if (userId) {
        axios.post(`${BASE_URL}/auth/ping/${userId}`)
          .catch(err => console.log("Ping error", err));
      }
    }, 45000);

    return () => clearInterval(pingInterval);
  }, [userId]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tickets/demandeur/${userId}`);
      const aVerifier = res.data.filter((t: any) => t.statut === "A_VERIFIER_DEMANDEUR");
      setTickets(aVerifier);
    } catch (err) {
      console.log(err);
    }
  };

  const validerTicket = async (id: string) => {
    try {
      await axios.put(`${BASE_URL}/tickets/${id}/valider`);
      Alert.alert("Succès", "Ticket validé avec succès");
      fetchTickets();
    } catch {
      Alert.alert("Erreur", "Impossible de valider le ticket");
    }
  };

  const refuserTicket = async (id: string) => {
    try {
      await axios.put(`${BASE_URL}/tickets/${id}/refuser?message=Correction refusée`);
      Alert.alert("Succès", "Ticket refusé et renvoyé à l'exécuteur");
      fetchTickets();
    } catch {
      Alert.alert("Erreur", "Impossible de refuser le ticket");
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
            <Ionicons name="menu" size={28} color="#005A9C" />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={styles.subtitle}>Espace Demandeur</Text>
            <Text style={styles.title}>Tableau de Bord</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/demandeur/notifications")} style={styles.iconBtn}>
            <View>
              <Ionicons name="notifications" size={26} color="#005A9C" />
              {notifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENU PRINCIPAL : TICKETS A VERIFIER */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Interventions à vérifier</Text>
        
        {tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune intervention en attente de vérification.</Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="construct" size={20} color="#005A9C" />
                  <Text style={styles.type}>{item.typePanne.replace(/_/g, " ").toUpperCase()}</Text>
                </View>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.validateBtn} onPress={() => validerTicket(item.id)}>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.btnText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refuseBtn} onPress={() => refuserTicket(item.id)}>
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.btnText}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* BOUTON FLOTTANT CREER TICKET (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: "/demandeur/create-ticket", params: { userId } })}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* MENU LATERAL */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            {/* PROFIL */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push({ pathname: "/demandeur/profil", params: { userId } }); }}>
              <Ionicons name="person-outline" size={22} color="#444" style={{marginRight: 10}} />
              <Text style={styles.menuText}>Mon Profil</Text>
            </TouchableOpacity>

            {/* HISTORIQUE */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push({ pathname: "/demandeur/historique", params: { userId } }); }}>
              <Ionicons name="time-outline" size={22} color="#444" style={{marginRight: 10}} />
              <Text style={styles.menuText}>Historique</Text>
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity style={styles.menuItem} onPress={async () => {
                setMenuVisible(false);
                try {
                  if (userId) await axios.post(`${BASE_URL}/auth/logout/${userId}`);
                } catch (e) {
                  console.log("Logout error", e);
                }
                router.replace("/auth/login");
              }}>
              <Ionicons name="log-out-outline" size={22} color="red" style={{marginRight: 10}} />
              <Text style={[styles.menuText, { color: "red" }]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: "#F4F7FB"
  },
  header: {
    paddingHorizontal: 20,
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    backgroundColor: "#F0F5FA",
    padding: 10,
    borderRadius: 16,
  },
  titleWrapper: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 1
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#005A9C"
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 15,
    paddingLeft: 5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60
  },
  emptyText: {
    marginTop: 15,
    color: "#94A3B8",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500"
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  type: {
    fontWeight: "800",
    fontSize: 16,
    color: "#1E293B",
    marginLeft: 10
  },
  description: {
    color: "#475569",
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 22
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  validateBtn: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10
  },
  refuseBtn: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center"
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#005A9C",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-start",
    alignItems: "flex-start"
  },
  menuBox: {
    marginTop: 55,
    marginLeft: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444"
  },
  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold"
  }
});