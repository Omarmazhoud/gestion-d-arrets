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
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { BASE_URL } from "@/constants/api";

const TYPE_EXECUTEUR_LIST = [
  "maintenance",
  "informatique",
  "qualite",
  "logistique",
  "process",
  "batiment",
  "production",
  "autre"
];

const TYPE_POSTE_LIST = [
  "MACHINE",
  "matiere",
  
  "qualitee"
];

// SECTEUR_LIST supprimé pour être géré dynamiquement depuis l'API

const TYPE_PANNE_LIST = [
  "electrique", "mecanique", "hydraulique", "pneumatique", "moteur",
  "capteur", "courroie", "roulement", "surchauffe", "vibration",
  "reseau", "internet", "wifi", "logiciel", "systeme",
  "base_de_donnees", "materiel_informatique", "imprimante", "scanner",
  "securite", "produit_non_conforme", "defaut_fabrication",
  "probleme_controle", "non_conformite", "audit_qualite", "test_qualite",
  "probleme_stock", "rupture_stock", "livraison_retard", "erreur_livraison",
  "transport", "reception", "arret_production", "ralentissement_production",
  "probleme_process", "mauvaise_configuration", "optimisation_process",
  "procedure", "eclairage", "climatisation", "chauffage", "plomberie",
  "porte", "fenetre", "electricite_batiment", "fuite_eau", "autre"
];

type Machine = {
  id: string;
  nom: string;
  secteur: string;
  process: string;
  enArret: boolean;
};

