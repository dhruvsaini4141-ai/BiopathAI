import os
import pandas as pd

# --------------------------------------------------
# BioPatch AI - ISIC 2019 Dataset Inspection
# --------------------------------------------------

DATASET_DIR = os.path.join("dataset", "ISIC_2019")
CSV_PATH = os.path.join(
    DATASET_DIR,
    "ISIC_2019_Training_GroundTruth.csv"
)

# Load ground truth
df = pd.read_csv(CSV_PATH)

print("=" * 60)
print("BIOPATCH AI - ISIC 2019 DATASET INSPECTION")
print("=" * 60)

print(f"\nTotal rows: {len(df):,}")

print("\nColumns:")
print(list(df.columns))

# Diagnostic label columns
label_columns = [
    "MEL",
    "NV",
    "BCC",
    "AK",
    "BKL",
    "DF",
    "VASC",
    "SCC",
    "UNK",
]

# Check that all expected columns exist
missing_columns = [
    col for col in label_columns
    if col not in df.columns
]

if missing_columns:
    print("\nERROR: Missing expected columns:")
    print(missing_columns)
    raise SystemExit(1)

# --------------------------------------------------
# Check number of active labels per image
# --------------------------------------------------

df["active_labels"] = df[label_columns].sum(axis=1)

print("\nActive-label check:")
print(df["active_labels"].value_counts().sort_index())

multiple_labels = df[df["active_labels"] > 1]
no_label = df[df["active_labels"] == 0]

print(f"\nImages with multiple labels: {len(multiple_labels):,}")
print(f"Images with no label:        {len(no_label):,}")

# --------------------------------------------------
# Original ISIC class distribution
# --------------------------------------------------

print("\n" + "=" * 60)
print("ORIGINAL CLASS DISTRIBUTION")
print("=" * 60)

class_counts = df[label_columns].sum().sort_values(ascending=False)

for label, count in class_counts.items():
    print(f"{label:>5}: {int(count):,}")

# --------------------------------------------------
# Model 1 mapping
#
# CANCER:
#   MEL + BCC + SCC
#
# NON-TARGET:
#   NV + AK + BKL + DF + VASC
# --------------------------------------------------

df["model1_label"] = 0

cancer_labels = ["MEL", "BCC", "SCC"]

non_target_labels = [
    "NV",
    "AK",
    "BKL",
    "DF",
    "VASC",
]

df.loc[df[cancer_labels].sum(axis=1) > 0, "model1_label"] = 1

print("\n" + "=" * 60)
print("MODEL 1 DISTRIBUTION")
print("=" * 60)

model1_counts = df["model1_label"].value_counts().sort_index()

print(f"0 = Non-target lesion: {model1_counts.get(0, 0):,}")
print(f"1 = Cancer/suspicious: {model1_counts.get(1, 0):,}")

# --------------------------------------------------
# Model 2 distribution
# --------------------------------------------------

model2_df = df[df[cancer_labels].sum(axis=1) == 1].copy()

model2_df["model2_label"] = model2_df[cancer_labels].idxmax(axis=1)

print("\n" + "=" * 60)
print("MODEL 2 DISTRIBUTION")
print("=" * 60)

model2_counts = model2_df["model2_label"].value_counts()

for label in cancer_labels:
    print(f"{label:>5}: {model2_counts.get(label, 0):,}")

# --------------------------------------------------
# Summary
# --------------------------------------------------

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

if len(multiple_labels) == 0 and len(no_label) == 0:
    print("PASS: Every image has exactly one diagnostic label.")
else:
    print("WARNING: Some images do not have exactly one label.")

print("\nModel 1:")
print("  0 = Non-target lesion")
print("  1 = Cancer/suspicious")

print("\nModel 2:")
print("  BCC = Basal Cell Carcinoma")
print("  SCC = Squamous Cell Carcinoma")
print("  MEL = Melanoma")

print("\nDataset inspection complete.")