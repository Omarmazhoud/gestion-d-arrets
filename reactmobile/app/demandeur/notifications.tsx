import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Notification = {
  id: string;
  message: string;
  lu: boolean;
  date: string;
};

export default function Notifications() {
  const router = useRouter();
  const [filter, setFilter] = useState<"TOUS" | "NON_LU">("TOUS");

  // Notifications simulées
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      message: "Votre ticket machine WK-23 est en cours de traitement",
      lu: false,
      date: "2026-03-04"
    },
    {
      id: "2",
      message: "Ticket #245 terminé par maintenance",
      lu: true,
      date: "2026-03-03"
    }
  ]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "TOUS") return true;
    return !n.lu;
  });

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#005A9C" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {/* FILTRE */}
      <View style={styles.filters}>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            filter === "TOUS" && styles.activeFilter
          ]}
          onPress={() => setFilter("TOUS")}
        >
          <Text style={[styles.filterText, filter === "TOUS" && {color: "#FFF"}]}>Tout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            filter === "NON_LU" && styles.activeFilter
          ]}
          onPress={() => setFilter("NON_LU")}
        >
          <Text style={[styles.filterText, filter === "NON_LU" && {color: "#FFF"}]}>Non lues</Text>
        </TouchableOpacity>

      </View>

      {/* LISTE */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.card,
            !item.lu && styles.unread
          ]}>

            <Text style={styles.message}>
              {item.message}
            </Text>

            <Text style={styles.date}>
              {item.date}
            </Text>

          </View>
        )}
      />

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

  filters: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 15
  },

  filterBtn: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginRight: 10,
    elevation: 2
  },

  activeFilter: {
    backgroundColor: "#005A9C",
    borderColor: "#005A9C",
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },

  filterText: {
    fontWeight: "700",
    color: "#334155"
  },

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
    borderColor: "#F1F5F9"
  },

  unread: {
    borderLeftWidth: 6,
    borderLeftColor: "#FF3B30",
    backgroundColor: "#FFF5F5"
  },

  message: {
    fontSize: 15
  },

  date: {
    fontSize: 12,
    color: "gray",
    marginTop: 5
  }

});