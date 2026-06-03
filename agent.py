"""
agent.py
--------
L'agent LangChain qui connecte Groq + la base RAG.
"""

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

VECTOR_STORE_DIR = "./vector_store"

# Prompt système pour l'audit sécurité DevOps
PROMPT_SYSTEME = """
Tu es un expert DevSecOps spécialisé en sécurité Kubernetes et Docker.
Utilise UNIQUEMENT les informations du contexte fourni pour répondre.
Si tu ne trouves pas la réponse dans le contexte, dis-le clairement.

Pour chaque problème de sécurité trouvé, réponds avec :
1. ❌ PROBLÈME : description du problème
2. ⚠️  NIVEAU : CRITICAL / HIGH / MEDIUM / LOW
3. ✅ SOLUTION : comment corriger

Contexte :
{context}

Question : {question}
"""


def creer_agent():
    """Crée et retourne l'agent RAG."""

    # Vérifier que la base vectorielle existe
    if not os.path.exists(VECTOR_STORE_DIR):
        print("❌ Base vectorielle introuvable !")
        print("   Lance d'abord : python indexer.py")
        exit(1)

    print("🔮 Chargement de la base vectorielle...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    db = FAISS.load_local(
        VECTOR_STORE_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )

    print("🤖 Connexion à Groq (Llama 3)...")
    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0
    )

    retriever = db.as_retriever(search_kwargs={"k": 4})

    prompt = ChatPromptTemplate.from_template(PROMPT_SYSTEME)

    agent = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True
    )

    print("✅ Agent prêt !\n")
    return agent


def poser_question(agent, question):
    """Pose une question à l'agent et affiche la réponse."""
    print(f"\n❓ Question : {question}")
    print("-" * 50)

    resultat = agent.invoke({"query": question})
    reponse = resultat["result"]

    print(f"🤖 Réponse :\n{reponse}")

    # Afficher les sources utilisées
    print("\n📚 Sources utilisées :")
    sources = set()
    for doc in resultat["source_documents"]:
        source = doc.metadata.get("source", "inconnu")
        sources.add(source)
    for source in sources:
        print(f"   - {source}")

    return reponse