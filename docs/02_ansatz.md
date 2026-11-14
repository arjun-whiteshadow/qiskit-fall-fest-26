# Phase 2: Building the UCCSD ansatz

*Detailed explanations for sections 5–10 of [`challenge.ipynb`](../challenge.ipynb). Paragraphs titled "Reading the output/plot" refer to the output of the code cell just above that point in the notebook.*


## 5. The idea behind VQE

**The variational principle.** For *any* quantum state $|\psi\rangle$, the measured average energy can
never be below the true ground-state energy:

$$
E(\vec\theta) \;=\; \langle \psi(\vec\theta)\,|\,\hat H\,|\,\psi(\vec\theta)\rangle \;\ge\; E_0
$$

So if we prepare a family of states $|\psi(\vec\theta)\rangle$ controlled by tunable angles
$\vec\theta$, and **lower** the measured energy by adjusting $\vec\theta$, we can only approach
$E_0$ from above. We can never undershoot it.

**VQE is a hybrid loop:**
1. **Quantum computer:** prepare $|\psi(\vec\theta)\rangle$ with a parameterised circuit (the **ansatz**)
   and measure $E(\vec\theta)$.
2. **Classical computer:** an optimizer proposes better angles $\vec\theta$.
3. Repeat until the energy stops decreasing.

The **ansatz** (German for "approach" or "educated guess") is the most important design choice. If the
true ground state cannot be reached by the circuit, no optimizer can find it.

| Ansatz family | Idea | Pros | Cons |
|---|---|---|---|
| **UCCSD** (Unitary Coupled Cluster Singles & Doubles) | Built from the chemistry: moves electrons between orbitals | Physically meaningful, few parameters, keeps electron number fixed | Deep circuits on larger molecules |
| Hardware-efficient (e.g. `efficient_su2`) | Generic layers of rotations + CNOTs | Shallow, hardware-friendly | Many parameters, no physics built in, can get stuck in flat landscapes ("barren plateaus") |

**Our choice: UCCSD.** For H₂ it needs only **3 parameters**, and every one of them has a clear
physical meaning that we can defend.

*We use exact statevector simulation in this phase to understand the ansatz. Phase 3 runs the real VQE loop.*

## 6. Step 1 of the ansatz: the Hartree–Fock starting state

VQE needs a good starting point, and the obvious one is the **Hartree–Fock state**: both electrons
sit in the lowest (bonding) orbital σg, one spin-up and one spin-down.

With our Jordan–Wigner qubit layout:

| Qubit | Spin orbital | Occupied in HF? |
|---|---|---|
| q0 | σg, spin-up (α) | **yes → X gate** |
| q1 | σu*, spin-up (α) | no |
| q2 | σg, spin-down (β) | **yes → X gate** |
| q3 | σu*, spin-down (β) | no |

All qubits start in $|0\rangle$, so two **X (NOT) gates** on q0 and q2 prepare HF. Qiskit writes
bitstrings as q3 q2 q1 q0, which gives **|0101⟩**.

> We build this two-gate circuit by hand instead of using Qiskit Nature's `HartreeFock` class. That class
> is built on a component deprecated in Qiskit 2.1, and the hand-built version is easier to explain.

**Check:** the energy of this state must equal PySCF's Hartree–Fock energy from Phase 1.

## 7. Step 2 of the ansatz: excitations (where correlation comes from)

HF misses the correlation energy because it keeps the electrons frozen in σg. UCCSD lets them move
by adding **excitations**:

- **Single excitation**: one electron hops σg → σu* (keeping its spin).
- **Double excitation**: *both* electrons hop σg → σu* together.

The **UCCSD unitary** applies each excitation with a tunable strength $\theta_k$:

$$
|\psi(\vec\theta)\rangle \;=\; e^{\,\sum_k \theta_k\,(\hat T_k - \hat T_k^\dagger)}\;|\text{HF}\rangle
$$

