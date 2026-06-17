🤖 Agent IA DevSecOps — RAG + LangChain + Groq

Agent intelligent d’audit de sécurité pour configurations Kubernetes et Docker, basé sur le RAG (Retrieval-Augmented Generation).

📌 Description

Ce projet analyse des fichiers YAML Kubernetes et Dockerfile, les compare aux standards de sécurité (NSA, NIST, OWASP) et génère automatiquement des recommandations de sécurité.

🛠️ Stack technique
Python 3.10+
LangChain
Groq API (Llama 3 / Mixtral)
Hugging Face Embeddings
FAISS (Vector Database)
📁 Structure du projet
agent-devops-rag/
│
├── documents/
│   ├── securite/
│   └── yaml/
│
├── vector_store/
├── indexer.py
├── agent.py
├── main.py
├── .env
├── requirements.txt
└── README.md
⚙️ Installation
1. Cloner le projet
git clone <repo-url>
cd agent-devops-rag
2. Installer les dépendances
pip install -r requirements.txt
3. Configuration de l’environnement

Créer un fichier .env à la racine du projet :

GROQ_API_KEY=your_api_key_here
📚 Indexation des documents
python indexer.py
🚀 Lancement de l’agent
python main.py
💬 Exemple d’utilisation
Ce deployment.yaml est-il sécurisé ?
Mon container tourne en root, est-ce risqué ?
Quelles sont les bonnes pratiques Docker selon OWASP ?
📖 Références
NSA Kubernetes Hardening Guide
NIST SP 800-190
OWASP Docker Security Cheat Sheet
Documentation officielle Kubernetes
👤 Auteur

Projet personnel — RAG, DevSecOps et intelligence artificielle appliquée
