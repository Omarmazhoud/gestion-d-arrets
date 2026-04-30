import kagglehub
import os
import shutil

# 1. Télécharger le dataset NEU Steel Surface Defects
print("⏳ Téléchargement du dataset depuis Kaggle...")
path = kagglehub.dataset_download("sovitrath/neu-steel-surface-defect-detect-trainvalid-split")

print("✅ Dataset téléchargé dans :", path)

# 2. Préparer le dossier pour l'entraînement (dataset_images)
DEST_DIR = "dataset_images"
if os.path.exists(DEST_DIR):
    shutil.rmtree(DEST_DIR)
os.makedirs(DEST_DIR)

# Le dataset téléchargé a une structure 'train' et 'valid'
# On va copier le contenu de 'train' pour l'entraînement local
source_train = os.path.join(path, "train")

if os.path.exists(source_train):
    print(f"📁 Copie des images depuis {source_train} vers {DEST_DIR}...")
    for category in os.listdir(source_train):
        src_cat = os.path.join(source_train, category)
        dst_cat = os.path.join(DEST_DIR, category)
        if os.path.isdir(src_cat):
            shutil.copytree(src_cat, dst_cat)
    print("✅ Données prêtes pour l'entraînement !")
else:
    print("⚠️ Attention : La structure du dataset semble différente. Vérifiez le chemin :", path)
