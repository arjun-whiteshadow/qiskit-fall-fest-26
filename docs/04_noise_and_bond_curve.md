# Phase 4: Shot noise, noisy optimizers and the bond-breaking curve

*Detailed explanations for sections 16–18 + Conclusions of [`challenge.ipynb`](../challenge.ipynb). Paragraphs titled "Reading the output/plot" refer to the output of the code cell just above that point in the notebook.*


## 16. Shot noise: what a real quantum computer actually measures

So far the estimator returned *exact* expectation values. A real quantum computer cannot do that:
- Measuring a qubit gives a **random 0 or 1**, so every energy is an *average over repeated runs*
  called **shots**.
- Each Pauli term needs its own measurement basis. Terms that **qubit-wise commute** can be measured
  together, so the Hamiltonian is split into **measurement groups**.
- Averaging $N$ shots leaves a statistical error that shrinks like $1/\sqrt{N}$. To get **10× more
  precise** you need **100× more shots**.

**How we simulate this.** We use `BackendEstimatorV2` running on the `AerSimulator`. It really
**samples bitstrings**, shot by shot, in each measurement basis, exactly as hardware would.
- `precision` sets shots per group: shots = $\lceil 1/\text{precision}^2 \rceil$.
- We give the simulator a **new seed for every call**. The notebook stays reproducible, but every
  measurement still has independent noise.

> **Why not `qiskit_aer.primitives.EstimatorV2`?** We read its source code. It computes the exact value
> and adds Gaussian noise $\mathcal N(E, \text{precision})$, which is an *approximation* of shot noise.
> With a fixed seed it also adds **the same noise** on every call. We prefer real sampling.

*Still idealised:* the gates themselves are perfect (no device noise). We isolate one error source at a time.

**Experiment:** keep the angles fixed at the optimal $\vec\theta^*$ from Phase 3 and repeat the
energy measurement **30 times** at each shot count. The spread of those 30 values is the shot noise.

**Reading the plots**
- The noise follows the **1/√N law** closely, a signature of independent random sampling.
- To keep a *single* energy measurement reliably inside chemical accuracy, we need on the order of
  **10⁴–10⁵ shots per group**. Even the tiny H₂ problem demands a large shot budget, which is one of
  VQE's main practical costs.
- Individual measurements can land **below** the exact energy. That does **not** break the variational
  principle: noise can push an *estimate* below $E_0$, but the *true* energy of the state cannot go below it.

## 17. VQE under shot noise: which optimizer survives?

Now we run the **full VQE loop** with noisy energies (10,000 shots per group per evaluation), starting
from HF. We compare:

| Optimizer | Expectation under noise |
|---|---|
| **SLSQP** | Gradients come from *differences* of nearby noisy energies. With a step of ~10⁻⁸ rad, the true difference is tiny and the noise is huge, so the gradient becomes garbage. **Expected to fail.** |
| **COBYLA** | Gradient-free, so it tolerates noise. It may stop early because noise hides small improvements. |
| **SPSA** (*Simultaneous Perturbation Stochastic Approximation*) | Designed for noisy objectives. Each step perturbs **all** angles at once by a random ±δ and uses just **2 evaluations**; step sizes shrink over time to average out noise. The standard choice on real hardware. |

**Two numbers per run:**
- **Reported energy:** the optimizer's own (noisy) best value. This is what an experimenter sees.
- **True energy:** we re-evaluate the final angles *exactly*. This tells us how good the state found really is.

Each optimizer runs **3 times with different seeds**, so we are not judging from a single lucky or unlucky run.

**Reading the results**
- **SLSQP fails dramatically.** Its finite-difference gradients are dominated by noise, the angles
  run off to huge values, and the final state is *worse than Hartree–Fock*. This is the clearest
  lesson of the experiment: **an optimizer that is the best on a noise-free simulator can be the worst
  on real hardware.**
- **COBYLA** is noise-tolerant but tends to **stop early**: once noise hides further improvement it
  declares convergence. It lands near (and sometimes outside) chemical accuracy.
- **SPSA** reliably reaches chemical accuracy. Its random simultaneous perturbations and shrinking
  steps average the noise out over many cheap iterations. That reliability costs more evaluations
  and therefore more shots.
- **Reported energies are not trustworthy on their own.** Some optimizers report values *below* the
  exact energy (a "winner's curse": the minimum of many noisy values is biased low). On real hardware we
  would re-measure the final angles with many more shots to get an honest estimate.

