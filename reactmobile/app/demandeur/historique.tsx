import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  description: string;
  statut: string;
  dateCreation: string;
};

export default function Historique() {

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

      <Text style={styles.title}>Historique</Text>

      {/* FILTRE */}
      <View style={styles.filterContainer}>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "TOUS" && styles.activeFilter
          ]}
          onPress={() => setFilter("TOUS")}
        >
          <Text>Tout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "AUJOURD_HUI" && styles.activeFilter
          ]}
          onPress={() => setFilter("AUJOURD_HUI")}
        >
          <Text>Aujourd'hui</Text>
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
    padding: 20,
    backgroundColor: "#FFFFFF"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 20
  },

  filterContainer: {
    flexDirection: "row",
    marginBottom: 20
  },

  filterButton: {
    borderWidth: 1,
    borderColor: "#0A84FF",
    padding: 10,
    borderRadius: 8,
    marginRight: 10
  },

  activeFilter: {
    backgroundColor: "#0A84FF"
  },

  ticketCard: {
    backgroundColor: "#EAF3FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },

  ticketTitle: {
    fontWeight: "bold",
    marginBottom: 5
  },

  status: {
    marginTop: 5,
    color: "#0A84FF"
  }

});