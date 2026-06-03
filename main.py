"""
main.py
-------
Point d'entrée du projet.
Lance ce fichier pour parler à l'agent.
"""

from agent import creer_agent, poser_question


def main():
    print("=" * 50)
    print("   AGENT DEVOPS RAG - AUDIT SECURITE")
    print("=" * 50)

    # Créer l'agent
    agent = creer_agent()

    print("Tape 'quitter' pour arrêter.\n")

    # Boucle de questions
    while True:
        question = input("❓ Ta question : ").strip()

        if not question:
            continue

        if question.lower() in ["quitter", "exit", "quit"]:
            print("👋 Au revoir !")
            break

        poser_question(agent, question)
        print()


if __name__ == "__main__":
    main()