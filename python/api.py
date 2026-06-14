from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app) # Autoriser les requêtes Cross-Origin (Web)



import os
script_dir = os.path.dirname(os.path.abspath(__file__))

# Charger le modèle ML Régression (Durée)
import threading

model_duree = None
le_panne_duree = None
le_exec_duree = None
has_duree_model = False

def init_duree_model():
    global model_duree, le_panne_duree, le_exec_duree, has_duree_model
    try:
        model_duree = joblib.load(os.path.join(script_dir, "model_duree.pkl"))
        le_panne_duree = joblib.load(os.path.join(script_dir, "le_panne_duree.pkl"))
        le_exec_duree = joblib.load(os.path.join(script_dir, "le_exec_duree.pkl"))
        has_duree_model = True
        print("[OK] Modele de duree charge avec succes.")
    except Exception as e:
        print(f"[WARNING] Modele de duree non trouve ou incompatible : {e}. Tentative d'entrainement automatique en arriere-plan...")
        
        def background_train():
            global model_duree, le_panne_duree, le_exec_duree, has_duree_model
            try:
                # Importer le script d'entraînement pour entraîner localement
                from train_model_duree import train
                train()
                # Re-charger le modèle nouvellement entraîné
                import os
                script_dir = os.path.dirname(os.path.abspath(__file__))
                model_duree = joblib.load(os.path.join(script_dir, "model_duree.pkl"))
                le_panne_duree = joblib.load(os.path.join(script_dir, "le_panne_duree.pkl"))
                le_exec_duree = joblib.load(os.path.join(script_dir, "le_exec_duree.pkl"))
                has_duree_model = True
                print("[OK] Modele de duree entraine et charge en arriere-plan avec succes !")
            except Exception as train_err:
                import traceback
                print(f"[ERROR] Impossible d'entrainer le modele de duree : {train_err}")
                traceback.print_exc()
        
        # Démarrer l'entraînement dans un thread séparé pour ne pas bloquer Flask
        t = threading.Thread(target=background_train)
        t.daemon = True
        t.start()

init_duree_model()

# Charger le modèle Computer Vision
try:
    import os
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # Désactiver logs inutiles

    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.image import img_to_array
    from PIL import Image
    import io
    import base64
    import numpy as np
    import pickle
    import os

    # --- PATCH RADICAL POUR RENDRE L'IA ROBUSTE (RÈGLE LES ERREURS RENORM ET QUANTIZATION) ---
    def patch_layer(layer_class, params_to_remove):
        original_init = layer_class.__init__
        def safe_init(self, **kwargs):
            for p in params_to_remove:
                kwargs.pop(p, None)
            return original_init(self, **kwargs)
        layer_class.__init__ = safe_init

    patch_layer(tf.keras.layers.BatchNormalization, ['renorm', 'renorm_clipping', 'renorm_momentum', 'synchronized'])
    patch_layer(tf.keras.layers.Dense, ['quantization_config'])
    patch_layer(tf.keras.layers.Conv2D, ['quantization_config', 'groups'])

    print("IA : Tentative de chargement du modèle .keras avec Patch Global...")
    try:
        model_cv = load_model(os.path.join(script_dir, "modele_panne_cv.keras"), compile=False)
        print("IA : [OK] MODELE CHARGE AVEC SUCCES")
    except Exception as e:
        print(f"IA : [ERROR] ERREUR CRITIQUE CHARGEMENT : {str(e)}")
        model_cv = None
    
    try:
        with open(os.path.join(script_dir, "labels_cv.pkl"), "rb") as f:
            labels_cv = pickle.load(f)
        print("IA : [OK] LABELS CHARGES")
    except Exception as e:
        print(f"IA : [ERROR] ERREUR CHARGEMENT LABELS : {str(e)}")
        labels_cv = None
        
    has_cv_model = True
    print("[OK] Modele Computer Vision charge avec succes (mode optimise).")
except Exception as e:
    import traceback
    print(f"[ERROR] ERREUR CRITIQUE CHARGEMENT IA : {str(e)}")
    traceback.print_exc()
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

        # MAPPING : Traduire les labels Kaggle vers vos types d'arrêts de l'enum TypePanne
        mapping_kaggle = {
            "Scratches": "mecanique",
            "Pitted Surface": "mecanique",
            "Crazing": "mecanique",
            "Inclusion": "defaut_fabrication",
            "Patches": "defaut_fabrication",
            "Rolled-in Scale": "probleme_process"
        }

        # Utiliser le mapping si possible, sinon garder le label d'origine
        final_panne = mapping_kaggle.get(predicted_class, predicted_class)

        return jsonify({
            'type_panne': final_panne,
            'label_origine': predicted_class,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    # Désactiver le mode debug en production sur Render pour économiser la RAM
    is_prod = os.environ.get("RENDER") is not None
    app.run(host='0.0.0.0', port=port, debug=not is_prod)