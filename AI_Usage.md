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

## Entry 3: Phase 2 notebook (UCCSD ansatz) (2026-11-13)
- **Task:** Build and validate the parameterised circuit (ansatz) that VQE will optimise.
- **AI contribution:**
  - Wrote sections 5–10 and the Phase 2 Markdown:
    - the variational principle and the VQE loop;
    - UCCSD vs hardware-efficient ansatz trade-offs;
    - a hand-built Hartree–Fock circuit;
    - generation of single and double excitations, mapped with the same Jordan–Wigner mapper;
    - the UCCSD circuit assembled from `PauliEvolutionGate`s;
    - transpiled hardware cost;
    - an energy-landscape plot.
  - Installed `matplotlib` 3.10.9.
- **Design decisions made by the AI (we must be able to justify these):**
  - **Hand-built UCCSD instead of Qiskit Nature's `UCCSD` and `HartreeFock` classes.** In Qiskit 2.2
    those classes are built on the deprecated `NLocal` / `BlueprintCircuit` and print deprecation
    warnings. The AI found this with a test script that turned every warning into an error.
  - **`.decompose()` before `Statevector` simulation.** Without it, scipy prints
    `SparseEfficiencyWarning` notices when building the matrix of a `PauliEvolutionGate`.
- **Bugs caught during development:**
  - A docstring written with escaped quotes caused a `SyntaxError` on the first run.
  - A loop variable named `theta` overwrote the circuit's `ParameterVector`; it was renamed `theta_test`.
  - The first landscape plot hid the 20 mHa gap between the HF and exact lines; a zoomed panel was added.
- **Verification:**
  - The HF circuit energy equals PySCF's HF energy.
  - θ = 0 reproduces HF.
  - The hand-built ansatz matches the library `UCCSD` to 1e-14 Ha at 5 random parameter sets.
  - The decomposed double-excitation gate matches an exact `scipy.linalg.expm` to fidelity 1 − 6e-15.
  - The notebook runs in a fresh kernel with no errors and no stderr output.
- **Concepts explained by AI:**
  - the variational principle
  - why T − T† gives a unitary
  - Brillouin's theorem (single excitations do not mix directly with HF)
  - why commuting Pauli terms make the evolution-gate decomposition exact
  - why the landscape repeats every π (a global sign has no physical effect)
  - CNOT count as the main hardware cost
- **Team ownership:** _(to fill in)_

## Entry 4: Phase 3 notebook (running VQE) (2026-11-13)
- **Task:** Run VQE end-to-end, compare optimizers, verify the result against the exact energy.
- **AI contribution:** Wrote sections 11–15 and the Phase 3 Markdown:
  - the Estimator primitive, PUBs and ISA transpilation;
  - a hand-written VQE cost function that records each evaluation;
  - an optimizer comparison (SLSQP, L-BFGS-B, COBYLA);
  - convergence plots;
  - interpretation of the optimal state (composition and fidelity);
  - a cross-check with `qiskit_algorithms.VQE`;
  - a final results table.
- **Anti-hallucination check:** A test script ran every API in our venv before any notebook code was
  written:
  - `StatevectorEstimator`, `generate_preset_pass_manager`, `AerSimulator`, Aer `EstimatorV2`
  - `SparsePauliOp.apply_layout`
  - `qiskit_algorithms.VQE`

  The script ran with warnings turned into errors, so none of these calls emits a warning.
- **Design decisions made by the AI:**
  - **Our own `scipy.optimize.minimize` loop instead of only the library `VQE`.** Every step is
    visible, which helps in the Q&A. The library is kept as a cross-check.
  - **Ideal statevector estimator in Phase 3.** It tests the algorithm separately from shot noise.
  - **θ = 0 (Hartree–Fock) as the starting point.**
  - **Shot-noise experiments deferred to Phase 4.** A test showed noisy runs can stop early or report
    a biased (too low) minimum. They need careful treatment, such as re-evaluating the final angles.
- **Verification:**
  - All 3 optimizers land within 1e-7 mHa of the exact energy.
  - The VQE state has fidelity 1.0000000000 with the exact ground-state eigenvector.
  - Our optimal angles match the library VQE result.
  - The notebook runs in a fresh kernel with no errors or stderr output.
- **Concepts explained by AI:**
  - Estimator primitives and PUBs
  - ISA circuits and `apply_layout`
  - gradient-based vs gradient-free optimizers
  - why the number of evaluations is the real hardware cost
  - the ground state as 98.76% |0101⟩ + 1.24% |1010⟩, and why that admixture is correlation
  - state fidelity
- **Team ownership:** _(to fill in)_

