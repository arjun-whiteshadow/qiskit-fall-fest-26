# AI Usage Log

This log records every time an AI assistant (Claude, via Claude Code in VS Code) helped with this
project. It is the source for the AI-use statement in our written report.

**How to read each entry:** *Task* is what we asked for. *AI contribution* is what the AI produced.
*Verification* is how we checked the output instead of trusting it blindly. *Team ownership* lists what
we reviewed or decided ourselves.

---

## Entry 1: Environment setup and repository (2026-11-13)
- **Task:** Create the project folder, git repo, submission placeholders, README template and Python venv.
- **AI contribution:**
  - Ran the shell commands.
  - Found and fixed two problems:
    - **Qiskit 2.6.2 crashed on import under Python 3.10.6** (a `typing.Callable` bug in that Python
      release). The AI pinned `qiskit<2.3` (2.2.3), which imports correctly.
    - **The notebook's Jupyter kernel ran another project's virtual environment.** The AI registered
      a dedicated kernel, `qiskit-fall-fest-26`.
  - Added a `.gitignore` and pushed the first commit to GitHub.
- **Verification:** Imported qiskit and qiskit-aer and listed the Aer backends. Executed the notebook
  headlessly.
- **Team ownership:** We filled in the team information in the README ourselves.

## Entry 2: Phase 1 notebook (molecule → Hamiltonian → exact baseline) (2026-11-13)
- **Task:** Define H₂ in PySCF, build its Hamiltonian, map it to qubits and compute the exact
  classical ground-state energy, with beginner-friendly explanations.
- **AI contribution:**
  - Installed `pyscf` 2.15.0 and `qiskit-nature` 0.8.0 (with `qiskit-algorithms` 0.4.0).
  - Wrote the notebook cells (sections 0–4) and their Markdown explanations covering:
    - molecule definition, basis set and Hartree–Fock;
    - the second-quantised Hamiltonian;
    - the Jordan–Wigner mapping;
    - an exact baseline computed by three independent methods.
  - Wrote `requirements.txt`.
- **Anti-hallucination check:** Before writing anything to the notebook, the AI ran a throwaway test
  script in our venv. The script checked that every import exists in these exact versions:
  - `PySCFDriver`, `JordanWignerMapper` and `GroundStateEigensolver` from `qiskit_nature.second_q.*`
  - `NumPyMinimumEigensolver` from `qiskit_algorithms`
  - `DistanceUnit` from `qiskit_nature.units`

  The script also confirmed that no deprecation warnings fire for these calls. The `HartreeFock` circuit
  class prints a Qiskit 2.1 deprecation warning; it is not used yet and will be handled in Phase 2.
- **Verification:**
  - Three methods agree to < 1e-8 Ha (each prints −1.1373060358 Ha):
    - Qiskit `NumPyMinimumEigensolver`
    - direct `numpy.linalg.eigvalsh` of the 16×16 qubit matrix
    - PySCF FCI, which uses no qubit mapping at all
  - A Hermiticity check passes.
  - The notebook was executed in a fresh kernel (`jupyter nbconvert --execute`) with no errors.
- **Concepts explained by AI (we must be able to defend these):**
  - Born–Oppenheimer approximation and nuclear repulsion
  - STO-3G basis, and bonding vs antibonding orbitals
  - Hartree–Fock and correlation energy
  - creation/annihilation operators
  - Jordan–Wigner Z-strings
  - why the XXYY-type terms represent the double excitation
  - Qiskit's right-to-left qubit ordering
  - chemical accuracy (1.6 mHa)
- **Team ownership:** _(to fill in: which parts we re-derived or re-explained in our own words)_