## 18. The potential-energy curve: breaking the H₂ bond

The bond length 0.735 Å was an input. A real test of a quantum-chemistry method is whether it describes
the molecule at **every** geometry, including when the bond is **stretched and breaks**.

For each bond length $R$ we:
1. rebuild the molecule with PySCF and map its new Hamiltonian with Jordan–Wigner;
2. compute HF and the exact **FCI** energy (PySCF);
3. run (ideal) VQE with SLSQP.

**Two useful details:**
- **The ansatz does not change with geometry.** The excitation operators depend only on how many
  orbitals and electrons there are, not on the bond length. Only the Hamiltonian changes, so
  `ansatz_isa` is reused.
- **Warm start:** each VQE starts from the optimal angles of the previous bond length. Neighbouring
  geometries have similar ground states, so this saves evaluations. This is standard practice in scans.

**Physics to watch:** as the bond stretches, the two electrons should end up one on each H atom. HF
forces both electrons into the *same* σg orbital, so it wrongly keeps ~50% "both electrons on one atom"
(ionic H⁺H⁻) character. HF therefore gets **worse and worse** at long bond lengths (*static
correlation*). UCCSD can fix this by mixing |0101⟩ and |1010⟩ equally.

**Reading the plots**
- **Left:** VQE (dots) lies on the exact curve everywhere. The minimum of the curve gives the
  equilibrium bond length, close to the experimental 0.741 Å. HF is fine near equilibrium but rises far
  too high when the bond is stretched: it predicts the wrong energy for two separate H atoms.
- **Middle:** the HF error grows from ~8 mHa to **~280 mHa** as the bond breaks, while the VQE error
  stays many orders of magnitude below chemical accuracy at every geometry. The VQE values near 10⁻⁹ mHa
  are the optimizer's numerical tolerance, effectively zero.
- **Right:** the optimal θ₂ explains *why*. Near equilibrium a small rotation (a ~1% admixture of |1010⟩)
  is enough. As the bond stretches, θ₂ heads towards **−π/4**, an **equal mix** of |0101⟩ and |1010⟩.
  That combination cancels the unphysical ionic H⁺H⁻ part and leaves one electron on each atom.
  A single Slater determinant (HF) can never do this. VQE learns it automatically.
- **Bond energy:** our estimate is in the right ballpark of experiment but not exact. That is a
  limitation of the tiny **STO-3G basis**, not of VQE: VQE reproduces FCI *within the basis we gave it*.

# Conclusions

## What we did
1. Built the **H₂ molecular Hamiltonian** with PySCF and mapped it to a **4-qubit, 15-term** Pauli
   Hamiltonian with the Jordan–Wigner transformation.
2. Established an **exact reference**, cross-checked three independent ways.
3. Built and validated a **3-parameter UCCSD ansatz** without deprecated components.
4. Ran **VQE** with several optimizers and recovered **100% of the correlation energy** with state
   fidelity ≈ 1.
5. Studied **shot noise** (1/√N scaling) and **optimizer robustness**, then reproduced the full
   **potential-energy curve**, including bond breaking where Hartree–Fock fails.

## Key insights
- The ansatz must be able to *represent* the answer. UCCSD captures exactly the physics H₂ needs:
  the double excitation.
- **Noise changes which optimizer is best.** SLSQP wins without noise and fails with it; SPSA is the
  robust choice for hardware.
- **Verification is essential.** Every quantum result in this notebook is checked against a classical answer.

## Limitations (honest assessment)
- **Minimal basis (STO-3G).** The *exact* answer in this basis still differs from experiment.
  Larger basis sets need more qubits.
- **No hardware noise model.** We simulated shot noise only; real devices also have gate and readout
  errors. With 56 CNOTs, the circuit would need error mitigation on today's hardware.
- **H₂ is classically easy.** Exact diagonalisation is trivial at 4 qubits. The value here is in a
  verified, well-understood pipeline, not quantum advantage.

## Possible extensions
- Qubit reduction (Parity mapping with 2-qubit reduction / symmetry tapering: 4 → 1–2 qubits)
- Device noise models (`qiskit-ibm-runtime` fake backends) plus error mitigation (e.g. zero-noise extrapolation)
- Larger molecules (LiH, BeH₂) with active-space reduction; adaptive ansätze (ADAPT-VQE)
