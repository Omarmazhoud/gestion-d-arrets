import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
from sqlalchemy import create_engine

# Configuration de la base de données PostgreSQL
DB_URL = "postgresql://omar:omar@localhost:5432/pfe"

def train():
    print("⏳ Démarrage de l'entraînement du modèle de durée (Régression)...")
    
    # 1. Lecture des données réelles de la base (Tickets avec durée calculée)
    data_db = pd.DataFrame()
    try:
        engine = create_engine(DB_URL)
        query = "SELECT type_panne, type_executeur, duree FROM ticket_panne WHERE duree IS NOT NULL"
        data_db = pd.read_sql(query, engine)
        print(f"✅ {len(data_db)} historiques réels récupérés.")
    except Exception as e:
        print(f"⚠️ Erreur lecture base (pas encore de durées réelles): {e}")

    # 2. Lecture du dataset CSV (Fallback / Valeurs types)
    data_csv = pd.read_csv("dataset_duree.csv")
    print(f"📁 {len(data_csv)} exemples chargés depuis le CSV.")

    # 3. Fusion des données
    # Le modèle apprend à prédire la durée à partir de la panne et de l'exécuteur
    data = pd.concat([data_db, data_csv], ignore_index=True)
    
    # Nettoyage
    data['type_panne'] = data['type_panne'].astype(str).str.strip().str.lower()
    data['type_executeur'] = data['type_executeur'].astype(str).str.strip().str.lower()

    # 4. Encodage des labels
    le_panne = LabelEncoder()
    le_exec = LabelEncoder()

    data['type_panne_enc'] = le_panne.fit_transform(data['type_panne'])
    data['type_executeur_enc'] = le_exec.fit_transform(data['type_executeur'])

    # 5. Entraînement du modèle RandomForestRegressor
    X = data[['type_panne_enc', 'type_executeur_enc']]
    y = data['duree']

    # On utilise un régresseur pour prédire une valeur continue (temps)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X, y)

    # 6. Sauvegarde des fichiers .pkl
    joblib.dump(model, "model_duree.pkl")
    joblib.dump(le_panne, "le_panne_duree.pkl")
    joblib.dump(le_exec, "le_exec_duree.pkl")

    print("✨ Modèle Durée (Régression) entraîné et sauvegardé avec succès !")

if __name__ == "__main__":
    train()
