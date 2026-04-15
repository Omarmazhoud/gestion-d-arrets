import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  description: string;
  statut: string;
  dateCreation: string;
};

export default function Historique() {

  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<"TOUS" | "AUJOURD_HUI">("TOUS");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tickets`);
      setTickets(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredTickets = tickets.filter(ticket => {
    if (filter === "TOUS") return true;

    return ticket.dateCreation?.startsWith(today);
  });

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#005A9C" />
        </TouchableOpacity>
        <Text style={styles.title}>Historique</Text>
      </View>

      {/* FILTRE */}
      <View style={styles.filterContainer}>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "TOUS" && styles.activeFilter
          ]}
          onPress={() => setFilter("TOUS")}
        >
          <Text style={[styles.filterText, filter === "TOUS" && {color: "#FFF"}]}>Tout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "AUJOURD_HUI" && styles.activeFilter
          ]}
          onPress={() => setFilter("AUJOURD_HUI")}
        >
          <Text style={[styles.filterText, filter === "AUJOURD_HUI" && {color: "#FFF"}]}>Aujourd'hui</Text>
        </TouchableOpacity>

      </View>

      {/* LISTE */}
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <Text style={styles.ticketTitle}>
              {item.typePanne}
            </Text>

            <Text>{item.description}</Text>

            <Text style={styles.status}>
              {item.statut}
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

  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 15
  },

  filterButton: {
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

  ticketCard: {
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

  ticketTitle: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
    color: "#1E293B"
  },

  status: {
    marginTop: 10,
    color: "#005A9C",
    fontWeight: "bold",
    backgroundColor: "#E0EFFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    fontSize: 12
  }

});