export default function CreateTicket() {
  const { userId } = useLocalSearchParams();
  const demandeurId = userId || "1";

  // BON DE TRAVAIL
  const [segment, setSegment] = useState("");
  const [equipement, setEquipement] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [equipementArret, setEquipementArret] = useState(false);
  const [dateArret, setDateArret] = useState("");
  const [heureArret, setHeureArret] = useState("");
  const [remarque, setRemarque] = useState("");

  // PANNE
  const [typePanne, setTypePanne] = useState("");
  const [description, setDescription] = useState("");

  // TYPE
  const [typePoste, setTypePoste] = useState("");
  const [secteurType, setSecteurType] = useState("");
  const [typeExecuteur, setTypeExecuteur] = useState("");
  const [imagePanne, setImagePanne] = useState<string | null>(null);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineSearch, setMachineSearch] = useState("");
  const [secteursList, setSecteursList] = useState<{id: string, nom: string}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanningQr, setScanningQr] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Fetch Machines
    axios.get(`${BASE_URL}/machines`)
      .then(res => setMachines(res.data))
      .catch(err => console.log(err));

    // Fetch Secteurs
    axios.get(`${BASE_URL}/secteurs`)
      .then(res => setSecteursList(res.data))
      .catch(err => console.log(err));
  }, []);



  const filteredMachines = machines.filter(m =>
    m.nom.toLowerCase().includes(machineSearch.toLowerCase())
  );

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
      if (parsedData.type === 'machine' && parsedData.id) {
        // Find the machine
        const foundMachine = machines.find(m => m.id === parsedData.id);
        if (foundMachine) {
          if (foundMachine.enArret) {
            Alert.alert("Interdit", "Cette machine est déjà signalée en panne (en arrêt). Vous ne pouvez pas créer un autre ticket pour celle-ci.");
            return;
          }
          setSelectedMachine(foundMachine);
          setSecteurType(foundMachine.secteur);
          Alert.alert("Succès", `Machine ${foundMachine.nom} sélectionnée avec succès !`);
        } else {
          Alert.alert("Erreur", "Cette machine n'est pas dans la base ou est introuvable.");
        }
      } else {
        Alert.alert("Erreur", "Format de code QR non reconnu pour une machine.");
      }
    } catch (e) {
      Alert.alert("Erreur", "Veuillez scanner un QR Code valide du système.");
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
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagePanne(base64Img);
      analyzeImageAI(base64Img);
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
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagePanne(base64Img);
      analyzeImageAI(base64Img);
    }
  };

  const analyzeImageAI = async (base64Img: string) => {
    try {
      setIsAnalyzing(true);
      // Extraire l'IP pour interroger Flask (port 5000)
      const PYTHON_API_URL = BASE_URL.replace("8080/api", "5000") + "/predict-panne-image";
      
      const response = await axios.post(PYTHON_API_URL, {
        image: base64Img
      });

      const data = response.data;
      if (data.type_panne && data.type_panne !== "Image non reconnue") {
          setTypePanne(data.type_panne);
          Alert.alert(
            "🤖 Analyse IA Terminée", 
            `L'IA a détecté une panne de type "${data.type_panne}" avec une confiance de ${Math.round(data.confidence * 100)}%.`
          );
      } else {
          Alert.alert("🤔 Analyse IA", "L'IA n'a pas pu reconnaître la panne avec certitude (confiance trop faible). Veuillez sélectionner le type manuellement.");
      }
    } catch (err: any) {
      // Ignorer l'alerte si le modèle n'est pas encore entraîné ou si le serveur python crashe
      console.log("Erreur analyse IA :", err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!typePanne || !description || !typePoste || !typeExecuteur) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires");
      return;
    }

    let autoDate = "";
    let autoHeure = "";

    if (equipementArret) {
      const now = new Date();
      autoDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      autoHeure = now.getHours().toString().padStart(2, '0') + ":" +
        now.getMinutes().toString().padStart(2, '0'); // HH:mm
    }

    const payload = {
      segment: segment || null,
      equipement: equipement || null,
      numeroSerie: numeroSerie || null,
      equipementArret,
      dateArret: (autoDate || dateArret) ? (autoDate || dateArret) : null,
      heureArret: (autoHeure || heureArret) ? (autoHeure || heureArret) : null,
      remarque: remarque || null,
      typePanne,
      description,
      typePoste,
      secteurType:
        typePoste === "MACHINE"
          ? selectedMachine?.secteur || null
          : secteurType || null,
      typeExecuteur,
      imagePanne: imagePanne || null
    };

    try {
      await axios.post(
        `${BASE_URL}/tickets/declarer/${demandeurId}`,
        payload,
        { params: { machineId: selectedMachine?.id || "" } }
      );

      Alert.alert("Succès", "Ticket créé");

    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de créer le ticket");
    }
  };

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
      <Text style={styles.title}>BON DE TRAVAIL</Text>

      {/* SEGMENT */}
      <Text style={styles.label}>Segment / CC</Text>
      <TextInput style={styles.input} value={segment} onChangeText={setSegment} />

      {/* EQUIPEMENT */}
      <Text style={styles.label}>Équipement</Text>
      <TextInput style={styles.input} value={equipement} onChangeText={setEquipement} />

      {/* NUMERO SERIE */}
      <Text style={styles.label}>N° Série / Position</Text>
      <TextInput style={styles.input} value={numeroSerie} onChangeText={setNumeroSerie} />

      {/* ARRET */}
      <Text style={styles.label}>Équipement en arrêt</Text>
      <TouchableOpacity
        style={[styles.selectButton, equipementArret && styles.activeButton]}
        onPress={() => setEquipementArret(!equipementArret)}
      >
        <Text style={{ color: equipementArret ? "white" : "black" }}>
          {equipementArret ? "OUI" : "NON"}
        </Text>
      </TouchableOpacity>

      {/* TYPE PANNE */}
      <Text style={styles.label}>Type de Panne</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {TYPE_PANNE_LIST.map(tp => (
            <TouchableOpacity
              key={tp}
              style={[
                styles.typeButton,
                typePanne === tp && styles.activeTypeButton,
                { paddingHorizontal: 12 }
              ]}
              onPress={() => setTypePanne(tp)}
            >
              <Text style={[styles.typeButtonText, typePanne === tp && styles.activeTypeButtonText]}>
                {tp.replace(/_/g, " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* TYPE POSTE */}
      <Text style={styles.label}>Type Poste</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 15 }}>
        {TYPE_POSTE_LIST.map(tp => (
          <TouchableOpacity
            key={tp}
            style={[styles.typeButton, typePoste === tp && styles.activeTypeButton]}
            onPress={() => {
              setTypePoste(tp);
              setSelectedMachine(null);
              setSecteurType("");
            }}
          >
            <Text style={[styles.typeButtonText, typePoste === tp && styles.activeTypeButtonText]}>
              {tp.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MACHINE SELECTION */}
      {typePoste === "MACHINE" && (
        <View style={styles.machineSection}>
          <Text style={styles.label}>Sélectionnez la Machine</Text>

          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: '#10b981', marginTop: 10, marginBottom: 15, padding: 12 }]} 
            onPress={startQrScan}
          >
            <Text style={styles.submitText}>📷 SCANNER QR CODE MACHINE</Text>
          </TouchableOpacity>

          {selectedMachine ? (
            <View style={styles.selectedMachineCard}>
              <View>
                <Text style={styles.selectedMachineName}>{selectedMachine.nom}</Text>
                <Text style={styles.selectedMachineSub}>Secteur: {selectedMachine.secteur} | Process: {selectedMachine.process}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMachine(null)} style={styles.changeButton}>
                <Text style={{ color: "#005A9C", fontWeight: "bold" }}>Changer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                placeholder="Rechercher une machine (Nom, Position...)"
                style={styles.input}
                value={machineSearch}
                onChangeText={setMachineSearch}
              />

              {machines.length === 0 ? (
                <Text style={styles.infoText}>Chargement des machines ou aucune machine disponible...</Text>
              ) : filteredMachines.length === 0 ? (
                <Text style={styles.infoText}>Aucune machine ne correspond à votre recherche.</Text>
              ) : (
                <ScrollView style={styles.machineList} nestedScrollEnabled={true}>
                  {filteredMachines.map((item: Machine) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.machineItem,
                        item.enArret && { backgroundColor: "#ffebee", borderLeftWidth: 4, borderLeftColor: "#f44336" }
                      ]}
                      onPress={() => {
                        if (item.enArret) {
                          Alert.alert("Machine en panne", "Cette machine est déjà signalée en arrêt dans le système.");
                          return;
                        }
                        setSelectedMachine(item);
                        setSecteurType(item.secteur);
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                          <Text style={[styles.machineItemText, item.enArret && { color: "#c62828", textDecorationLine: "line-through" }]}>{item.nom}</Text>
                          <Text style={styles.machineItemSub}>{item.secteur} - {item.process}</Text>
                        </View>
                        {item.enArret && (
                          <View style={{ backgroundColor: "#f44336", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}>
                            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>EN ARRÊT</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      )}

      {/* SECTEUR */}
      {typePoste !== "" && typePoste !== "MACHINE" && (
        <>
          <Text style={styles.label}>Secteur</Text>
          {secteursList.map(sec => (
            <TouchableOpacity
              key={sec.id || sec.nom}
              style={[styles.selectButton, secteurType === sec.nom && styles.activeButton]}
              onPress={() => setSecteurType(sec.nom)}
            >
              <Text style={{ color: secteurType === sec.nom ? "white" : "black" }}>
                {sec.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}



      <Text style={styles.label}>Type Exécuteur</Text>
      {TYPE_EXECUTEUR_LIST.map(exec => (
        <TouchableOpacity
          key={exec}
          style={[styles.selectButton, typeExecuteur === exec && styles.activeButton]}
          onPress={() => setTypeExecuteur(exec)}
        >
          <Text style={{ color: typeExecuteur === exec ? "white" : "black" }}>
            {exec}
          </Text>
        </TouchableOpacity>
      ))}

      {/* DESCRIPTION */}
      <Text style={styles.label}>Description de la panne</Text>
      <TextInput
        multiline
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
      />

      {/* PHOTO */}
      <Text style={styles.label}>Photo de la panne</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 15 }}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage} disabled={isAnalyzing}>
          <Text style={{ color: "white" }}>Galerie</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={takePhoto} disabled={isAnalyzing}>
          <Text style={{ color: "white" }}>Appareil photo</Text>
        </TouchableOpacity>
      </View>
      
      {isAnalyzing && (
        <Text style={{textAlign: 'center', color: '#005A9C', fontWeight: 'bold', marginBottom: 10}}>
          🤖 L'IA analyse votre photo, veuillez patienter...
        </Text>
      )}

      {imagePanne && (
        <View style={{ alignItems: "center", marginBottom: 15 }}>
          <Image source={{ uri: imagePanne }} style={{ width: "100%", height: 200, borderRadius: 12 }} resizeMode="cover" />
          <TouchableOpacity onPress={() => setImagePanne(null)} style={{marginTop: 5}}>
            <Text style={{color: "red", fontWeight: "bold"}}>Supprimer la photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REMARQUE */}
      <Text style={styles.label}>Remarque</Text>
      <TextInput
        multiline
        style={[styles.input, { height: 80 }]}
        value={remarque}
        onChangeText={setRemarque}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Envoyer</Text>
      </TouchableOpacity>
    </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#005A9C",
    marginBottom: 20,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#005A9C",
    backgroundColor: "#F4F7FB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#005A9C",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10
  },
  activeButton: {
    backgroundColor: "#005A9C"
  },
  machineItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  submitButton: {
    backgroundColor: "#005A9C",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  },
  submitText: {
    color: "white",
    fontWeight: "bold"
  },
  imageButton: {
    backgroundColor: "#005A9C",
    padding: 10,
    borderRadius: 12,
    width: "45%",
    alignItems: "center"
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#005A9C",
    backgroundColor: "white",
  },
  activeTypeButton: {
    backgroundColor: "#005A9C",
  },
  typeButtonText: {
    color: "#005A9C",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeTypeButtonText: {
    color: "white",
  },
  machineSection: {
    marginVertical: 10,
  },
  selectedMachineCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#005A9C",
    marginBottom: 15,
  },
  selectedMachineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#005A9C",
  },
  selectedMachineSub: {
    fontSize: 14,
    color: "#666",
  },
  changeButton: {
    padding: 8,
  },
  infoText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
    fontStyle: "italic",
  },
  machineList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 15,
  },
  machineItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  machineItemSub: {
    fontSize: 12,
    color: "#888",
  },
  selectedMachineItem: {
    backgroundColor: "#F4F7FB",
  },
  checkIcon: {
    fontSize: 18,
  }
});