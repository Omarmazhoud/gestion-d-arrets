import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BASE_URL } from "@/constants/api";

export default function InterventionExecuteur() {

  const { id, executeurId } = useLocalSearchParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // type travail
  const [typeTravail, setTypeTravail] = useState({
    MCP: false,
    MNP: false,
    AUT: false
  });

  // codes défaut (liste fixe)
  const codeWhatList = ["Mécanique", "Électrique", "Pneumatique", "Hydraulique", "Logiciel"];
  const codeWhyList = ["Cassure", "Usure", "Blocage", "Desserrage", "Mauvais réglage"];
  const codeWhereList = ["Machine", "Carte électronique", "Capteur", "Moteur", "Armoire"];

  const [codeWhat, setCodeWhat] = useState("");
  const [codeWhy, setCodeWhy] = useState("");
  const [codeWhere, setCodeWhere] = useState("");

  const [form, setForm] = useState({
    descriptionTravaux: "",
    intervenant: "",
    matriculeIntervenant: "",
    pieceRechange: "",
    referencePiece: "",
    quantite: "",
    tempsArret: "",
    tempsAttentePiece: "",
    observation: ""
  });

  const [imageIntervention, setImageIntervention] = useState<string | null>(null);
  const [scanningQr, setScanningQr] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    fetchTicket();
    if (executeurId) {
      axios.get(`${BASE_URL}/utilisateurs/${executeurId}`)
        .then(res => {
          setUserProfile(res.data);
          setForm(prev => ({
            ...prev,
            intervenant: res.data.nom,
            matriculeIntervenant: res.data.matricule
          }));
        })
        .catch(err => console.log(err));
    }
  }, []);

  const fetchTicket = () => {
    axios.get(`${BASE_URL}/tickets/${id}`)
      .then(res => {
        setTicket(res.data);
        if (res.data.dateArret && res.data.heureArret) {
          calculateTempsArret(res.data.dateArret, res.data.heureArret);
        }
      })
      .catch(err => console.log(err));
  };

  const calculateTempsArret = (dateStr: string, heureStr: string) => {
    try {
      const start = new Date(`${dateStr}T${heureStr}:00`);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      if (diffMs > 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setForm(prev => ({ ...prev, tempsArret: `${diffHrs}h ${diffMins}m` }));
      }
    } catch (e) {
      console.log("Erreur calcul temps arrêt", e);
    }
  };

  const startQrScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert("Permission", "Permission d'utiliser la caméra requise pour scanner un code barre.");
        return;
      }
    }
    setScanningQr(true);
  };

  const handleBarcodeScanned = ({ type, data }: any) => {
    setScanningQr(false);
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'piece' && parsedData.nom && parsedData.reference) {
        setForm(prev => ({ 
          ...prev, 
          pieceRechange: parsedData.nom, 
          referencePiece: parsedData.reference 
        }));
        Alert.alert("Succès", `Pièce ${parsedData.nom} (${parsedData.reference}) ajoutée avec succès !`);
      } else {
        Alert.alert("Erreur", "Format de code QR non reconnu pour une pièce de rechange.");
      }
    } catch (e) {
      Alert.alert("Erreur", "Veuillez scanner un QR Code valide généré par le système.");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Désolé, nous avons besoin des permissions pour accéder à votre galerie.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImageIntervention(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Désolé, nous avons besoin des permissions pour accéder à votre appareil photo.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImageIntervention(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const prendreEnCharge = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/tickets/${id}/prendre/${executeurId}`);
      setTicket(res.data);
      Alert.alert("Succès", "Ticket pris en charge. Vous pouvez maintenant remplir les détails de l'intervention.");
    } catch (error: any) {
      console.log(error);
      const msg = error.response?.data?.message || "Erreur lors de la prise en charge";
      Alert.alert("Erreur", msg);
    }
  };

  const envoyerVerification = async () => {
    Alert.alert(
      "Vérification",
      "Envoyer au service qualité ?",
      [
        {
          text: "NON",
          onPress: () => submitVerification(false)
        },
        {
          text: "OUI",
          onPress: () => submitVerification(true)
        }
      ]
    );
  };

  const submitVerification = async (envoyerQualite: boolean) => {
    try {
      // Un seul appel consolidé pour tout faire
      await axios.put(`${BASE_URL}/tickets/${id}/terminer?envoyerQualite=${envoyerQualite}`, {
        commentaireIntervention: form.descriptionTravaux,
        referencePiece: form.referencePiece,
        imageIntervention: imageIntervention,
      });

      Alert.alert("Succès", "Intervention envoyée pour vérification.");
      router.push("/executeur");

    } catch (error: any) {
      console.log("Erreur soumission:", error);
      if (error.response) {
        console.log("Data:", error.response.data);
        console.log("Status:", error.response.status);
      }
      const errorMsg = error.response?.data?.message || error.message || "Erreur lors de l'envoi";
      Alert.alert("Erreur", `Détail : ${errorMsg}`);
    }
  };

  if (!ticket) return <Text>Chargement...</Text>;

  const showTakeoverButton = 
    ticket.statut === "OUVERTE" || 
    ticket.statut === "REFUSE_QUALITE" || 
    ticket.statut === "REOUVERTE";

  const isAssignedToMe = ticket.executeur?.id === executeurId;
  const canEditIntervention = ticket.statut === "EN_COURS" && isAssignedToMe;

  return (
    <View style={{ flex: 1 }}>
      {scanningQr ? (
        <View style={{ flex: 1 }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
            <TouchableOpacity 
              style={{ backgroundColor: 'red', padding: 15, borderRadius: 12 }}
              onPress={() => setScanningQr(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
    <ScrollView style={styles.container}>

      {/* INFO DEMANDEUR */}
      <View style={styles.section}>
        <Text style={styles.title}>Informations Demandeur</Text>

        <Text style={styles.infoLabel}>Nom: <Text style={styles.infoValue}>{ticket.nomPrenom}</Text></Text>
        <Text style={styles.infoLabel}>Matricule: <Text style={styles.infoValue}>{ticket.matricule}</Text></Text>
        <Text style={styles.infoLabel}>Segment: <Text style={styles.infoValue}>{ticket.segment || "N/A"}</Text></Text>
        <Text style={styles.infoLabel}>Equipement: <Text style={styles.infoValue}>{ticket.equipement || ticket.machine?.nom || "N/A"}</Text></Text>
        <Text style={styles.infoLabel}>Date Arrêt: <Text style={styles.infoValue}>{ticket.dateArret || "N/A"}</Text></Text>
        <Text style={styles.infoLabel}>Heure Arrêt: <Text style={styles.infoValue}>{ticket.heureArret || "N/A"}</Text></Text>
        <Text style={styles.infoLabel}>Type Poste: <Text style={styles.infoValue}>{ticket.typePoste || "N/A"}</Text></Text>
        <Text style={styles.infoLabel}>Secteur: <Text style={styles.infoValue}>{ticket.secteurType || "N/A"}</Text></Text>
        <Text style={styles.infoLabel}>Description panne: <Text style={styles.infoValue}>{ticket.descriptionPanne || ticket.description}</Text></Text>

        {/* IA SUGGESTION */}
        {ticket.commentaireIa && (
          <View style={styles.iaContainer}>
            <View style={styles.iaHeader}>
              <Ionicons name="hardware-chip-outline" size={20} color="#0284c7" />
              <Text style={styles.iaTitle}> Analyse de l'IA</Text>
              {ticket.dureeEstimee && (
                 <View style={styles.durationBadge}>
                   <Ionicons name="time-outline" size={14} color="#fff" />
                   <Text style={styles.durationText}> {ticket.dureeEstimee}h</Text>
                 </View>
              )}
            </View>
            <Text style={styles.iaText}>« {ticket.commentaireIa} »</Text>
          </View>
        )}

        {ticket.imagePanne && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.title}>Photo de la panne</Text>
            <Image 
              source={{ uri: ticket.imagePanne }} 
              style={styles.imageDisplay} 
              resizeMode="contain" 
            />
          </View>
        )}
      </View>

      {/* BOUTON PRENDRE EN CHARGE */}
      {showTakeoverButton && (
        <View style={styles.takeoverContainer}>
           <Text style={styles.warningText}>Vous devez prendre en charge ce ticket avant de commencer l'intervention.</Text>
           <TouchableOpacity style={styles.takeoverButton} onPress={prendreEnCharge}>
             <Ionicons name="play" size={24} color="#fff" style={{marginRight: 10}} />
             <Text style={styles.buttonText}>PRENDRE EN CHARGE</Text>
           </TouchableOpacity>
        </View>
      )}

      {(ticket.statut === "REFUSE_QUALITE" || ticket.statut === "REOUVERTE") && (
        <View style={styles.refusalContainer}>
          <Text style={styles.refusalTitle}>Ticket Refusé</Text>
          <Text style={styles.refusalMessage}>
            Motif : {ticket.commentaireVerification || "Pas de motif spécifié"}
          </Text>
        </View>
      )}

      {/* FORMULAIRE D'INTERVENTION (Uniquement si EN_COURS) */}
      {canEditIntervention ? (
        <View style={styles.formContainer}>
          <Text style={styles.headerTitle}>DÉTAILS DE L'INTERVENTION</Text>

          {/* DESCRIPTION TRAVAUX */}
          <Text style={styles.title}>Description des travaux</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Décrivez les travaux effectués..."
            onChangeText={(text) => setForm({ ...form, descriptionTravaux: text })}
          />

          {/* TYPE TRAVAIL */}
          <Text style={styles.title}>Type de travail</Text>
          <View style={styles.checkboxRow}>
            {Object.keys(typeTravail).map((key) => (
              <View style={styles.checkboxItem} key={key}>
                <Checkbox
                  value={typeTravail[key as keyof typeof typeTravail]}
                  onValueChange={(value: boolean) =>
                    setTypeTravail({ ...typeTravail, [key]: value })
                  }
                />
                <Text style={styles.label}>{key}</Text>
              </View>
            ))}
          </View>

          {/* CODES DÉFAUTS */}
          <View style={styles.defectSection}>
            <Text style={styles.title}>Code défaut (What)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {codeWhatList.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.chip, codeWhat === item && styles.chipSelected]}
                  onPress={() => setCodeWhat(item)}
                >
                  <Text style={[styles.chipText, codeWhat === item && styles.chipTextSelected]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.title}>Code défaut (Why)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {codeWhyList.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.chip, codeWhy === item && styles.chipSelected]}
                  onPress={() => setCodeWhy(item)}
                >
                  <Text style={[styles.chipText, codeWhy === item && styles.chipTextSelected]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.title}>Code défaut (Where)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {codeWhereList.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.chip, codeWhere === item && styles.chipSelected]}
                  onPress={() => setCodeWhere(item)}
                >
                  <Text style={[styles.chipText, codeWhere === item && styles.chipTextSelected]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* INTERVENANT INFO (READ ONLY) */}
          <Text style={styles.title}>Intervention</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 5, backgroundColor: "#f0f0f0" }]}
              value={form.intervenant}
              editable={false}
              placeholder="Intervenant"
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 5, backgroundColor: "#f0f0f0" }]}
              value={form.matriculeIntervenant}
              editable={false}
              placeholder="Matricule"
            />
          </View>

          {/* PIECES ET PHOTOS */}
          <View style={styles.photoSection}>
            <Text style={styles.title}>Pièces et Photos</Text>
            <View style={styles.photoButtons}>
              <TouchableOpacity onPress={takePhoto} style={styles.iconButton}>
                <Ionicons name="camera" size={32} color={imageIntervention ? "green" : "#005A9C"} />
                <Text style={{fontSize: 12, color: imageIntervention ? "green" : "#005A9C"}}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                <Ionicons name="image" size={32} color={imageIntervention ? "green" : "#005A9C"} />
                <Text style={{fontSize: 12, color: imageIntervention ? "green" : "#005A9C"}}>Galerie</Text>
              </TouchableOpacity>

              {imageIntervention && (
                <View style={styles.photoCheck}>
                  <Ionicons name="checkmark-circle" size={24} color="green" />
                  <Text style={{color: "green", fontSize: 12}}>Photo OK</Text>
                </View>
              )}
            </View>

            {imageIntervention && (
              <View style={{ marginTop: 15, alignItems: "center" }}>
                <Image 
                  source={{ uri: imageIntervention }} 
                  style={{ width: "100%", height: 200, borderRadius: 12 }} 
                  resizeMode="cover" 
                />
                <TouchableOpacity onPress={() => setImageIntervention(null)} style={{marginTop: 5}}>
                  <Text style={{color: "red", fontWeight: "bold"}}>Supprimer la photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#10b981', marginTop: 15, marginBottom: 15, padding: 12 }]} 
            onPress={startQrScan}
          >
            <Text style={styles.buttonText}>📷 SCANNER QR CODE PIÈCE</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Pièce de rechange (Nom)"
            value={form.pieceRechange}
            onChangeText={(text) => setForm({ ...form, pieceRechange: text })}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 2, marginRight: 5 }]}
              placeholder="Référence Pièce"
              value={form.referencePiece}
              onChangeText={(text) => setForm({ ...form, referencePiece: text })}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Qté"
              keyboardType="numeric"
              value={form.quantite}
              onChangeText={(text) => setForm({ ...form, quantite: text })}
            />
          </View>

          {/* TEMPS */}
          <Text style={styles.title}>Temps</Text>
          <TextInput
            style={styles.input}
            placeholder="Temps attente pièces (ex: 15m)"
            value={form.tempsAttentePiece}
            onChangeText={(text) => setForm({ ...form, tempsAttentePiece: text })}
          />

          {/* OBSERVATION */}
          <Text style={styles.title}>Observation</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Remarques éventuelles..."
            value={form.observation}
            onChangeText={(text) => setForm({ ...form, observation: text })}
          />

          {/* BOUTON ENVOYER */}
          <TouchableOpacity style={styles.button} onPress={envoyerVerification}>
            <Text style={styles.buttonText}>TERMINER ET ENVOYER</Text>
          </TouchableOpacity>
        </View>
      ) : (
        !showTakeoverButton && (
           <View style={styles.viewOnlyContainer}>
             <Ionicons 
               name={ticket.statut === "EN_COURS" && !isAssignedToMe ? "person-remove-outline" : "lock-closed-outline"} 
               size={40} 
               color="#666" 
             />
             <Text style={styles.viewOnlyText}>
               {ticket.statut === "EN_COURS" && !isAssignedToMe
                 ? `Ce ticket est en cours de traitement par ${ticket.executeur?.nom || 'un autre technicien'}.`
                 : `Statut actuel : ${ticket.statut}. Le formulaire est en lecture seule.`
               }
             </Text>
           </View>
        )
      )}

    </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#F5F7FA" },
  section: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  title: { fontSize: 16, fontWeight: "bold", marginTop: 15, color: "#333", marginBottom: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#005A9C", textAlign: "center", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
    backgroundColor: "#fff"
  },
  row: { flexDirection: "row", alignItems: "center" },
  checkboxRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10
  },
  label: { marginLeft: 8, color: "#444" },
  button: {
    backgroundColor: "#28A745",
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
    marginBottom: 50,
    elevation: 8
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  imageDisplay: { width: "100%", height: 200, borderRadius: 12, marginTop: 10 },
  refusalContainer: {
    backgroundColor: "#FFEBEB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFCDD2"
  },
  refusalTitle: { color: "#D32F2F", fontWeight: "bold", marginBottom: 5 },
  refusalMessage: { color: "#333" },
  takeoverContainer: { padding: 20, alignItems: "center", backgroundColor: "#E3F2FD", borderRadius: 12, marginBottom: 20 },
  takeoverButton: { backgroundColor: "#005A9C", padding: 18, borderRadius: 12, width: "100%", alignItems: "center", flexDirection: "row", justifyContent: "center" },
  warningText: { textAlign: "center", color: "#0D47A1", marginBottom: 15, fontWeight: "500" },
  formContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 30, elevation: 2 },
  infoLabel: { color: "#666", fontSize: 14, marginBottom: 3 },
  infoValue: { color: "#333", fontWeight: "600" },
  horizontalScroll: { marginTop: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F0F0F0", marginRight: 8, borderWidth: 1, borderColor: "#E0E0E0" },
  chipSelected: { backgroundColor: "#005A9C", borderColor: "#005A9C" },
  chipText: { color: "#666" },
  chipTextSelected: { color: "#fff", fontWeight: "bold" },
  defectSection: { marginBottom: 10 },
  photoSection: { marginTop: 15 },
  photoButtons: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  iconButton: { alignItems: "center", marginRight: 25 },
  photoCheck: { alignItems: "center" },
  viewOnlyContainer: { padding: 40, alignItems: "center", justifyContent: "center" },
  viewOnlyText: { textAlign: "center", color: "#666", marginTop: 15, fontSize: 16 },
  iaContainer: {
    marginTop: 15,
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd"
  },
  iaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  iaTitle: { color: "#0284c7", fontWeight: "bold", fontSize: 14, flex: 1 },
  iaText: { color: "#0c4a6e", fontStyle: "italic", fontSize: 13 },
  durationBadge: {
    backgroundColor: "#0ea5e9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  durationText: { color: "#fff", fontSize: 12, fontWeight: "bold" }
});