"""
indexer.py
----------
Ce fichier lit tous tes documents et cree la base vectorielle RAG.
Tu le lances UNE SEULE FOIS au debut.
"""

import os
import sys
from dotenv import load_dotenv
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    BSHTMLLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Fix encodage Windows
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

load_dotenv()

DOCUMENTS_DIR = "./documents"
VECTOR_STORE_DIR = "./vector_store"


def charger_documents():
    print("[INFO] Chargement des documents...")
    tous_les_docs = []

    for root, dirs, files in os.walk(DOCUMENTS_DIR):
        for fichier in files:
            chemin = os.path.join(root, fichier)
            try:
                if fichier.endswith(".pdf"):
                    print(f"   [PDF] {fichier}")
                    loader = PyPDFLoader(chemin)
                    tous_les_docs.extend(loader.load())

                elif fichier.endswith(".txt"):
                    print(f"   [TXT] {fichier}")
                    loader = TextLoader(chemin, encoding="utf-8")
                    tous_les_docs.extend(loader.load())

                elif fichier.endswith(".html"):
                    print(f"   [HTML] {fichier}")
                    loader = BSHTMLLoader(chemin, open_encoding="utf-8")
                    tous_les_docs.extend(loader.load())

                elif fichier.endswith(".yaml") or fichier.endswith(".yml"):
                    print(f"   [YAML] {fichier}")
                    loader = TextLoader(chemin, encoding="utf-8")
                    tous_les_docs.extend(loader.load())

            except Exception as e:
                print(f"   [ERREUR] {fichier} : {e}")

    print(f"\n[INFO] Total documents charges : {len(tous_les_docs)}")
    return tous_les_docs


def decouper_documents(documents):
    print("[INFO] Decoupage en chunks...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n---\n", "\n\n", "\n", " "]
    )
    chunks = splitter.split_documents(documents)
    print(f"[INFO] Total chunks crees : {len(chunks)}")
    return chunks


def creer_base_vectorielle(chunks):
    print("[INFO] Creation des embeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    print("[INFO] Sauvegarde de la base vectorielle...")
    db = FAISS.from_documents(chunks, embeddings)
    db.save_local(VECTOR_STORE_DIR)
    print(f"[OK] Base vectorielle sauvegardee dans : {VECTOR_STORE_DIR}")
    return db


if __name__ == "__main__":
    print("=" * 50)
    print("   INDEXATION DES DOCUMENTS RAG")
    print("=" * 50)

    documents = charger_documents()

    if not documents:
        print("[ERREUR] Aucun document trouve ! Verifie le dossier documents/")
        exit(1)

    chunks = decouper_documents(documents)
    creer_base_vectorielle(chunks)

    print("\n[OK] Indexation terminee !")