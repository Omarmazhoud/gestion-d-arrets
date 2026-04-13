import os
import pickle
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model

# Dossier d'entrée (à créer et remplir par l'utilisateur)
DATASET_DIR = "dataset_images"
MODEL_PATH = "modele_panne_cv.h5"
LABELS_PATH = "labels_cv.pkl"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 10

def main():
    print("⏳ Démarrage de l'entraînement du modèle Computer Vision...")
    
    # Vérification du dataset
    if not os.path.exists(DATASET_DIR) or len(os.listdir(DATASET_DIR)) == 0:
        print(f"❌ ERREUR: Le dossier '{DATASET_DIR}' est introuvable ou vide.")
        print(f"Veuillez créer '{DATASET_DIR}' et y placer des sous-dossiers par type de panne (ex: mecanique/, electrique/).")
        return

    # Data Augmentation pour éviter le sous-apprentissage sur de petits datasets
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2 # 20% pour la validation
    )

    print("📁 Chargement des images d'entraînement...")
    train_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    print("📁 Chargement des images de validation...")
    val_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    classes = train_generator.class_indices
    labels = {v: k for k, v in classes.items()}

    # Sauvegarder les labels
    with open(LABELS_PATH, "wb") as f:
        pickle.dump(labels, f)
    print(f"✅ Labels sauvegardés ({len(labels)} classes detectées : {labels})")

    # Modèle de Transfer Learning (MobileNetV2, léger et performant)
    print("Création de l'architecture du réseau de neurones...")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Figer les poids de MobileNet (on n'entraîne que notre propre classifieur final)
    for layer in base_model.layers:
        layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(len(labels), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    print("🚀 Début de l'entraînement...")
    model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator
    )

    # Sauvegarder le modèle
    model.save(MODEL_PATH)
    print(f" Modèle validé et sauvegardé avec succès dans '{MODEL_PATH}' !")

if __name__ == "__main__":
    main()
