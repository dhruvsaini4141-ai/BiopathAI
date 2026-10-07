import os

import torch
import torch.nn as nn

from PIL import Image

from torchvision import transforms
from torchvision.models import efficientnet_b0


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL1_PATH = os.path.join(
    MODEL_DIR,
    "model1_screening.pth"
)

MODEL2_PATH = os.path.join(
    MODEL_DIR,
    "model2_cancer_type.pth"
)


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device("cpu")


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

IMAGE_SIZE = 224

transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# MODEL LOADER
# ============================================================

def load_model(
    model_path,
    num_classes
):

    model = efficientnet_b0(
        weights=None
    )

    in_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        in_features,
        num_classes
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE
    )

    # Our training scripts saved a dictionary
    if "model_state_dict" in checkpoint:

        model.load_state_dict(
            checkpoint["model_state_dict"]
        )

    else:

        model.load_state_dict(
            checkpoint
        )

    model = model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# LOAD BOTH MODELS
# ============================================================

print("Loading BioPatch AI models...")

model1 = load_model(
    MODEL1_PATH,
    2
)

model2 = load_model(
    MODEL2_PATH,
    3
)

print("Model 1 loaded successfully.")
print("Model 2 loaded successfully.")


# ============================================================
# CLASS NAMES
# ============================================================

MODEL1_CLASSES = [
    "non_target",
    "cancer_suspicious"
]

MODEL2_CLASSES = [
    "BCC",
    "SCC",
    "MEL"
]


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def analyze_image(image):

    """
    Performs two-stage BioPatch AI analysis.

    Stage 1:
        Non-target lesion
        OR
        Cancer/suspicious

    Stage 2:
        BCC
        SCC
        Melanoma

    This is a research/demo screening system.
    It is NOT a clinical diagnosis.
    """

    if not isinstance(
        image,
        Image.Image
    ):

        image = Image.open(
            image
        ).convert("RGB")

    else:

        image = image.convert(
            "RGB"
        )

    # --------------------------------------------------------
    # PREPROCESS
    # --------------------------------------------------------

    input_tensor = transform(
        image
    )

    input_tensor = input_tensor.unsqueeze(
        0
    )

    input_tensor = input_tensor.to(
        DEVICE
    )


    # --------------------------------------------------------
    # MODEL 1
    # --------------------------------------------------------

    with torch.no_grad():

        output1 = model1(
            input_tensor
        )

        probabilities1 = torch.softmax(
            output1,
            dim=1
        )[0]

        prediction1 = torch.argmax(
            probabilities1
        ).item()


    screening_probability = (
        probabilities1[1].item()
    )


    # --------------------------------------------------------
    # NON-TARGET
    # --------------------------------------------------------

    if prediction1 == 0:

        return {

            "screening_result":
                "non_target",

            "screening_label":
                "Non-target lesion",

            "screening_probability":
                screening_probability,

            "cancer_type":
                None,

            "cancer_probabilities":
                None,

            "message":
                "AI screening did not classify "
                "the image as cancer/suspicious."
        }


    # --------------------------------------------------------
    # MODEL 2
    # --------------------------------------------------------

    with torch.no_grad():

        output2 = model2(
            input_tensor
        )

        probabilities2 = torch.softmax(
            output2,
            dim=1
        )[0]

        prediction2 = torch.argmax(
            probabilities2
        ).item()


    cancer_type = MODEL2_CLASSES[
        prediction2
    ]


    cancer_probabilities = {

        "BCC":
            probabilities2[0].item(),

        "SCC":
            probabilities2[1].item(),

        "Melanoma":
            probabilities2[2].item()
    }


    return {

        "screening_result":
            "suspicious",

        "screening_label":
            "Suspicious",

        "screening_probability":
            screening_probability,

        "cancer_type":
            cancer_type,

        "cancer_probabilities":
            cancer_probabilities,

        "message":
            f"AI screening result: suspicious "
            f"for {cancer_type}. "
            f"Clinical evaluation recommended."
    }