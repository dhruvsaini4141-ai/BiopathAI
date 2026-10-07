# 🧬 BioPatch AI

> **AI-assisted skin lesion screening prototype** — a two-stage deep learning pipeline for early detection and classification of skin cancer.

> ⚠️ **Disclaimer:** BioPatch AI is a **research and educational prototype only**. It is **not a certified medical device** and must **not** be used as a substitute for professional clinical diagnosis. Always consult a qualified dermatologist or healthcare provider.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#-api-reference)
- [AI Models](#-ai-models)
- [Training](#-training)
- [Workflow](#-workflow)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**BioPatch AI** is a full-stack intelligent skin-lesion screening system. It combines a **FastAPI** backend powered by **PyTorch EfficientNet-B0** models with a modern **React + TypeScript** dashboard. Clinicians or researchers can upload dermoscopic images and receive real-time AI-driven screening results.

The system uses a **cascaded two-model pipeline**:
1. **Screening Model (Model 1)** — Determines whether an image is *suspicious/cancerous* or a *non-target lesion*.
2. **Classification Model (Model 2)** — If suspicious, classifies the cancer type as **BCC**, **SCC**, or **Melanoma**.

---

## 🏗️ Architecture

```
+------------------------------------------------------------------+
|                        BioPatch AI System                        |
|                                                                  |
|   +---------------+    HTTP/REST    +------------------------+   |
|   |   React +     |<--------------->|   FastAPI Backend      |   |
|   |  TypeScript   |                 |   (Python 3.11+)       |   |
|   |  Dashboard    |                 |                        |   |
|   |  (Vite SPA)   |                 |  +------------------+  |   |
|   |               |                 |  |  Model 1         |  |   |
|   |  Pages:       |  POST /analyze  |  |  EfficientNet-B0 |  |   |
|   |  - Dashboard  |---------------->|  |  Screening       |  |   |
|   |  - Live Scan  |                 |  |  (2 classes)     |  |   |
|   |  - History    |                 |  +--------+---------+  |   |
|   |  - Settings   |                 |           |            |   |
|   |  - Case Detail|                 |  +--------v---------+  |   |
|   +---------------+                 |  |  Model 2         |  |   |
|                                     |  |  EfficientNet-B0 |  |   |
|                                     |  |  Classification  |  |   |
|                                     |  |  (BCC/SCC/MEL)   |  |   |
|                                     |  +------------------+  |   |
|                                     +------------------------+   |
+------------------------------------------------------------------+
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Two-Stage AI Pipeline** | Screening -> Classification cascade for high-precision results |
| 📸 **Live Scan** | Upload dermoscopic images and get instant AI analysis |
| 📊 **Dashboard** | Real-time stats, risk indicators, and case summaries |
| 📁 **Case History** | Browse and filter all historical scan cases |
| 🔎 **Case Detail** | Deep-dive view with probability breakdowns and reports |
| ⚙️ **Settings** | Device and system configuration management |
| 🌑 **Dark UI** | Premium dark-mode glassmorphism interface |
| ⚡ **Fast Inference** | CPU-optimized PyTorch inference with sub-second response |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.141.1 | REST API framework |
| Uvicorn | 0.52.4 | ASGI server |
| PyTorch (CPU) | 2.8.0 | Deep learning inference |
| TorchVision | 0.23.0 | Image transforms & EfficientNet |
| Pillow | Latest | Image loading & processing |
| Pydantic | 2.13.4 | Data validation |
| python-multipart | 0.0.32 | File upload handling |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.3 | Type-safe JavaScript |
| Vite | 6.0.3 | Build tool & dev server |
| TailwindCSS | 3.4.16 | Utility-first styling |
| Lucide React | 0.468.0 | Icon library |
| clsx | 2.1.1 | Conditional class names |

---

## 📁 Project Structure

```
BioPatchAI/
|
+-- backend/                    # FastAPI backend
|   +-- main.py                 # App entry point, routes, CORS
|   +-- inference.py            # Model loading & two-stage inference
|   +-- preprocessing.py        # Image preprocessing utilities
|   +-- new.py                  # Utility / scratch
|
+-- frontend/                   # React TypeScript SPA
|   +-- src/
|   |   +-- pages/              # Top-level page components
|   |   |   +-- Dashboard.tsx
|   |   |   +-- LiveScan.tsx
|   |   |   +-- History.tsx
|   |   |   +-- CaseDetail.tsx
|   |   |   +-- Settings.tsx
|   |   +-- components/         # Reusable UI components
|   |   |   +-- dashboard/
|   |   |   +-- case/
|   |   |   +-- history/
|   |   |   +-- image-viewer/
|   |   |   +-- result/
|   |   |   +-- device-status/
|   |   |   +-- layout/
|   |   +-- services/           # API service layer
|   |   +-- hooks/              # Custom React hooks
|   |   +-- types/              # TypeScript type definitions
|   |   +-- utils/              # Helper utilities
|   |   +-- App.tsx             # Root app + routing
|   +-- index.html
|   +-- vite.config.ts
|   +-- tailwind.config.js
|   +-- package.json
|
+-- models/                     # Trained PyTorch model weights
|   +-- model1_screening.pth    # Stage 1: Screening model (~16 MB)
|   +-- model2_cancer_type.pth  # Stage 2: Classification model (~16 MB)
|
+-- training/                   # Model training scripts
|   +-- train_model1.py         # Train screening model
|   +-- train_model2.py         # Train classification model
|   +-- prepare_dataset.py      # Full dataset preparation
|   +-- prepare_small_dataset.py# Small dataset for testing
|   +-- inspect_dataset.py      # Dataset inspection & stats
|
+-- dataset/                    # Training data (not tracked in git)
+-- camera_test.py              # Camera hardware test utility
+-- camera_udp_test.py          # UDP camera stream test utility
+-- requirement.txt.txt         # Python dependencies
+-- README.md
+-- WORKFLOW.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **npm** 9 or higher
- Git

---

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/BioPatchAI.git
cd BioPatchAI
```

**2. Create and activate a virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

**3. Install Python dependencies**
```bash
pip install -r requirement.txt.txt
```

**4. Verify model weights are present**
```
models/
  model1_screening.pth    OK
  model2_cancer_type.pth  OK
```

> If you don't have the model weights, run the training scripts (see [Training](#-training)) or download pre-trained weights from the releases page.

**5. Run the backend server**
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

---

### Frontend Setup

**1. Navigate to the frontend directory**
```bash
cd frontend
```

**2. Install Node.js dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
```

**4. Start the development server**
```bash
npm run dev
```

The frontend will be available at: **http://localhost:5173**

**5. Build for production**
```bash
npm run build
```

---

## 📡 API Reference

### `GET /`
Returns project status and description.

```json
{
  "project": "BioPatch AI",
  "status": "running",
  "description": "AI-assisted skin-lesion screening prototype"
}
```

---

### `GET /health`
Health check — confirms both models are loaded.

```json
{
  "status": "healthy",
  "model1": "loaded",
  "model2": "loaded"
}
```

---

### `POST /analyze`
Analyze an uploaded skin lesion image.

**Request:** `multipart/form-data`
| Field | Type | Description |
|---|---|---|
| `file` | `image/*` | Dermoscopic image (JPG, PNG, etc.) |

**Response — Non-target:**
```json
{
  "filename": "lesion.jpg",
  "result": {
    "screening_result": "non_target",
    "screening_label": "Non-target lesion",
    "screening_probability": 0.12,
    "cancer_type": null,
    "cancer_probabilities": null,
    "message": "AI screening did not classify the image as cancer/suspicious."
  }
}
```

**Response — Suspicious:**
```json
{
  "filename": "lesion.jpg",
  "result": {
    "screening_result": "suspicious",
    "screening_label": "Suspicious",
    "screening_probability": 0.91,
    "cancer_type": "MEL",
    "cancer_probabilities": {
      "BCC": 0.05,
      "SCC": 0.08,
      "Melanoma": 0.87
    },
    "message": "AI screening result: suspicious for MEL. Clinical evaluation recommended."
  }
}
```

---

## 🤖 AI Models

Both models use **EfficientNet-B0** architecture fine-tuned on dermoscopic image datasets.

| Model | Task | Classes | Input Size | Format |
|---|---|---|---|---|
| `model1_screening.pth` | Binary screening | `non_target`, `cancer_suspicious` | 224x224 RGB | PyTorch state dict |
| `model2_cancer_type.pth` | Cancer type classification | `BCC`, `SCC`, `MEL` | 224x224 RGB | PyTorch state dict |

**Preprocessing pipeline:**
1. Resize to 224x224
2. Convert to tensor
3. Normalize with ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`

---

## 🎓 Training

Training scripts are located in the `training/` directory.

**Train Screening Model (Model 1):**
```bash
python training/train_model1.py
```

**Train Classification Model (Model 2):**
```bash
python training/train_model2.py
```

**Prepare dataset:**
```bash
# Full dataset
python training/prepare_dataset.py

# Smaller dataset for quick iteration
python training/prepare_small_dataset.py

# Inspect dataset statistics
python training/inspect_dataset.py
```

> **Dataset:** Place your dermoscopy dataset in the `dataset/` directory before training. The training scripts expect the dataset to be organized by class folders.

---

## 🔄 Workflow

See [WORKFLOW.md](./WORKFLOW.md) for the detailed development and deployment workflow.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with love for medical AI research</strong><br/>
  <sub>BioPatch AI — Not for clinical use</sub>
</div>
