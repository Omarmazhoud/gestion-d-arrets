import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  statut: string;
  priorite?: string;
  executeur: any;
};

export default function HomeExecuteur() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  // Récupérer l'ID de l'exécuteur depuis les paramètres de navigation
  const executeurId = params.userId as string;

  useFocusEffect(
    useCallback(() => {
      if (executeurId) {
        setLoading(true);
        fetchUserProfile();
      }
    }, [executeurId])
  );

  useEffect(() => {
    if (executeurId) {
      // Heartbeat (Ping) toutes les 45 secondes
      const pingInterval = setInterval(() => {
        axios.post(`${BASE_URL}/auth/ping/${executeurId}`)
          .catch(err => console.log("Ping error", err));
      }, 45000);

      return () => clearInterval(pingInterval);
    }
  }, [executeurId]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/utilisateurs/${executeurId}`);
      setUserProfile(res.data);
      fetchTickets(res.data.typeExecuteur);
    } catch (error) {
      console.log("Erreur profil:", error);
      setLoading(false);
    }
  };

  const fetchTickets = async (type: string) => {
    try {
      const response = await axios.get<Ticket[]>(
        `${BASE_URL}/tickets/executeur/${type}/${executeurId}`
      );
      setTickets(response.data);
    } catch (error) {
      console.log("Erreur récupération tickets :", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {

    switch (statut) {

      case "OUVERTE":
        return "orange";

      case "EN_COURS":
        return "#005A9C";

      case "FERMEE":
        return "green";

      default:
        return "gray";

    }

  };

  const getPriorityColor = (priorite?: string) => {
    if (priorite === "HAUTE") return "#ef4444";
    if (priorite === "MOYENNE") return "#f59e0b";
    if (priorite === "BASSE") return "#10b981";
    return "#e2e8f0"; // Par défaut
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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
            <Ionicons name="menu" size={28} color="#005A9C" />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={styles.subtitle}>Espace Exécuteur</Text>
            <Text style={styles.title}>Interventions</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/executeur/notifications")} style={styles.iconBtn}>
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

      {/* LISTE TICKETS */}

      {tickets.length === 0 ? (

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucun ticket disponible
          </Text>
        </View>

      ) : (

        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}

          renderItem={({ item }) => (

            <TouchableOpacity
              style={[
                styles.card, 
                { borderTopWidth: 6, borderTopColor: getPriorityColor(item.priorite) },
                item.executeur && item.executeur.id === executeurId ? { borderLeftWidth: 6, borderLeftColor: "#ff9500" } : null
              ]}

              onPress={() =>
                router.push({
                  pathname: "/executeur/detail-ticket" as any,
                  params: {
                    id: item.id,
                    executeurId: executeurId // Passer le vrai ID
                  }
                })
              }
            >

              {item.executeur && item.executeur.id === executeurId && (
                <Text style={{ color: "#ff9500", fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>🎯 Ticket Direct</Text>
              )}

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <Text style={[styles.cardTitle, { flex: 1 }]}>
                  {item.typePanne}
                </Text>
                {item.priorite && (
                  <View style={{ backgroundColor: getPriorityColor(item.priorite) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 10 }}>
                    <Text style={{ color: getPriorityColor(item.priorite), fontSize: 10, fontWeight: "bold" }}>{item.priorite}</Text>
                  </View>
                )}
              </View>

              <Text style={{ color: getStatusColor(item.statut), fontWeight: "600" }}>
                {item.statut}
              </Text>

            </TouchableOpacity>

          )}
        />

      )}

      {/* MENU LATERAL */}

      <Modal transparent visible={menuVisible} animationType="fade">

        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >

          <View style={styles.menuBox}>

            {/* CREER TICKET */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push({ pathname: "/executeur/create-ticket", params: { userId: executeurId } }); }}>
              <Ionicons name="add-circle-outline" size={22} color="#444" style={{marginRight: 10}} />
              <Text style={styles.menuText}>Déclarer un Ticket</Text>
            </TouchableOpacity>

            {/* PROFIL */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push({ pathname: "/executeur/profil", params: { userId: executeurId } }); }}>
              <Ionicons name="person-outline" size={22} color="#444" style={{marginRight: 10}} />
              <Text style={styles.menuText}>Mon Profil</Text>
            </TouchableOpacity>

            {/* QUALITE VERIF */}
            {userProfile?.typeExecuteur === "qualite" && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push({
                    pathname: "/executeur/qualite-verif",
                    params: { userId: executeurId }
                  });
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={22} color="#444" style={{marginRight: 10}} />
                <Text style={styles.menuText}>
                  Vérification Qualité
                </Text>
              </TouchableOpacity>
            )}

            {/* MESSAGERIE GROUPEE */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: "/executeur/chat" as any,
                  params: { userId: executeurId }
                });
              }}
            >
              <Ionicons name="chatbubbles-outline" size={22} color="#444" style={{marginRight: 10}} />
              <Text style={styles.menuText}>
                Messagerie Groupée
              </Text>
            </TouchableOpacity>

            {/* HISTORIQUE */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: "/executeur/historique",
                  params: { userId: executeurId }
                });
              }}
            >
              <Ionicons name="time-outline" size={22} color="#444" style={{marginRight: 10}} />
              <Text style={styles.menuText}>
                Historique
              </Text>
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                try {
                  if (executeurId) {
                    await axios.post(`${BASE_URL}/auth/logout/${executeurId}`);
                  }
                } catch (e) {
                  console.log("Logout error", e);
                }
                await AsyncStorage.clear();
                router.replace("/auth/login");
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="red" style={{marginRight: 10}} />
              <Text style={[styles.menuText, { color: "red" }]}>
                Logout
              </Text>
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
    marginBottom: 15
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
  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    color: "#1E293B"
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  emptyText: {
    fontSize: 16,
    color: "gray"
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },

  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155"
  }

});