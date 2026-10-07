import os
import pandas as pd
from sklearn.model_selection import train_test_split

RANDOM_STATE = 42
MAX_PER_CLASS = 500

DATASET_DIR = os.path.join("dataset", "ISIC_2019")

CSV_PATH = os.path.join(
    DATASET_DIR,
    "ISIC_2019_Training_GroundTruth.csv"
)

IMAGE_DIR = os.path.join(
    DATASET_DIR,
    "ISIC_2019_Training_Input"
)

OUTPUT_DIR = os.path.join(
    DATASET_DIR,
    "small_splits"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 60)
print("BIOPATCH AI - SMALL ISIC DATASET")
print("=" * 60)

df = pd.read_csv(CSV_PATH)

classes = [
    "MEL",
    "BCC",
    "SCC",
    "NV",
    "BKL",
    "AK",
    "DF",
    "VASC"
]

# ------------------------------------------------------------
# Take up to 500 images from every class
# ------------------------------------------------------------

small_parts = []

for label in classes:

    class_df = df[df[label] == 1].copy()

    n = min(MAX_PER_CLASS, len(class_df))

    class_df = class_df.sample(
        n=n,
        random_state=RANDOM_STATE
    )

    class_df["original_label"] = label

    small_parts.append(class_df)

    print(f"{label:>5}: {n}")

small_df = pd.concat(
    small_parts,
    ignore_index=True
)

# Shuffle
small_df = small_df.sample(
    frac=1,
    random_state=RANDOM_STATE
).reset_index(drop=True)

# ------------------------------------------------------------
# Image paths
# ------------------------------------------------------------

small_df["image_path"] = small_df["image"].apply(
    lambda x: os.path.join(
        IMAGE_DIR,
        str(x) + ".jpg"
    )
)

# Check images
missing = small_df[
    ~small_df["image_path"].map(os.path.isfile)
]

if len(missing) > 0:
    print("ERROR: Missing images:", len(missing))
    raise SystemExit(1)

print("\nAll selected images found.")

# ------------------------------------------------------------
# MODEL 1
#
# 0 = non-target
# 1 = cancer/suspicious
# ------------------------------------------------------------

cancer_labels = ["MEL", "BCC", "SCC"]

small_df["model1_label"] = (
    small_df[cancer_labels].sum(axis=1) > 0
).astype(int)

# ------------------------------------------------------------
# MODEL 2
# ------------------------------------------------------------

model2_df = small_df[
    small_df["original_label"].isin(cancer_labels)
].copy()

model2_df["model2_label"] = model2_df[
    "original_label"
]

# ------------------------------------------------------------
# MODEL 1 SPLIT
# 80 / 10 / 10
# ------------------------------------------------------------

model1_columns = [
    "image",
    "image_path",
    "model1_label"
]

model1_train, model1_temp = train_test_split(
    small_df[model1_columns],
    test_size=0.20,
    stratify=small_df["model1_label"],
    random_state=RANDOM_STATE
)

model1_val, model1_test = train_test_split(
    model1_temp,
    test_size=0.50,
    stratify=model1_temp["model1_label"],
    random_state=RANDOM_STATE
)

# ------------------------------------------------------------
# MODEL 2 SPLIT
# ------------------------------------------------------------

model2_columns = [
    "image",
    "image_path",
    "model2_label"
]

model2_train, model2_temp = train_test_split(
    model2_df[model2_columns],
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

# ------------------------------------------------------------
# Save
# ------------------------------------------------------------

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

# ------------------------------------------------------------
# Results
# ------------------------------------------------------------

print("\n" + "=" * 60)
print("MODEL 1")
print("=" * 60)

print("Train:", len(model1_train))
print("Val:  ", len(model1_val))
print("Test: ", len(model1_test))

print("\nModel 1 train distribution:")
print(model1_train["model1_label"].value_counts().sort_index())

print("\n" + "=" * 60)
print("MODEL 2")
print("=" * 60)

print("Train:", len(model2_train))
print("Val:  ", len(model2_val))
print("Test: ", len(model2_test))

print("\nModel 2 train distribution:")
print(model2_train["model2_label"].value_counts())

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)

print("\nSaved to:")
print(OUTPUT_DIR)