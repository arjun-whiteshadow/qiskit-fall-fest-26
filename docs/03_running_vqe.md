# Phase 3: Running VQE

*Detailed explanations for sections 11–15 of [`challenge.ipynb`](../challenge.ipynb). Paragraphs titled "Reading the output/plot" refer to the output of the code cell just above that point in the notebook.*


## 11. Measuring energy with Qiskit's `Estimator` primitive

In Qiskit 2.x, the quantum half of VQE is handled by an **Estimator primitive**. You give it a *PUB*
(Primitive Unified Bloc), which is a tuple `(circuit, observable, parameter_values)`, and it returns
the expectation value $\langle\psi(\vec\theta)|\hat H|\psi(\vec\theta)\rangle$.

| Primitive | What it does | When we use it |
|---|---|---|
| `qiskit.primitives.StatevectorEstimator` | Exact, noise-free simulation (as if we had infinitely many shots) | **Phase 3**: check the algorithm itself is correct |
| `qiskit_aer.primitives.EstimatorV2` | Simulates a finite number of measurement shots | Phase 4: realistic shot noise |

**ISA circuits.** Real backends accept only the gates they physically support (their *Instruction
Set Architecture*). So we first **transpile** the ansatz for the Aer simulator backend, and
`apply_layout` re-labels the Hamiltonian's qubits to match. Every estimator in this notebook then
uses the same ISA circuit.

## 12. Choosing the classical optimizer and running VQE

The optimizer is the classical half of VQE. Each time it proposes angles $\vec\theta$, the estimator
answers with $E(\vec\theta)$, and the optimizer uses that answer to move "downhill".

We compare three standard optimizers from `scipy.optimize.minimize`, all starting from the **HF
point θ = (0, 0, 0)**:

| Optimizer | Type | How it decides where to go |
|---|---|---|
| **SLSQP** | gradient-based | Estimates the slope with finite differences (+ curvature updates). Very efficient when energies are exact. |
| **L-BFGS-B** | gradient-based | Quasi-Newton: builds an approximation of the curvature from past gradients |
| **COBYLA** | gradient-free | Fits a simple linear model to recent points. Needs more evaluations, but is more robust when energies are noisy (Phase 4). |

**What we measure:**
- the final error versus the exact energy;
- the **number of energy evaluations** (`nfev`). On real hardware every evaluation costs thousands of
  shots, so fewer evaluations means a cheaper experiment.

**Why start at θ = 0?** It is the HF state, which is already within ~20 mHa of the answer. A
physically motivated start avoids wandering around the landscape.

## 13. Convergence: how fast does each optimizer get there?

- **Left:** total energy versus the number of energy evaluations.
- **Right:** the *error* on a **log scale**, with the chemical-accuracy threshold as a red line. Every
  point below the red line is chemically accurate.

**Reading the plot**
- **SLSQP and L-BFGS-B** converge in a handful of iterations. With exact energies, finite-difference
  gradients are reliable, and for H₂ the landscape near HF is a smooth, almost quadratic bowl.
- **COBYLA** uses no gradients, so it explores more and needs several times as many evaluations,
  but it still reaches the same answer.
- No evaluation ever goes **below** the exact energy, as the variational principle requires.
- *Plot details:* a few early points shoot above the left plot's range. These are large trial steps
  and finite-difference probes, which the optimizer then rejects. On the right, the curves flatten
  near 10⁻⁹ mHa. That is the floor we set for the log scale at the limit of floating-point precision,
  not an optimizer limitation.

## 14. What did VQE find? Interpreting the optimal state

A number that matches is good, but we should also check that VQE found the **right quantum state**:

1. **Optimal angles:** we expect θ₀ ≈ θ₁ ≈ 0 (singles unused, Brillouin's theorem) and a small negative θ₂.
2. **Composition:** which basis states make up $|\psi(\vec\theta^*)\rangle$, and with what probability?
3. **Fidelity** $F = |\langle \psi_{\text{exact}} | \psi_{\text{VQE}} \rangle|^2$ with the exact ground
   state from diagonalisation. $F = 1$ means the states are identical.

**Physical interpretation**
- θ₀ and θ₁ come out as **zero**: the optimizer independently "discovered" Brillouin's theorem.
- The ground state is about **98.7% |0101⟩** (both electrons in the bonding orbital σg) and **1.3%
  |1010⟩** (both in the antibonding orbital σu*).
- That small 1.3% admixture is the *electron correlation*. By sometimes occupying the antibonding
  orbital together, the electrons avoid each other a little and lower the energy by ~20 mHa.
- A fidelity of essentially 1 means VQE found the *exact* ground-state wavefunction, not just a state
  that happens to have the right energy.

## 15. Cross-check with Qiskit's built-in `VQE` class

Our VQE loop above is written by hand so that every step is visible. As an independent check, we run
the same ansatz and Hamiltonian through `qiskit_algorithms.VQE`, the library implementation, and
confirm it agrees.

### Phase 3 summary
- On an ideal (noise-free) simulator, **VQE with the UCCSD ansatz reproduces the exact ground-state
  energy of H₂**. The error is many orders of magnitude below chemical accuracy, and essentially 100% of
  the correlation energy is recovered.
- Two independent checks agree: **the state fidelity ≈ 1** and the **library `VQE`** result.
- SLSQP is the most efficient optimizer here (fewest evaluations); COBYLA is slower but gradient-free.

**Next (Phase 4):** make it realistic. Real quantum computers estimate energies from a **finite number of
measurement shots**, which adds statistical noise. We will study how shot noise affects accuracy and
which optimizer copes best. We will also scan the bond length to draw H₂'s **potential-energy curve**.
