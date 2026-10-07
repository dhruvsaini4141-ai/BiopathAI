import os
import pandas as pd
from sklearn.model_selection import train_test_split


# ============================================================
# BioPatch AI - ISIC 2019 Dataset Preparation
# ============================================================

RANDOM_STATE = 42

DATASET_DIR = os.path.join("dataset", "ISIC_2019")

CSV_PATH = os.path.join(
    DATASET_DIR,
    "ISIC_2019_Training_GroundTruth.csv"
)

OUTPUT_DIR = os.path.join(
    DATASET_DIR,
    "splits"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================
# Load dataset
# ============================================================

df = pd.read_csv(CSV_PATH)

print("=" * 60)
print("BIOPATCH AI - DATASET PREPARATION")
print("=" * 60)

print(f"\nTotal images: {len(df):,}")


# ============================================================
# Create image paths
# ============================================================

IMAGE_DIR = os.path.join(
    DATASET_DIR,
    "ISIC_2019_Training_Input"
)

df["image_path"] = df["image"].apply(
    lambda x: os.path.join(IMAGE_DIR, str(x) + ".jpg")
)


# ============================================================
# Verify image paths
# ============================================================

print("\nChecking image files...")

missing_images = df[~df["image_path"].map(os.path.isfile)]

print(f"Missing images: {len(missing_images):,}")

if len(missing_images) > 0:
    print("\nERROR: Some images are missing.")
    print(missing_images[["image", "image_path"]].head())
    raise SystemExit(1)

print("All image files found.")


# ============================================================
# MODEL 1
#
# 0 = Non-target lesion
# 1 = Cancer/suspicious
#
# Cancer:
# MEL + BCC + SCC
#
# Non-target:
# NV + AK + BKL + DF + VASC
# ============================================================

cancer_labels = ["MEL", "BCC", "SCC"]

df["model1_label"] = (
    df[cancer_labels].sum(axis=1) > 0
).astype(int)


# ============================================================
# MODEL 1 SPLIT
# ============================================================

model1_train, model1_temp = train_test_split(
    df[
        [
            "image",
            "image_path",
            "model1_label"
        ]
    ],
    test_size=0.20,
    stratify=df["model1_label"],
    random_state=RANDOM_STATE
)

model1_val, model1_test = train_test_split(
    model1_temp,
    test_size=0.50,
    stratify=model1_temp["model1_label"],
    random_state=RANDOM_STATE
)


# ============================================================
# Save Model 1 splits
# ============================================================

model1_train.to_csv(
    os.path.join(OUTPUT_DIR, "model1_train.csv"),
    index=False
)

model1_val.to_csv(
    os.path.join(OUTPUT_DIR, "model1_val.csv"),
    index=False
)

model1_test.to_csv(
    os.path.join(OUTPUT_DIR, "model1_test.csv"),
    index=False
)


# ============================================================
# MODEL 2
#
# Only MEL, BCC and SCC
# ============================================================

model2_df = df[
    df[cancer_labels].sum(axis=1) == 1
].copy()

model2_df["model2_label"] = model2_df[
    cancer_labels
].idxmax(axis=1)


# ============================================================
# MODEL 2 SPLIT
# ============================================================

model2_train, model2_temp = train_test_split(
    model2_df[
        [
            "image",
            "image_path",
            "model2_label"
        ]
    ],
    test_size=0.20,
    stratify=model2_df["model2_label"],
    random_state=RANDOM_STATE
)

model2_val, model2_test = train_test_split(
    model2_temp,
    test_size=0.50,
    stratify=model2_temp["model2_label"],
    random_state=RANDOM_STATE
)


# ============================================================
# Save Model 2 splits
# ============================================================

model2_train.to_csv(
    os.path.join(OUTPUT_DIR, "model2_train.csv"),
    index=False
)

model2_val.to_csv(
    os.path.join(OUTPUT_DIR, "model2_val.csv"),
    index=False
)

model2_test.to_csv(
    os.path.join(OUTPUT_DIR, "model2_test.csv"),
    index=False
)


# ============================================================
# Print results
# ============================================================

print("\n" + "=" * 60)
print("MODEL 1 SPLIT")
print("=" * 60)

print(f"Train:      {len(model1_train):,}")
print(f"Validation: {len(model1_val):,}")
print(f"Test:       {len(model1_test):,}")

print("\nModel 1 training distribution:")
print(model1_train["model1_label"].value_counts().sort_index())

print("\nModel 1 validation distribution:")
print(model1_val["model1_label"].value_counts().sort_index())

print("\nModel 1 test distribution:")
print(model1_test["model1_label"].value_counts().sort_index())


print("\n" + "=" * 60)
print("MODEL 2 SPLIT")
print("=" * 60)

print(f"Train:      {len(model2_train):,}")
print(f"Validation: {len(model2_val):,}")
print(f"Test:       {len(model2_test):,}")

print("\nModel 2 training distribution:")
print(model2_train["model2_label"].value_counts())

print("\nModel 2 validation distribution:")
print(model2_val["model2_label"].value_counts())

print("\nModel 2 test distribution:")
print(model2_test["model2_label"].value_counts())


print("\n" + "=" * 60)
print("DATASET PREPARATION COMPLETE")
print("=" * 60)

print(f"\nSplit files saved to:")
print(OUTPUT_DIR)