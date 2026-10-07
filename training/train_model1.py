import os
import copy
import time

import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from torchvision import transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = os.path.join("dataset", "ISIC_2019")
SPLIT_DIR = os.path.join(DATASET_DIR, "small_splits")

MODEL_DIR = "models"
MODEL_PATH = os.path.join(
    MODEL_DIR,
    "model1_screening.pth"
)

IMAGE_SIZE = 224

BATCH_SIZE = 32

NUM_WORKERS = 0

NUM_EPOCHS = 3

LEARNING_RATE = 0.0003

RANDOM_SEED = 42


# ============================================================
# REPRODUCIBILITY
# ============================================================

torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device("cpu")

print("=" * 60)
print("BIOPATCH AI - MODEL 1 SMALL DATASET TRAINING")
print("=" * 60)

print(f"\nDevice: {DEVICE}")
print(f"Image size: {IMAGE_SIZE}x{IMAGE_SIZE}")
print(f"Batch size: {BATCH_SIZE}")
print(f"Epochs: {NUM_EPOCHS}")


# ============================================================
# DATASET
# ============================================================

class ISICDataset(Dataset):

    def __init__(self, dataframe, transform=None):
        self.df = dataframe.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, index):

        row = self.df.iloc[index]

        image = Image.open(
            row["image_path"]
        ).convert("RGB")

        label = int(row["model1_label"])

        if self.transform:
            image = self.transform(image)

        return image, label


# ============================================================
# TRANSFORMS
# ============================================================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.RandomHorizontalFlip(),

    transforms.RandomVerticalFlip(),

    transforms.RandomRotation(15),

    transforms.ColorJitter(
        brightness=0.10,
        contrast=0.10,
        saturation=0.10,
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


eval_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ============================================================
# LOAD DATA
# ============================================================

train_df = pd.read_csv(
    os.path.join(
        SPLIT_DIR,
        "model1_train.csv"
    )
)

val_df = pd.read_csv(
    os.path.join(
        SPLIT_DIR,
        "model1_val.csv"
    )
)

test_df = pd.read_csv(
    os.path.join(
        SPLIT_DIR,
        "model1_test.csv"
    )
)

print("\nDataset sizes:")
print(f"Train:      {len(train_df):,}")
print(f"Validation: {len(val_df):,}")
print(f"Test:       {len(test_df):,}")


# ============================================================
# DATASETS
# ============================================================

train_dataset = ISICDataset(
    train_df,
    train_transform
)

val_dataset = ISICDataset(
    val_df,
    eval_transform
)

test_dataset = ISICDataset(
    test_df,
    eval_transform
)


# ============================================================
# DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=NUM_WORKERS
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS
)


# ============================================================
# CLASS WEIGHTS
# ============================================================

class_counts = (
    train_df["model1_label"]
    .value_counts()
    .sort_index()
)

total = len(train_df)

class_weights = total / (
    2 * class_counts.values
)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
)

print("\nTraining class counts:")
print(class_counts)

print("\nClass weights:")
print(class_weights)


# ============================================================
# EFFICIENTNET-B0
# ============================================================

print("\nLoading EfficientNet-B0...")

weights = EfficientNet_B0_Weights.DEFAULT

model = efficientnet_b0(
    weights=weights
)

# Freeze pretrained feature extractor
for parameter in model.features.parameters():
    parameter.requires_grad = False

# Replace classifier
in_features = model.classifier[1].in_features

model.classifier[1] = nn.Linear(
    in_features,
    2
)

model = model.to(DEVICE)


# ============================================================
# LOSS
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.classifier.parameters(),
    lr=LEARNING_RATE,
    weight_decay=1e-4
)


# ============================================================
# TRAIN
# ============================================================

def train_one_epoch():

    model.train()

    total_loss = 0

    predictions = []
    labels_all = []

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        total_loss += (
            loss.item()
            * images.size(0)
        )

        preds = torch.argmax(
            outputs,
            dim=1
        )

        predictions.extend(
            preds.cpu().numpy()
        )

        labels_all.extend(
            labels.cpu().numpy()
        )

    loss = total_loss / len(
        train_loader.dataset
    )

    f1 = f1_score(
        labels_all,
        predictions,
        zero_division=0
    )

    return loss, f1


