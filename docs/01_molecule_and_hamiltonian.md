# Phase 1: Molecule, Hamiltonian and exact baseline

*Detailed explanations for sections 0–4 of [`challenge.ipynb`](../challenge.ipynb). Paragraphs titled "Reading the output/plot" refer to the output of the code cell just above that point in the notebook.*

## Goal
Find the **lowest possible energy** (the *ground-state energy*) of a hydrogen molecule, H₂, using the
**Variational Quantum Eigensolver (VQE)**, and prove the answer is right by comparing it with an
exact classical calculation.

## Why does this matter?
The ground-state energy of a molecule decides its shape, how strongly its atoms are bound and how it
reacts. Computing it exactly on a classical computer gets exponentially expensive as molecules grow.
Quantum computers may handle this better because a register of qubits can naturally represent the
quantum state of electrons.

## Roadmap of the project
| Phase | What we do | Explanation file |
|---|---|---|
| **1** | Define H₂ in PySCF → build its Hamiltonian → map to qubits → **exact classical answer** | this file |
| 2 | Build the UCCSD ansatz (parameterised quantum circuit) | [02_ansatz.md](02_ansatz.md) |
| 3 | Run VQE (quantum circuit + classical optimizer), verify against exact | [03_running_vqe.md](03_running_vqe.md) |
| 4 | Shot noise, noisy optimizers, bond-breaking curve, conclusions | [04_noise_and_bond_curve.md](04_noise_and_bond_curve.md) |

> **Units:** energies are in **Hartree (Ha)**, the natural unit of quantum chemistry
> (1 Ha ≈ 27.211 eV ≈ 627.5 kcal/mol). *Chemical accuracy* is a target error of
> **1.6 mHa** (= 1 kcal/mol); below it, a computed energy is accurate enough to predict chemistry.

## 0. Setup: imports and versions
Qiskit's API changes between releases, so we **print every library version**. Anyone re-running this
notebook can then check they have the same environment (see `requirements.txt`).

| Library | Role in this notebook |
|---|---|
| `pyscf` | Classical quantum-chemistry engine: computes the integrals that define the H₂ Hamiltonian |
| `qiskit_nature` | Bridges chemistry and Qiskit: turns PySCF output into a fermionic Hamiltonian and maps it onto qubits |
| `qiskit` | Core quantum-circuit and operator library (`SparsePauliOp`) |
| `qiskit_algorithms` | Ready-made algorithms: `NumPyMinimumEigensolver` (exact) and later `VQE` |
| `numpy` | Linear algebra for our independent cross-check |

## 1. Define the H₂ molecule with PySCF

To describe a molecule we must choose four things:

1. **Geometry**: where the nuclei sit. H₂ has two hydrogen nuclei on the z-axis, **0.735 Å** apart.
   That is close to H₂'s experimental equilibrium bond length (≈ 0.741 Å), the distance where the
   molecule is most stable.
2. **Charge = 0**: a neutral molecule, so 2 protons and **2 electrons**.
3. **Spin = 0**: PySCF's `spin` is 2S, the number of unpaired electrons. Both electrons are paired
   (one spin-up ↑, one spin-down ↓), which is the *singlet* ground state.
4. **Basis set = STO-3G**: electrons live in *orbitals*, and a basis set is the menu of mathematical
   functions used to build them. STO-3G is the smallest standard basis: **one 1s function per H atom**.
   Two atoms give 2 *spatial orbitals*, which combine into
   - a **bonding** orbital σg (lower energy, electrons pulled between the nuclei), and
   - an **antibonding** orbital σu* (higher energy).

**Behind the scenes, the `PySCFDriver`:**
- runs a **Hartree–Fock (HF)** calculation, a mean-field approximation in which each electron feels
  only the *average* repulsion of the others;
- uses the HF molecular orbitals to compute the **one- and two-electron integrals**. These numbers are
  exactly what the Hamiltonian needs.

HF misses *electron correlation* (electrons actively avoiding each other). The gap between the HF
energy and the exact energy is the **correlation energy**, and recovering it is the whole point of VQE.

**Reading the output**
- **2 spatial orbitals × 2 spin directions = 4 spin orbitals**, and each spin orbital will become one qubit.
- **Nuclear repulsion** is the classical Coulomb repulsion between the two protons. The nuclei are
  treated as fixed (the *Born–Oppenheimer approximation*), so this term is just a constant that we
  add back at the end.
- The **Hartree–Fock energy** is our starting point. The true answer must be *lower* (variational principle).

## 2. The electronic Hamiltonian (second quantisation)

