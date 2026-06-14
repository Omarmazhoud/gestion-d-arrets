import kagglehub
import os
import shutil

# 1. Télécharger le dataset NEU Steel Surface Defects
print("Telechargement du dataset depuis Kaggle...")
path = kagglehub.dataset_download("sovitrath/neu-steel-surface-defect-detect-trainvalid-split")

print("Dataset telecharge dans :", path)

# 2. Préparer le dossier pour l'entraînement (dataset_images)
script_dir = os.path.dirname(os.path.abspath(__file__))
DEST_DIR = os.path.join(script_dir, "dataset_images")
if os.path.exists(DEST_DIR):
    shutil.rmtree(DEST_DIR)
os.makedirs(DEST_DIR)

# Le dataset contient des dossiers 'train_images' et 'valid_images' avec des fichiers préfixés
# On va trier les images dans des sous-dossiers par classe pour ImageDataGenerator
def get_class_name(filename):
    if filename.startswith("rolled-in_scale_"):
        return "Rolled-in Scale"
    elif filename.startswith("pitted_surface_"):
        return "Pitted Surface"
    elif filename.startswith("crazing_"):
        return "Crazing"
    elif filename.startswith("inclusion_"):
        return "Inclusion"
    elif filename.startswith("patches_"):
        return "Patches"
    elif filename.startswith("scratches_"):
        return "Scratches"
    return None

# Dossiers sources
train_images_dir = os.path.join(path, "train_images")
valid_images_dir = os.path.join(path, "valid_images")

copied_count = 0
for source_dir in [train_images_dir, valid_images_dir]:
    if os.path.exists(source_dir):
        print(f"Traitement et copie des images de : {source_dir}...")
        for filename in os.listdir(source_dir):
            if filename.endswith(".jpg") or filename.endswith(".png"):
                class_name = get_class_name(filename)
                if class_name:
                    class_dir = os.path.join(DEST_DIR, class_name)
                    if not os.path.exists(class_dir):
                        os.makedirs(class_dir)
                    src_file = os.path.join(source_dir, filename)
                    dst_file = os.path.join(class_dir, filename)
                    shutil.copy2(src_file, dst_file)
                    copied_count += 1

print(f"Copie terminée. {copied_count} images copiées dans {DEST_DIR} !")
