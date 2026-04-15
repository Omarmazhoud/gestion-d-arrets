import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from "react-native";

import { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  const params = useLocalSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<"TOUS" | "NON_VERIFIER" | "TERMINE">("TOUS");

  const [executeurId, setExecuteurId] = useState("");

  useEffect(() => {

    const loadUser = async () => {

      // Priorité au paramètre de navigation
      if (params.userId) {
        setExecuteurId(params.userId as string);
        return;
      }

      const user = await AsyncStorage.getItem("user");

      if (user) {
        const parsed = JSON.parse(user);
        setExecuteurId(parsed.id);
      }

    }

    loadUser();

  }, [params.userId]);


  useEffect(() => {

    if (executeurId) {
      fetchTickets();
    }

  }, [executeurId]);


  const fetchTickets = async () => {

    try {

      const res = await axios.get(
        `${BASE_URL}/tickets/executeurTickets/${executeurId}`
      );

      setTickets(res.data);

    } catch (error) {
      console.log(error);
    }

  };


  const filteredTickets = tickets.filter(ticket => {

    if (filter === "TOUS") return true;

    if (filter === "NON_VERIFIER") {
      return ticket.statut === "A_VERIFIER_QUALITE" || ticket.statut === "A_VERIFIER_DEMANDEUR";
    }

    if (filter === "TERMINE") {
      return ticket.statut === "FERMEE";
    }

    return true;

  });


  return (

    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#005A9C" />
        </TouchableOpacity>
        <Text style={styles.title}>Historique</Text>
      </View>

      {/* FILTRES */}

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
            filter === "NON_VERIFIER" && styles.activeFilter
          ]}
          onPress={() => setFilter("NON_VERIFIER")}
        >
          <Text style={[styles.filterText, filter === "NON_VERIFIER" && {color: "#FFF"}]}>Non vérifié</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "TERMINE" && styles.activeFilter
          ]}
          onPress={() => setFilter("TERMINE")}
        >
          <Text style={[styles.filterText, filter === "TERMINE" && {color: "#FFF"}]}>Terminé</Text>
        </TouchableOpacity>

      </View>


      {/* LISTE */}

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity 
            style={styles.ticketCard}
            onPress={() => {
               // On peut retourner sur le ticket s'il n'est pas encore fermé
               router.push({
                 pathname: "/executeur/detail-ticket",
                 params: { id: item.id, executeurId }
               });
            }}
          >

            <Text style={styles.ticketTitle}>
              {item.typePanne}
            </Text>

            <Text>
              {item.description}
            </Text>

            <Text style={[styles.status, { color: item.statut === 'FERMEE' ? 'green' : '#005A9C' }]}>
              {item.statut}
            </Text>

          </TouchableOpacity>

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
    paddingHorizontal: 15,
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