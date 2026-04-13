import requests
import json

url = "http://localhost:5000/predict-executeur"

payloads = [
    {"type_poste": "MACHINE", "type_panne": "mecanique"},
    {"type_poste": "poste_informatique", "type_panne": "logiciel"},
    {"type_poste": "production", "type_panne": "produit_non_conforme"}
]

for p in payloads:
    try:
        response = requests.post(url, json=p)
        print(f"Payload: {p}")
        print(f"Response: {response.status_code}")
        print(response.json())
        print("-" * 30)
    except Exception as e:
        print(f"Cannot reach Flask: {e}")
