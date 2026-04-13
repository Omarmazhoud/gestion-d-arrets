import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { useState } from "react";

type Notification = {
  id: string;
  message: string;
  lu: boolean;
  date: string;
};

export default function Notifications() {

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

      <Text style={styles.title}>Notifications</Text>

      {/* FILTRE */}
      <View style={styles.filters}>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            filter === "TOUS" && styles.activeFilter
          ]}
          onPress={() => setFilter("TOUS")}
        >
          <Text style={styles.filterText}>Tout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            filter === "NON_LU" && styles.activeFilter
          ]}
          onPress={() => setFilter("NON_LU")}
        >
          <Text style={styles.filterText}>Non lues</Text>
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
    padding: 20,
    backgroundColor: "#FFFFFF"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 20
  },

  filters: {
    flexDirection: "row",
    marginBottom: 20
  },

  filterBtn: {
    borderWidth: 1,
    borderColor: "#0A84FF",
    padding: 10,
    borderRadius: 8,
    marginRight: 10
  },

  activeFilter: {
    backgroundColor: "#0A84FF"
  },

  filterText: {
    color: "#000"
  },

  card: {
    backgroundColor: "#EAF3FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },

  unread: {
    borderLeftWidth: 5,
    borderLeftColor: "red"
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