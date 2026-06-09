import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Ticket = {
  id: string;
  typePanne: string;
  statut: string;
  dateCreation: string;
  dateFinIntervention?: string;
  executeur?: { nom: string };
  commentaireVerification?: string;
};

type NotifItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  titre: string;
  message: string;
  date: string;
  isNew: boolean;
};

const STATUS_MAP: Record<string, { titre: string; message: (t: Ticket) => string; icon: keyof typeof Ionicons.glyphMap; iconColor: string; bgColor: string; isNew: boolean }> = {
  OUVERTE:              { titre: "Ticket Ouvert",            message: (t) => `Votre ticket "${t.typePanne.replace(/_/g, " ")}" est en attente d'un exécuteur.`,                    icon: "time-outline",               iconColor: "#F59E0B", bgColor: "#FFFBEB", isNew: false },
  EN_COURS:             { titre: "Prise en Charge",          message: (t) => `Votre ticket est pris en charge${t.executeur ? " par " + t.executeur.nom : ""}.`,                     icon: "construct-outline",          iconColor: "#3B82F6", bgColor: "#EFF6FF", isNew: true  },
  A_VERIFIER_QUALITE:   { titre: "Vérification Qualité",     message: () => `L'intervention est terminée et est en cours de vérification par le service Qualité.`,                 icon: "shield-checkmark-outline",   iconColor: "#8B5CF6", bgColor: "#F5F3FF", isNew: true  },
  A_VERIFIER_DEMANDEUR: { titre: "À Votre Tour de Vérifier", message: () => `L'intervention est terminée. Veuillez vérifier et valider depuis le tableau de bord.`,               icon: "checkmark-circle-outline",   iconColor: "#10B981", bgColor: "#ECFDF5", isNew: true  },
  FERMEE:               { titre: "Ticket Fermé",             message: (t) => `Votre ticket "${t.typePanne.replace(/_/g, " ")}" a été clôturé avec succès.`,                        icon: "lock-closed-outline",        iconColor: "#6B7280", bgColor: "#F9FAFB", isNew: false },
  REOUVERTE:            { titre: "Ticket Réouvert",          message: (t) => `Ticket réouvert suite à votre refus : "${t.commentaireVerification || "correction insuffisante"}".`,  icon: "refresh-circle-outline",     iconColor: "#EF4444", bgColor: "#FEF2F2", isNew: true  },
  REFUSE_QUALITE:       { titre: "Refus Qualité",            message: () => `Le service Qualité a refusé l'intervention. L'exécuteur va reprendre le ticket.`,                    icon: "close-circle-outline",       iconColor: "#EF4444", bgColor: "#FEF2F2", isNew: true  },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Notifications() {
  const router = useRouter();
  const { userId: paramUserId } = useLocalSearchParams();
  const [userId, setUserId] = useState<string | null>(paramUserId as string || null);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [filter, setFilter] = useState<"TOUS" | "NON_LU">("TOUS");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      if (!userId) {
        try {
          const userStr = await AsyncStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.id) {
              setUserId(user.id);
              return;
            }
          }
        } catch (e) {
          console.log("Error reading user from async storage", e);
        }
        setLoading(false);
      }
    };
    getUserId();
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${BASE_URL}/tickets/demandeur/${userId}`);
      const tickets: Ticket[] = res.data;

      const notifs: NotifItem[] = tickets
        .map((t) => {
          const info = STATUS_MAP[t.statut];
          if (!info) return null;
          return {
            id: t.id,
            icon: info.icon,
            iconColor: info.iconColor,
            bgColor: info.bgColor,
            titre: info.titre,
            message: info.message(t),
            date: formatDate(t.dateFinIntervention || t.dateCreation),
            isNew: info.isNew,
          } as NotifItem;
        })
        .filter(Boolean) as NotifItem[];

      // Trier : les plus récents en premier (isNew d'abord)
      notifs.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
      setNotifications(notifs);
    } catch (err) {
      console.log("Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const filtered = filter === "TOUS" ? notifications : notifications.filter((n) => n.isNew);
  const newCount = notifications.filter((n) => n.isNew).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#005A9C" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Notifications</Text>
          {newCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{newCount} nouvelle{newCount > 1 ? "s" : ""}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.backButton}>
          <Ionicons name="refresh" size={22} color="#005A9C" />
        </TouchableOpacity>
      </View>

      {/* FILTRES */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "TOUS" && styles.activeFilter]}
          onPress={() => setFilter("TOUS")}
        >
          <Text style={[styles.filterText, filter === "TOUS" && styles.activeFilterText]}>
            Tout ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "NON_LU" && styles.activeFilter]}
          onPress={() => setFilter("NON_LU")}
        >
          <Text style={[styles.filterText, filter === "NON_LU" && styles.activeFilterText]}>
            Non lues ({newCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTE */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005A9C" />
          <Text style={styles.loaderText}>Chargement...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={70} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptyText}>Vous n'avez aucune notification pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#005A9C"]} />}
          renderItem={({ item }) => (
            <View style={[styles.card, item.isNew && styles.cardNew]}>
              <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{item.titre}</Text>
                  {item.isNew && <View style={styles.dot} />}
                </View>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB", paddingTop: 45 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: "#F0F5FA",
    padding: 10,
    borderRadius: 14,
  },
  headerCenter: { alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: "#005A9C" },
  countBadge: {
    marginTop: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  countBadgeText: { fontSize: 11, color: "#3B82F6", fontWeight: "700" },
  filters: { flexDirection: "row", paddingHorizontal: 15, marginBottom: 10 },
  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
    marginRight: 10,
    elevation: 1,
  },
  activeFilter: { backgroundColor: "#005A9C", borderColor: "#005A9C", elevation: 4 },
  filterText: { fontWeight: "700", color: "#64748B", fontSize: 13 },
  activeFilterText: { color: "#FFF" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 12, color: "#94A3B8", fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#334155", marginTop: 20, marginBottom: 8 },
  emptyText: { color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 22 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardNew: {
    borderLeftWidth: 4,
    borderLeftColor: "#005A9C",
    borderColor: "#DBEAFE",
    backgroundColor: "#FAFCFF",
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#005A9C",
  },
  cardMessage: { fontSize: 13, color: "#475569", lineHeight: 20, marginBottom: 6 },
  cardDate: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
});