## Entry 5: Phase 4 notebook (shot noise, noisy VQE, potential-energy curve, conclusions) (2026-11-13)
- **Task:** Make the study realistic (finite measurement shots) and add chemistry insight (bond breaking).
- **AI contribution:**
  - Wrote sections 16–18, the Conclusions, and the final results cell:
    - shot-noise statistics with 1/√N scaling;
    - noisy VQE comparing SLSQP, COBYLA and SPSA (3 seeded trials each);
    - an H₂ potential-energy curve over 25 bond lengths, with HF/FCI/VQE comparison and the optimal θ₂
      plotted against bond length;
    - limitations and extensions.
  - Added "How to Run" and "Results Summary" sections to the README.
- **Investigation by AI (important for Q&A):** The AI read the source of `qiskit_aer.primitives.EstimatorV2`
  and found two problems:
  - It does **not** sample shots. It adds Gaussian noise N(E, precision) to the exact value.
  - With a fixed `seed_simulator` it adds the **same** noise on every call.

  The notebook therefore uses `qiskit.primitives.BackendEstimatorV2` on `AerSimulator`. That combination
  samples real bitstrings, and a new seed per call keeps the noise independent and the notebook reproducible.
- **Design decisions made by the AI:**
  - **PySCF FCI as the reference along the curve, not the lowest eigenvalue of the qubit Hamiltonian.**
    In Fock space that eigenvalue could come from a different electron number or spin. A check showed
    both agree here.
  - **The same ansatz at every geometry.** The excitation operators do not depend on the bond length.
  - **Warm-started SLSQP along the curve.**
  - **Seeded SPSA** (`algorithm_globals.random_seed`).
  - **Noisy runs judged by "true" error.** The final angles are re-evaluated exactly, which avoids the
    winner's-curse bias.
- **Verification:**
  - Ran the whole notebook twice in fresh kernels: identical outputs, no errors, no stderr, ~80 s.
  - Checked every Markdown claim against the printed numbers:
    - SLSQP fails at 400–800 mHa.
    - COBYLA lands at 0.85–3.1 mHa.
    - SPSA lands at 0.01–0.09 mHa.
    - HF error goes from ~8 to 278 mHa along the curve.
    - Equilibrium bond length is 0.75 Å on the grid.
    - θ₂ → −π/4 as the bond stretches.
- **Concepts explained by AI:**
  - shots and measurement groups (qubit-wise commuting)
  - 1/√N statistical scaling
  - why finite-difference gradients fail under noise
  - how SPSA works
  - the winner's curse on reported minima
  - static correlation and why HF fails at bond breaking
  - the meaning of θ₂ → −π/4
  - basis-set limitations vs algorithm limitations
- **Team ownership:** _(to fill in)_

## Entry 6: Notebook clean-up, explanations moved to docs/ (2026-11-13)
- **Task:** Keep only minimal Markdown in `challenge.ipynb` and move the detailed explanations to separate files.
- **AI contribution:**
  - Wrote a script that copied every explanatory Markdown cell **verbatim** into 4 files:
    `docs/01_molecule_and_hamiltonian.md`, `02_ansatz.md`, `03_running_vqe.md` and
    `04_noise_and_bond_curve.md`.
  - Replaced the notebook Markdown with short section headers and 1–2 line summaries that link to the
    docs. The notebook went from 58 to 49 cells, and its Markdown from ~500 lines to ~67.
  - Removed the "Reading the output" cells from the notebook; they now live in the docs.
  - Did not change any code cell.
- **Verification:** The notebook was re-executed in a fresh kernel with no errors and no stderr output.
- **Team ownership:** _(to fill in)_

## Entry 7: Code-only notebook for qBraid, tested in a fresh environment (2026-11-13)
- **Task:** Remove all Markdown cells from `challenge.ipynb` (keep comments only) so it runs easily on qBraid.
- **AI contribution:**
  - Turned each Markdown cell into a short comment header (`# ---- Section N: ... ----`) at the top of
    the code cell it described. The notebook now has 26 code cells and 0 Markdown cells.
  - Added a first cell that installs any missing packages (pinned versions) into the running kernel.
  - Switched the kernel setting to the standard `python3`.
  - Did not change any code-cell logic. The full explanations remain in `docs/`.
- **Verification:**
  - **Local venv:** ran in a fresh kernel with no errors and no stderr output.
  - **Fresh environment:** created an empty Python 3.10 environment with no qiskit, pyscf or even numpy.
    The notebook ran headlessly there: the first cell installed everything, and all 26 cells ran with
    no errors, no warnings and no kernel restart (~8.5 min including installs).
  - **Reproducibility:** results were identical in both environments, including the seeded noisy runs.
  - The README's noisy-SPSA figure was updated to the current run (mean ≈ 0.03 mHa; it was 0.04 in an
    earlier notebook version).
- **Team ownership:** _(to fill in)_