The **Hamiltonian** $\hat H$ is the operator for the total energy, and its lowest eigenvalue is the
ground-state energy. In *second quantisation* it is written with operators that **create** ($a_p^\dagger$)
or **destroy** ($a_q$) an electron in spin orbital $p$ or $q$:

$$
\hat H_{\text{el}} \;=\; \sum_{pq} h_{pq}\, a_p^\dagger a_q
\;+\; \tfrac12 \sum_{pqrs} h_{pqrs}\, a_p^\dagger a_q^\dagger a_r a_s
$$

- $h_{pq}$ are **one-electron integrals**: kinetic energy plus attraction to the nuclei.
- $h_{pqrs}$ are **two-electron integrals**: electron–electron repulsion.
- PySCF computed all of these numbers in the previous cell.

The full molecular energy is $E_{\text{total}} = E_{\text{electronic}} + E_{\text{nuclear repulsion}}$.

## 3. Fermion → qubit mapping (Jordan–Wigner)

Quantum computers apply **Pauli operators** ($I, X, Y, Z$) to qubits, not fermionic operators, so the
Hamiltonian has to be translated.

**The Jordan–Wigner (JW) mapping** is the most direct translation:
- **One qubit per spin orbital.** $|1\rangle$ = orbital occupied, $|0\rangle$ = empty.
- Electrons are **fermions**: swapping two of them flips the sign of the wavefunction (the root of the
  Pauli exclusion principle). JW keeps track of that sign with a *string of Z operators*:

$$
a_j^\dagger \;=\; \Big(\prod_{k<j} Z_k\Big)\,\frac{X_j - iY_j}{2}
$$

After mapping, $\hat H$ becomes a weighted sum of Pauli strings,
$\hat H = \sum_i c_i P_i$. A quantum computer can measure each $P_i$ directly.

**Qubit layout (Qiskit Nature convention):** qubits 0–1 hold the **spin-up (α)** orbitals σg and σu*,
and qubits 2–3 hold the **spin-down (β)** orbitals. Qiskit prints Pauli strings
**right-to-left**, so the rightmost character acts on qubit 0.

*Why JW?* It is the simplest mapping to explain and verify. Alternatives such as the Parity or
Bravyi–Kitaev mappings can save qubits or shorten Z-strings; we may compare them later.

**Reading the output**
- **15 Pauli terms on 4 qubits.** `IIII` is a constant energy shift.
- Terms built only from **I and Z** are *diagonal*: they just count which orbitals are occupied
  (orbital energies plus Coulomb repulsion between occupied orbitals).
- The **XXYY / YYXX / XXXX / YYYY** terms are the interesting ones. They move **both electrons
  together** from the bonding to the antibonding orbital. This *double excitation* is exactly the
  electron correlation that Hartree–Fock misses, and the reason VQE can beat HF.

## 4. Exact classical baseline (our "answer key")

Before trusting a quantum algorithm we need the **right answer**. H₂ in STO-3G needs only 4 qubits, so
the Hamiltonian is a 2⁴ × 2⁴ = **16 × 16 matrix**, small enough to **diagonalise exactly** on a laptop.

We compute the exact ground-state energy **three independent ways**. If all three agree, we can trust
the reference completely:

| Method | What it does |
|---|---|
| **A. `NumPyMinimumEigensolver`** (Qiskit) | Exact diagonalisation of the qubit Hamiltonian. `GroundStateEigensolver` adds the nuclear repulsion for us. |
| **B. `numpy.linalg.eigvalsh`** | We build the 16×16 matrix ourselves and take its smallest eigenvalue. Checks the Qiskit tooling. |
| **C. PySCF FCI** | *Full Configuration Interaction*: exact answer computed directly from chemistry, with **no qubit mapping**. Checks the mapping itself. |

> **Caveat (honest scaling note):** exact diagonalisation costs grow as 2^(qubits). It is trivial here
> but impossible for large molecules. That cost is the motivation for VQE.

### Phase 1 summary
| Quantity | Value |
|---|---|
| Qubits (JW mapping) | 4 |
| Pauli terms in $\hat H$ | 15 |
| Hartree–Fock energy | ≈ −1.11700 Ha |
| **Exact ground-state energy** | **≈ −1.13731 Ha** |
| Correlation energy that VQE must recover | ≈ −20.3 mHa |

Key takeaways:
- HF misses about **20 mHa**, more than 12× the chemical-accuracy threshold, so a good VQE must
  capture electron correlation.
- `E_exact` is stored and will be the yardstick for the VQE result in the next phases.

**Next (Phase 2):** start from the HF state |0101⟩ and build a *parameterised ansatz* circuit that can
also reach the doubly excited state, the ingredient HF is missing.
