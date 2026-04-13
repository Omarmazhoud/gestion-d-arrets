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

      <Text style={styles.title}>Historique</Text>

      {/* FILTRES */}

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
            filter === "NON_VERIFIER" && styles.activeFilter
          ]}
          onPress={() => setFilter("NON_VERIFIER")}
        >
          <Text>Non vérifié</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "TERMINE" && styles.activeFilter
          ]}
          onPress={() => setFilter("TERMINE")}
        >
          <Text>Terminé</Text>
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

            <Text style={[styles.status, { color: item.statut === 'FERMEE' ? 'green' : '#0A84FF' }]}>
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