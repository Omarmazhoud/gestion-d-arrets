import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "@/constants/api";

type Message = {
  id: string;
  expediteur: { id: string; nom: string; prenom: string };
  contenu: string;
  image?: string;
  dateEnvoi: string;
};

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/messages/groupe`);
      setMessages(res.data);
    } catch (e) {
      console.log("Erreur fetch messages:", e);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !imageBase64) return;
    try {
      const textToSent = inputText;
      const imgToSent = imageBase64;
      setInputText("");
      setImageBase64(null);
      await axios.post(`${BASE_URL}/messages/envoyer`, {
        expediteurId: userId,
        contenu: textToSent,
        image: imgToSent
      });
      fetchMessages();
    } catch (e) {
      console.log("Erreur send message:", e);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Str = "data:image/jpeg;base64," + result.assets[0].base64;
      setImageBase64(base64Str);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert("La permission d'accéder à l'appareil photo est requise.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Str = "data:image/jpeg;base64," + result.assets[0].base64;
      setImageBase64(base64Str);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.expediteur?.id === userId;
          return (
            <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther]}>
              {!isMe && <Text style={styles.senderName}>{item.expediteur?.nom}</Text>}
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                {!!item.image && (
                  <Image 
                    source={{ uri: item.image }} 
                    style={{ width: 150, height: 150, borderRadius: 12, marginBottom: item.contenu ? 5 : 0 }} 
                    resizeMode="cover"
                  />
                )}
                {!!item.contenu && (
                  <Text style={{ color: isMe ? "white" : "black", fontSize: 16 }}>{item.contenu}</Text>
                )}
              </View>
              <Text style={styles.timeText}>
                {new Date(item.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      {imageBase64 && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageBase64 }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setImageBase64(null)} style={styles.previewClose}>
            <Ionicons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() && !imageBase64) ? { backgroundColor: "#9CA3AF" } : {}]} 
          onPress={handleSend}
          disabled={!inputText.trim() && !imageBase64}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  msgContainer: { marginVertical: 5, maxWidth: "80%" },
  msgMe: { alignSelf: "flex-end" },
  msgOther: { alignSelf: "flex-start" },
  senderName: { fontSize: 12, color: "gray", marginBottom: 2, marginLeft: 5 },
  bubble: { padding: 12, borderRadius: 16 },
  bubbleMe: { backgroundColor: "#005A9C", borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: "white", borderBottomLeftRadius: 4 },
  timeText: { fontSize: 10, color: "gray", marginTop: 2, alignSelf: "flex-end" },
  inputContainer: { 
    flexDirection: "row", 
    padding: 10, 
    backgroundColor: "white", 
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB"
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8
  },
  input: { 
    flex: 1, 
    backgroundColor: "#F3F4F6", 
    padding: 12, 
    borderRadius: 20, 
    fontSize: 16,
    maxHeight: 100
  },
  sendButton: { 
    backgroundColor: "#005A9C", 
    width: 45, 
    height: 45, 
    borderRadius: 25, 
    justifyContent: "center", 
    alignItems: "center",
    marginLeft: 10
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6'
  },
  previewContainer: {
    padding: 10,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB"
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 12
  },
  previewClose: {
    position: "absolute",
    top: 5,
    left: 60,
    backgroundColor: "white",
    borderRadius: 12
  }
});
