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
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  statut: string;
  executeur: any;
};

export default function HomeExecuteur() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Récupérer l'ID de l'exécuteur depuis les paramètres de navigation
  const executeurId = params.userId as string;

  useEffect(() => {
    if (executeurId) {
      fetchUserProfile();
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
        return "#0A84FF";

      case "FERMEE":
        return "green";

      default:
        return "gray";

    }

  };

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );

  }

  return (

    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={26} color="#0A84FF" />
        </TouchableOpacity>

        <Text style={styles.title}>
          Bienvenue {userProfile?.nom || "Exécuteur"}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/executeur/notifications")}
        >
          <Ionicons name="notifications-outline" size={26} color="#0A84FF" />
        </TouchableOpacity>

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
              style={[styles.card, item.executeur && item.executeur.id === executeurId ? { borderLeftWidth: 6, borderLeftColor: "#ff9500" } : null]}

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

              <Text style={styles.cardTitle}>
                {item.typePanne}
              </Text>

              <Text style={{ color: getStatusColor(item.statut) }}>
                {item.statut}
              </Text>

            </TouchableOpacity>

          )}
        />

      )}

      {/* MENU */}

      <Modal transparent visible={menuVisible} animationType="fade">

        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >

          <View style={styles.menuBox}>

            {/* HISTORIQUE */}

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
                <Text style={styles.menuText}>
                  Vérification Qualité
                </Text>
              </TouchableOpacity>
            )}

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
              <Text style={styles.menuText}>
                Messagerie Groupée
              </Text>
            </TouchableOpacity>

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
    paddingTop: 50,
    backgroundColor: "#FFFFFF"
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A84FF"
  },

  card: {
    backgroundColor: "#EAF3FF",
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-start"
  },

  menuBox: {
    marginTop: 70,
    marginLeft: 10,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    width: 180,
    elevation: 5
  },

  menuItem: {
    paddingVertical: 10
  },

  menuText: {
    fontSize: 16
  }

});