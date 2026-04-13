import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/constants/api";

export default function HomeDemandeur() {

  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  return (

    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons
            name="menu"
            size={28}
            color="#0A84FF"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Accueil
        </Text>

        {/* NOTIFICATIONS */}

        <TouchableOpacity
          onPress={() =>
            router.push("/demandeur/notifications")
          }
        >

          <View>

            <Ionicons
              name="notifications-outline"
              size={28}
              color="#0A84FF"
            />

            {notifCount > 0 && (

              <View style={styles.badge}>

                <Text style={styles.badgeText}>
                  {notifCount}
                </Text>

              </View>

            )}

          </View>

        </TouchableOpacity>

      </View>

      {/* BOUTON CREER TICKET */}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/demandeur/create-ticket",
            params: { userId }
          })
        }
      >

        <Ionicons
          name="add-circle"
          size={90}
          color="#0A84FF"
        />

        <Text style={styles.buttonText}>
          Créer un Ticket
        </Text>

      </TouchableOpacity>


      {/* MENU LATERAL */}

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
      >

        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >

          <View style={styles.menuBox}>

            {/* HISTORIQUE */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                router.push({
                  pathname: "/demandeur/historique",
                  params: { userId }
                });

              }}
            >
              <Text style={styles.menuText}>
                Historique
              </Text>
            </TouchableOpacity>


            {/* A VERIFIER */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                router.push({
                  pathname: "/demandeur/a-verifier",
                  params: { userId }
                });

              }}
            >
              <Text style={styles.menuText}>
                À vérifier
              </Text>
            </TouchableOpacity>


            {/* LOGOUT */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                try {
                  if (userId) {
                    await axios.post(`${BASE_URL}/auth/logout/${userId}`);
                  }
                } catch (e) {
                  console.log("Logout error", e);
                }
                router.replace("/auth/login");
              }}
            >

              <Text
                style={[
                  styles.menuText,
                  { color: "red" }
                ]}
              >
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

container:{
flex:1,
paddingTop:50,
backgroundColor:"#FFFFFF"
},

header:{
flexDirection:"row",
justifyContent:"space-between",
paddingHorizontal:20,
alignItems:"center"
},

title:{
fontSize:20,
fontWeight:"bold",
color:"#0A84FF"
},

button:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

buttonText:{
marginTop:10,
fontSize:16
},

overlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.4)",
justifyContent:"flex-start",
alignItems:"flex-start"
},

menuBox:{
marginTop:70,
marginLeft:10,
backgroundColor:"#FFFFFF",
padding:15,
borderRadius:10,
width:180,
elevation:5
},

menuItem:{
paddingVertical:10
},

menuText:{
fontSize:16
},

badge:{
position:"absolute",
right:-6,
top:-3,
backgroundColor:"red",
borderRadius:10,
width:18,
height:18,
justifyContent:"center",
alignItems:"center"
},

badgeText:{
color:"white",
fontSize:10,
fontWeight:"bold"
}

});