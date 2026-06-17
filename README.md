# DevSecOps RAG Agent

**Automated security auditing for Kubernetes & Docker configurations using Retrieval-Augmented Generation**

`Python 3.10+` · `LangChain` · `Groq (Llama 3)` · `FAISS` · `FastAPI` · `React` · `MIT License`

---

## Overview

DevSecOps RAG Agent is an AI-powered security auditing tool that analyzes Kubernetes and Docker configurations against official security standards. It combines **Retrieval-Augmented Generation (RAG)** with a curated knowledge base of security guidelines (NSA, NIST, OWASP) to deliver contextual, actionable recommendations.

Instead of generic warnings, the agent retrieves the most relevant sections from official documentation and uses an LLM to generate precise, context-aware security reports for your specific configuration.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Dashboard                        │
│              (Dark UI · Chart.js · Real-time)               │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│                       FastAPI Backend                        │
└──────────┬────────────────────────────────────┬─────────────┘
           │                                    │
┌──────────▼──────────┐              ┌──────────▼──────────┐
│    LangChain Agent   │              │    FAISS Vector DB   │
│  (RAG · Chain · QA) │◄────────────►│  (HuggingFace Emb.) │
└──────────┬──────────┘              └─────────────────────┘
           │
┌──────────▼──────────┐
│      Groq LLM        │
│   (Llama 3 70B)      │
└─────────────────────┘
```

**RAG Pipeline:**
1. Security documents (PDF/HTML/TXT) are chunked and embedded via HuggingFace
2. Embeddings are indexed in a local FAISS vector store
3. User submits a YAML/Dockerfile for audit
4. Agent retrieves the top-k most relevant security guidelines
5. Groq LLM generates a contextualized audit report

---

## Features

- **Multi-format ingestion** — Supports PDF, HTML, TXT security documents
- **Semantic search** — Finds relevant guidelines based on meaning, not keywords
- **LLM-powered analysis** — Groq Llama 3 generates human-readable audit reports
- **REST API** — FastAPI backend for integration with CI/CD pipelines
- **React dashboard** — Real-time visualization of audit results with Chart.js
- **Fully local vector store** — No external database required (FAISS)
- **Zero cost** — Built entirely on free-tier APIs and open-source libraries

---

## Knowledge Base

| Document | Source | Format |
|----------|--------|--------|
| Kubernetes Hardening Guide | NSA/CISA | PDF |
| Application Container Security | NIST SP 800-190 | PDF |
| Docker Security Cheat Sheet | OWASP | TXT |
| Kubernetes Security Docs | kubernetes.io | HTML |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| LLM | Groq (Llama 3 70B) | Text generation |
| RAG Framework | LangChain | Orchestration |
| Embeddings | HuggingFace Transformers | Vectorization |
| Vector Store | FAISS | Semantic search |
| Backend | FastAPI | REST API |
| Frontend | React + Chart.js | Dashboard |
| Containerization | Docker + Kubernetes | Deployment targets |

---

## Project Structure

```
agent-devops-rag/
├── documents/
│   ├── securite/               ← Security reference documents
│   │   ├── CTR_KUBERNETES_HARDENING.pdf
│   │   ├── NIST.SP.800-190.pdf
│   │   ├── Docker_Security_OWASP.txt
│   │   └── Security_Kubernetes.html
│   └── yaml/                   ← Kubernetes configs to audit
│       ├── deployment.yaml
│       └── service.yaml
├── vector_store/               ← Auto-generated FAISS index
├── frontend/                   ← React dashboard
├── .env                        ← API keys (not committed)
├── requirements.txt
├── indexer.py                  ← Document indexing pipeline
├── agent.py                    ← LangChain RAG agent
├── main.py                     ← FastAPI entrypoint
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for the React dashboard)
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/agent-devops-rag.git
cd agent-devops-rag

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your Groq API key:
# GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# 4. Add your security documents
# Place PDF/TXT/HTML files in documents/securite/
# Place YAML configs in documents/yaml/

# 5. Index the documents (run once)
python indexer.py

# 6. Start the API server
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Dashboard available at http://localhost:5173
```

---

## Usage

### Via CLI

```bash
python main.py
```

```
> Does this deployment.yaml have security issues?
> What are OWASP's Docker best practices?
> My pod is running as root — is this dangerous?
```

### Via API

```bash
curl -X POST http://localhost:8000/audit \
  -H "Content-Type: application/json" \
  -d '{"query": "Analyze my deployment.yaml for security issues"}'
```

---

## LLM Configuration

You can switch models in `agent.py` based on your needs:

```python
model_name = "llama3-70b-8192"    # Best quality
model_name = "mixtral-8x7b-32768" # Faster, longer context
model_name = "llama3-8b-8192"     # Lightest, lowest latency
```

---

## Example Output

```
[AUDIT REPORT] deployment.yaml

🔴 CRITICAL
- Container running as root (UID 0) — violates NSA K8s Hardening Guide §4.2
  Fix: Set securityContext.runAsNonRoot: true

🟠 HIGH  
- No resource limits defined — risk of resource exhaustion (DoS)
  Fix: Set resources.limits.cpu and resources.limits.memory

🟡 MEDIUM
- Privileged mode enabled — grants full host access
  Fix: Set securityContext.privileged: false

📚 Reference: NSA Kubernetes Hardening Guide, NIST SP 800-190 §3.1
```

---

## Roadmap

- [ ] GitHub Actions integration for automated PR audits
- [ ] Terraform and Helm chart support
- [ ] CVE database integration (OSV, NVD)
- [ ] Multi-language report output (EN/FR/AR)
- [ ] Slack/Teams notification support

---

## Author

**Doaa Ben Marzouk** — Computer Engineering Student, ENICarthage  
Academic project — DevSecOps track · 2025–2026

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
