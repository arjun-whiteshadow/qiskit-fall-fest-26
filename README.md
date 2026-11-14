# Qiskit Fall Fest Hackathon 2026

## Team Information

- **Team Name:** Cdevi Code
- **Team Members:**
  - Arjun Sharma Poudel
  - Shanti Thapa
- **Selected Challenge:** 1 - VQE , Ground State Energy of Molecules
- **Difficulty Level:** Intermediate 

## Submission Files

- `challenge.ipynb` — solution notebook
- `docs/` — detailed explanations for each notebook phase (01–04)
- `Written_Report.pdf` — written report
- `Presentation_Slides.pdf` — presentation slides

## How to Run

```zsh
python3.10 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
jupyter notebook challenge.ipynb   # then Kernel -> Restart & Run All (~1.5 min)
```

## Results Summary (H₂, STO-3G, Jordan–Wigner, UCCSD)

| Quantity | Value |
|---|---|
| Qubits / Pauli terms / ansatz parameters | 4 / 15 / 3 |
| Exact ground-state energy (R = 0.735 Å) | −1.137306 Ha |
| Ideal VQE error | ~1e-11 mHa (100% of correlation energy) |
| Noisy VQE (SPSA, 10k shots/group), true error | ~0.04 mHa |
| Potential-energy curve (25 geometries), max VQE error | ~3e-8 mHa |

Chemical accuracy (1.6 mHa) is reached in all three settings.