- Subtracting $\hat T_k^\dagger$ makes the exponent anti-Hermitian, so the operation is **unitary** (a
  valid quantum gate).
- With $\theta_k = 0$ the circuit does nothing, so we start exactly at HF.

Each generator $i(\hat T_k - \hat T_k^\dagger)$ is mapped to Pauli strings with the **same Jordan–Wigner
mapper** used for the Hamiltonian. This consistency is essential.

**Reading the output.** 3 excitations, therefore **3 parameters**:
- θ₀: single α excitation (qubit 0 → 1); θ₁: single β excitation (qubit 2 → 3)
- θ₂: **double excitation**, both electrons jump (qubits 0,2 → 1,3), giving 8 Pauli strings

Notice that the double excitation uses the same **XX/YY on all 4 qubits** structure as the
correlation terms in the Hamiltonian (`XXYY`, `YYXX`, ...). The ansatz is built to reach exactly what
HF is missing.

## 8. Step 3: assemble the full UCCSD circuit

We start from the HF circuit and append one **`PauliEvolutionGate`** per excitation. Each gate
implements $e^{-i\theta_k G_k}$ and has its own tunable angle $\theta_k$. Building the circuit by
hand keeps every step visible.

*Is this exact?* Qiskit implements a Pauli-sum exponential as a product of single-Pauli
exponentials. That is exact here because, within each generator, all the Pauli strings **commute**
with each other.

We also **transpile** to a typical hardware gate set (CNOT + single-qubit rotations). That tells us
how expensive the circuit would be on a real device, where **CNOT count** is the main source of error.

## 9. Validating the ansatz before using it

We check two things before running VQE:

1. **θ = 0 must give back HF exactly.** If not, the circuit is wired incorrectly.
2. **Our hand-built UCCSD must match Qiskit Nature's built-in `UCCSD` class.** We compare energies at
   random angles. The library class is used *only* as a reference, inside a block that silences its
   known Qiskit 2.1 deprecation and scipy notices.

## 10. Seeing the energy landscape

Before handing the problem to an optimizer, we **look at it**. We sweep only the double-excitation
angle θ₂ (keeping θ₀ = θ₁ = 0) and compute the exact energy at each value.

**Why might the single excitations not matter for H₂?** H₂'s ground state is symmetric, and singles
from the HF state break that symmetry. *Brillouin's theorem* says singles do not couple directly to
the HF state. We therefore expect the minimum to come almost entirely from θ₂, and the plot below
tests that.

**Reading the plot**
- **Left panel:** the energy is a smooth sinusoid that repeats every **π**. The double excitation
  rotates the state within a 2-dimensional space spanned by |0101⟩ (HF) and |1010⟩ (both electrons
  excited). Rotating by an extra π only flips the overall sign of the state, which has no physical
  effect, so the two minima are the *same* physical state.
- **Right panel (zoom):** at θ₂ = 0 the curve passes through the **HF energy** (orange dot), as
  expected. Moving to a small **negative** θ₂ lowers the energy down to the **exact line**. A small
  admixture of |1010⟩ is all H₂ needs.
- The curve **never goes below the exact line**, which is the variational principle in action.
- One parameter on a coarse grid already lands within a fraction of a mHa of the exact answer. That
  confirms our ansatz *can* represent the ground state, so the remaining job of VQE is optimisation.

### Phase 2 summary
| Item | Value |
|---|---|
| Ansatz | UCCSD = HF state + 2 single + 1 double excitation |
| Parameters | 3 |
| Hardware cost (transpiled) | 56 CNOTs; full counts and depth printed in section 8 |
| Validation | θ = 0 reproduces HF; matches the Qiskit Nature `UCCSD` class to < 1e-8 Ha |
| Landscape | The minimum along θ₂ reaches the exact energy, so the ansatz is expressive enough |

**Next (Phase 3):** run the real VQE loop. Qiskit's `Estimator` primitive will measure the energy,
and a classical optimizer will tune all 3 angles simultaneously, starting from θ = 0 (Hartree–Fock).
