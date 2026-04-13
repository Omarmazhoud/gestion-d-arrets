import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from "react-native";

import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@/constants/api";

type Ticket = {
  id: string;
  typePanne: string;
  description: string;
  statut: string;
};

export default function AVerifier(){

  const { userId } = useLocalSearchParams();

  const [tickets,setTickets] = useState<Ticket[]>([]);

  useEffect(()=>{
    fetchTickets();
  },[]);

  const fetchTickets = async () => {

    try{

      const res = await axios.get(
        `${BASE_URL}/tickets/demandeur/${userId}`
      );

      const aVerifier = res.data.filter(
        (t:any)=>t.statut === "A_VERIFIER_DEMANDEUR"
      );

      setTickets(aVerifier);

    }catch(err){
      console.log(err);
    }

  };

  const validerTicket = async (id:string) => {

    try{

      await axios.put(`${BASE_URL}/tickets/${id}/valider`);

      Alert.alert("Succès","Ticket validé");

      fetchTickets();

    }catch{
      Alert.alert("Erreur","Impossible de valider");
    }

  };

  const refuserTicket = async (id:string) => {

    try{

      await axios.put(
        `${BASE_URL}/tickets/${id}/refuser?message=Correction refusée`
      );

      Alert.alert("Ticket refusé");

      fetchTickets();

    }catch{
      Alert.alert("Erreur","Impossible de refuser");
    }

  };

  return(

    <View style={styles.container}>

      <Text style={styles.title}>Tickets à vérifier</Text>

      <FlatList
        data={tickets}
        keyExtractor={(item)=>item.id}

        renderItem={({item})=>(

          <View style={styles.card}>

            <Text style={styles.type}>
              {item.typePanne}
            </Text>

            <Text>
              {item.description}
            </Text>

            <View style={styles.buttons}>

              {/* VALIDER */}
              <TouchableOpacity
                style={styles.validate}
                onPress={()=>validerTicket(item.id)}
              >
                <Text style={styles.btnText}>✔</Text>
              </TouchableOpacity>

              {/* REFUSER */}
              <TouchableOpacity
                style={styles.refuse}
                onPress={()=>refuserTicket(item.id)}
              >
                <Text style={styles.btnText}>✖</Text>
              </TouchableOpacity>

            </View>

          </View>

        )}
      />

    </View>

  );

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:"#FFFFFF"
},

title:{
fontSize:22,
fontWeight:"bold",
color:"#0A84FF",
marginBottom:20
},

card:{
backgroundColor:"#EAF3FF",
padding:15,
borderRadius:10,
marginBottom:10
},

type:{
fontWeight:"bold",
marginBottom:5
},

buttons:{
flexDirection:"row",
marginTop:10
},

validate:{
backgroundColor:"green",
padding:10,
borderRadius:8,
marginRight:10
},

refuse:{
backgroundColor:"red",
padding:10,
borderRadius:8
},

btnText:{
color:"white",
fontWeight:"bold",
fontSize:16
}

});