# ============================================================
# EVALUATION
# ============================================================

def evaluate(loader):

    model.eval()

    total_loss = 0

    predictions = []
    labels_all = []

    with torch.no_grad():

        for images, labels in loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            total_loss += (
                loss.item()
                * images.size(0)
            )

            preds = torch.argmax(
                outputs,
                dim=1
            )

            predictions.extend(
                preds.cpu().numpy()
            )

            labels_all.extend(
                labels.cpu().numpy()
            )

    loss = total_loss / len(
        loader.dataset
    )

    accuracy = accuracy_score(
        labels_all,
        predictions
    )

    precision = precision_score(
        labels_all,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        labels_all,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        labels_all,
        predictions,
        zero_division=0
    )

    return (
        loss,
        accuracy,
        precision,
        recall,
        f1,
        labels_all,
        predictions
    )


# ============================================================
# TRAINING LOOP
# ============================================================

best_f1 = -1

best_state = None

start_time = time.time()

print("\nStarting training...\n")


for epoch in range(NUM_EPOCHS):

    epoch_start = time.time()

    train_loss, train_f1 = train_one_epoch()

    (
        val_loss,
        val_accuracy,
        val_precision,
        val_recall,
        val_f1,
        _,
        _
    ) = evaluate(val_loader)

    elapsed = (
        time.time()
        - epoch_start
    )

    print(
        f"Epoch {epoch + 1}/{NUM_EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Train F1: {train_f1:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: {val_accuracy:.4f} | "
        f"Val Recall: {val_recall:.4f} | "
        f"Val F1: {val_f1:.4f} | "
        f"Time: {elapsed / 60:.1f} min"
    )

    if val_f1 > best_f1:

        best_f1 = val_f1

        best_state = copy.deepcopy(
            model.state_dict()
        )

        print(
            f"  -> New best model "
            f"(validation F1 = {best_f1:.4f})"
        )


# ============================================================
# RESTORE BEST
# ============================================================

if best_state is not None:

    model.load_state_dict(
        best_state
    )


# ============================================================
# TEST
# ============================================================

print("\n" + "=" * 60)
print("FINAL TEST EVALUATION")
print("=" * 60)

(
    test_loss,
    test_accuracy,
    test_precision,
    test_recall,
    test_f1,
    test_labels,
    test_predictions
) = evaluate(test_loader)

print(f"\nTest Loss:       {test_loss:.4f}")
print(f"Test Accuracy:   {test_accuracy:.4f}")
print(f"Test Precision:  {test_precision:.4f}")
print(f"Test Recall:     {test_recall:.4f}")
print(f"Test F1:         {test_f1:.4f}")

cm = confusion_matrix(
    test_labels,
    test_predictions
)

print("\nConfusion Matrix:")
print(cm)

print("\nClass meaning:")
print("0 = Non-target lesion")
print("1 = Cancer/suspicious")


# ============================================================
# SAVE MODEL
# ============================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

torch.save(
    {
        "model_state_dict": model.state_dict(),
        "model_name": "efficientnet_b0",
        "num_classes": 2,
        "class_names": [
            "non_target",
            "cancer_suspicious"
        ],
        "image_size": IMAGE_SIZE,
        "best_validation_f1": best_f1,
        "test_accuracy": test_accuracy,
        "test_precision": test_precision,
        "test_recall": test_recall,
        "test_f1": test_f1,
    },
    MODEL_PATH
)

total_time = (
    time.time()
    - start_time
)

print("\n" + "=" * 60)
print("MODEL 1 TRAINING COMPLETE")
print("=" * 60)

print("\nModel saved to:")
print(MODEL_PATH)

print(
    f"\nTotal training time: "
    f"{total_time / 60:.1f} minutes"
)

print(
    "\nResearch/demo prototype only. "
    "Not clinically validated."
)