import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder
import joblib
from sqlalchemy import create_engine

# Configuration de la base de données PostgreSQL
DB_URL = "postgresql://omar:omar@localhost:5432/pfe"

def train():
    print("=========================================================")
    print("Demarrage de l'entrainement des modeles de duree (IA)")
    print("=========================================================\n")
    
    # 1. Lecture des données réelles de la base (Tickets avec durée calculée)
    data_db = pd.DataFrame()
    try:
        engine = create_engine(DB_URL)
        query = "SELECT type_panne, type_executeur, duree FROM ticket_panne WHERE duree IS NOT NULL"
        data_db = pd.read_sql(query, engine)
        print(f"OK: {len(data_db)} historiques reels recuperes depuis la base.")
    except Exception as e:
        print(f"Erreur lecture base (pas encore de durees reelles ou base non accessible).")

    # 2. Lecture du dataset CSV (Fallback / Valeurs types)
    try:
        data_csv = pd.read_csv("dataset_duree.csv")
        print(f"OK: {len(data_csv)} exemples charges depuis 'dataset_duree.csv'.")
    except Exception as e:
        print(f"Erreur lecture CSV: {e}")
        data_csv = pd.DataFrame()

    # 3. Fusion des données
    data = pd.concat([data_db, data_csv], ignore_index=True)
    
    if data.empty:
        print("Erreur: Aucune donnee disponible pour l'entrainement.")
        return

    # Nettoyage
    data['type_panne'] = data['type_panne'].astype(str).str.strip().str.lower()
    data['type_executeur'] = data['type_executeur'].astype(str).str.strip().str.lower()

    print(f"Dataset total pret pour l'entrainement : {len(data)} lignes.\n")

    # 4. Encodage des labels
    le_panne = LabelEncoder()
    le_exec = LabelEncoder()

    data['type_panne_enc'] = le_panne.fit_transform(data['type_panne'])
    data['type_executeur_enc'] = le_exec.fit_transform(data['type_executeur'])

    X = data[['type_panne_enc', 'type_executeur_enc']]
    y = data['duree']

    # 5. Séparation des données (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 6. Définition des 4 modèles à tester
    models = {
        "Random Forest": RandomForestRegressor(n_estimators=200, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=200, random_state=42),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "Linear Regression": LinearRegression()
    }

    best_model_name = ""
    best_model = None
    best_r2 = -float('inf')

    print(f"{'Modèle':<20} | {'R² Score':<10} | {'MAE':<10} | {'MSE':<10}")
    print("-" * 57)

    # 7. Entraînement et Évaluation de chaque modèle
    for name, model in models.items():
        # Entraînement
        model.fit(X_train, y_train)
        
        # Prédictions sur l'ensemble de test
        predictions = model.predict(X_test)
        
        # Calcul des métriques
        r2 = r2_score(y_test, predictions)
        mae = mean_absolute_error(y_test, predictions)
        mse = mean_squared_error(y_test, predictions)
        
        print(f"{name:<20} | {r2:10.4f} | {mae:10.4f} | {mse:10.4f}")

        # Sélection du meilleur modèle basé sur le score R² (le plus proche de 1)
        if r2 > best_r2:
            best_r2 = r2
            best_model = model
            best_model_name = name

    print("-" * 57)
    print(f"\nLe meilleur modele selectionne est : **{best_model_name}** (R2 = {best_r2:.4f})")

    # 8. Sauvegarde du meilleur modèle et des encodeurs
    joblib.dump(best_model, "model_duree.pkl")
    joblib.dump(le_panne, "le_panne_duree.pkl")
    joblib.dump(le_exec, "le_exec_duree.pkl")

    print(f"Le modele '{best_model_name}' a ete sauvegarde avec succes dans 'model_duree.pkl' !")

if __name__ == "__main__":
    train()
