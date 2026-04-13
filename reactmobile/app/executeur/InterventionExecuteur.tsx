import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/constants/api";

export default function Intervention(){

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [commentaire,setCommentaire] = useState("");

  const terminer = async () => {

    try{

      await axios.put(`${BASE_URL}/tickets/${id}/terminer`,{
        commentaireIntervention: commentaire
      });

      Alert.alert("Succès","Intervention terminée");

      router.back();

    }catch{

      Alert.alert("Erreur","Impossible de terminer l'intervention");

    }

  };

  return(

    <View style={styles.container}>

      <Text style={styles.title}>
        Intervention
      </Text>

      <Text>
        Date début : {new Date().toLocaleString()}
      </Text>

      <TextInput
        placeholder="Commentaire intervention"
        style={styles.input}
        value={commentaire}
        onChangeText={setCommentaire}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={terminer}
      >
        <Text style={styles.buttonText}>
          Terminer intervention
        </Text>
      </TouchableOpacity>

    </View>

  )
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
marginBottom:20
},

input:{
borderWidth:1,
borderColor:"#0A84FF",
padding:12,
borderRadius:8,
marginTop:20
},

button:{
backgroundColor:"green",
padding:15,
borderRadius:8,
marginTop:20,
alignItems:"center"
},

buttonText:{
color:"#FFFFFF",
fontWeight:"bold"
}

});