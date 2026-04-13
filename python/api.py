from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)



# Charger le modèle ML Régression (Durée)
try:
    model_duree = joblib.load("model_duree.pkl")
    le_panne_duree = joblib.load("le_panne_duree.pkl")
    le_exec_duree = joblib.load("le_exec_duree.pkl")
    has_duree_model = True
except:
    print("⚠️ Modèle de durée non trouvé. Il sera disponible après le premier entraînement.")
    has_duree_model = False

# Charger le modèle Computer Vision
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.image import img_to_array
    from PIL import Image
    import io
    import base64
    import numpy as np

    model_cv = load_model("modele_panne_cv.h5")
    with open("labels_cv.pkl", "rb") as f:
        import pickle
        labels_cv = pickle.load(f)
    has_cv_model = True
    print("✅ Modèle Computer Vision chargé avec succès.")
except Exception as e:
    print(f"⚠️ Modèle Computer Vision ou TensorFlow non trouvé : {e}")
    has_cv_model = False

# API prédiction exécuteur
@app.route('/predict-executeur', methods=['POST'])
def predict_executeur():
    data = request.json
    type_poste = data.get('type_poste', 'autre').lower()
    type_panne = data.get('type_panne', 'autre').lower()

    def get_estimated_duration(p, e):
        if not has_duree_model: return 1.0
        try:
            p_enc = le_panne_duree.transform([p])[0]
            e_enc = le_exec_duree.transform([e])[0]
            pred = model_duree.predict([[p_enc, e_enc]])
            return round(float(pred[0]), 2)
        except: return 1.0

    # -----------------------------
    # 1. Règles métier (priorité)
    # -----------------------------
    maintenance = [
        "electrique","mecanique","hydraulique","pneumatique",
        "moteur","capteur","courroie","roulement","surchauffe","vibration"
    ]

    informatique = [
        "reseau","internet","wifi","logiciel","systeme",
        "base_de_donnees","materiel_informatique","imprimante","scanner","securite"
    ]

    qualite = [
        "produit_non_conforme","defaut_fabrication","probleme_controle",
        "non_conformite","audit_qualite","test_qualite"
    ]

    logistique = [
        "probleme_stock","rupture_stock","livraison_retard",
        "erreur_livraison","transport","reception"
    ]

    process = [
        "arret_production","ralentissement_production","probleme_process",
        "mauvaise_configuration","optimisation_process","procedure"
    ]

    batiment = [
        "eclairage","climatisation","chauffage","plomberie",
        "porte","fenetre","electricite_batiment","fuite_eau"
    ]

    # Vérifier règles
    final_exec = None
    comm = ""

    if type_panne in maintenance:
        final_exec = 'maintenance'
        comm = f"Règle métier : La panne '{type_panne}' nécessite l'intervention de la Maintenance."
    elif type_panne in informatique:
        final_exec = 'informatique'
        comm = f"Règle métier : La panne '{type_panne}' nécessite l'intervention du service Informatique."
    elif type_panne in qualite:
        final_exec = 'qualite'
        comm = f"Règle métier : La panne '{type_panne}' fait appel au service Qualité."
    elif type_panne in logistique:
        final_exec = 'logistique'
        comm = f"Règle métier : La panne '{type_panne}' relève de la Logistique."
    elif type_panne in process:
        final_exec = 'process'
        comm = f"Règle métier : La panne '{type_panne}' est destinée à l'équipe Process."
    elif type_panne in batiment:
        final_exec = 'batiment'
        comm = f"Règle métier : La panne '{type_panne}' concerne les infrastructures (Bâtiment)."

    if final_exec:
        return jsonify({
            'type_executeur': final_exec,
            'commentaire_ia': comm,
            'duree_estimee': get_estimated_duration(type_panne, final_exec)
        })

    # -----------------------------
    # 2. Fallback (si non reconnu)
    # -----------------------------
    return jsonify({
        'type_executeur': 'autre',
        'commentaire_ia': "Fallback : Catégorie de panne non reconnue par les règles métier.",
        'duree_estimee': get_estimated_duration(type_panne, 'autre')
    })

# API analyse d'image
@app.route('/predict-panne-image', methods=['POST'])
def predict_panne_image():
    if not has_cv_model:
        return jsonify({'error': 'Le modèle de Computer Vision n\'est pas encore entraîné ou disponible.'}), 503

    try:
        data = request.json
        image_data = data.get('image', None)
        if not image_data:
            return jsonify({'error': 'Aucune image fournie'}), 400

        # Décoder le base64 (retirer le préfixe "data:image/jpeg;base64," si présent)
        if "," in image_data:
            image_data = image_data.split(",")[1]
            
        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = img.resize((224, 224))
        
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model_cv.predict(img_array)[0]
        max_index = np.argmax(predictions)
        confidence = float(predictions[max_index])

        # Seuil de confiance demandé par l'utilisateur
        if confidence < 0.95:
            return jsonify({
                'type_panne': 'Image non reconnue',
                'confidence': confidence
            })

        predicted_class = labels_cv[max_index]
        return jsonify({
            'type_panne': predicted_class,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Lancer serveur
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)