# Speaker Script (5 minutes) and Q&A Prep

For the team only, not part of the submission. Practise out loud at least twice with a timer.
The brochure allows 7 minutes, so 5 minutes leaves you a safety margin.

---

## Speaker script (~650 words ≈ 5 min)

### Slide 1: Title (15 s)
"Hi, we're Team Cdevi Code. I'm Arjun, this is Shanti. We took Challenge 1, VQE, at the
Intermediate level. In short: we used a quantum algorithm to find the energy of a molecule,
and then checked that the answer is actually right."

### Slide 2: The question (40 s)
"Every molecule settles into its lowest energy, and that number decides how it bonds and reacts.
The problem is that for normal computers, the work doubles with every extra orbital, every extra
'seat' an electron can sit in. So big molecules are out of reach. Qubits follow the same quantum
rules as electrons, which is why people think quantum computers can help.
We picked the simplest molecule, hydrogen: two atoms, two electrons. Our goal was to find its lowest
energy with VQE, and be within 1.6 milli-Hartree of the truth. Chemists call that 'chemical accuracy'."

### Slide 3: Our recipe (50 s)
"We did it in four steps. One: describe the molecule with PySCF. That also gives us the 'old method',
Hartree–Fock, which is fast but approximate. Two: translate the energy rules into qubit language.
Each electron seat becomes a qubit, so we need 4 qubits. Three: before trusting anything quantum,
we got the answer key. We computed the exact energy three different ways and all three agreed.
Four: the VQE loop. Think of a radio. The quantum circuit makes a guess, we measure its energy, the
laptop turns the knobs to lower it, and we repeat. Physics guarantees we can never go below the true
answer, so lower is always better."

### Slide 4: The guess circuit (40 s)
"Our circuit starts from the old method's answer: both electrons in the low 'bonding' orbital.
Then we add three knobs from chemistry, called UCCSD. Two knobs let one electron jump up; one knob
lets both electrons jump up together. We checked it: with all knobs at zero, we get the old answer
exactly. The plot shows turning just the 'both jump' knob already takes us from the old answer,
the orange line, down to the true answer, the green line."

### Slide 5: Result (40 s)
"And it works. VQE starts at the old answer and walks downhill to the exact one: minus 1.137306
Hartree, the same to every digit we print. It recovers 100% of the energy the old method misses.
The bar at the bottom shows what VQE found: 98.8% of the time both electrons sit in the low orbital,
and 1.2% of the time they jump up together. That tiny 1.2% is the electrons dodging each other, and
it is exactly what the old method leaves out."

### Slide 6: Noise (45 s)
"But a real quantum computer doesn't hand you an energy. It gives random zeros and ones, so you
average many repeated runs, called shots. We simulated that. More shots means less noise, but you
need about ten to a hundred thousand shots to be accurate enough.
Then the surprise: SLSQP, the fastest optimizer without noise, completely fails with noise. It ends up
worse than the old method. COBYLA gets close but stops early. SPSA, which is designed for noise, was
the best in every run. So the best method on paper isn't always the best in real life."

### Slide 7: Bond breaking (35 s)
"Finally, we pulled the molecule apart, 25 different distances. VQE, the blue dots, sits on the exact
curve everywhere. The old method is fine near the normal bond length but goes badly wrong as the bond
breaks, off by up to 278 milli-Hartree. Our curve's lowest point is at 0.75 angstrom; the measured value
is 0.741."

### Slide 8: What we learned (35 s)
"So: VQE gave the exact energy for hydrogen, checked three ways, even when the bond breaks. Noise
changes which optimizer you should use. Things that went wrong: the newest Qiskit crashed on our Python,
so we pinned a working version; and one noise simulator turned out not to do real sampling, so we
switched. Our limits are a tiny orbital set, no hardware gate errors, and H₂ is easy for laptops.
We used Claude as a coding assistant, and we checked every result against the exact answer.
Thank you, we're happy to take questions."

---

## Likely judge questions, with simple answers

**Basics**

1. **What is VQE in one sentence?**
   A loop where a quantum circuit with adjustable angles makes a guess for the electrons' state, the
   quantum computer measures its energy, and a normal computer adjusts the angles to make the energy as
   low as possible.

2. **Why can't the energy go below the true answer?**
   The variational principle: the average energy of *any* quantum state is at least the ground-state
   energy. So lower is always better, and the lowest we find is an upper bound on the truth.

3. **What is Hartree–Fock and why isn't it enough?**
   A fast approximation where each electron only feels the *average* push of the other. It misses
   how electrons actively avoid each other (correlation). For H₂ that's 20.3 mHa, more than 12× chemical accuracy.

4. **What is chemical accuracy?**
   1.6 mHa (= 1 kcal/mol). Errors smaller than that are generally small enough to predict chemistry correctly.

5. **Why 4 qubits?**
   STO-3G gives 2 orbitals (one 1s per atom). Each orbital holds a spin-up and a spin-down electron, so there are
   4 spin orbitals. Jordan–Wigner uses one qubit per spin orbital.

6. **What does Jordan–Wigner do?**
   It translates electron operators into qubit (Pauli) operators. Qubit = 1 means that electron seat is filled.
   It adds strings of Z gates to keep track of the fact that swapping two electrons flips a sign.

**Our choices**

7. **Why UCCSD and not a hardware-efficient ansatz?**
   UCCSD comes from chemistry: only 3 parameters, each with a meaning (an electron jumping), and it keeps the
   number of electrons fixed. Hardware-efficient circuits are shallower but have many parameters, no physics built in,
   and can get stuck on flat landscapes.

8. **Why did the two single-excitation angles end up at zero?**
   Brillouin's theorem: for a Hartree–Fock reference, single excitations don't mix directly with it. Also, H₂'s ground state
   is symmetric and singles break that symmetry. Only the double excitation matters.

9. **Why start at θ = 0?**
   θ = 0 is exactly the Hartree–Fock state, which is already within 20 mHa of the answer. A good start means fewer steps.

10. **Why three exact methods?**
    To be sure the answer key is right. Two use our qubit Hamiltonian; PySCF FCI uses no qubits at all, so it also checks the mapping.

11. **Why did you build UCCSD yourselves instead of using the library?**
    The library classes are built on parts deprecated in Qiskit 2.x and print warnings. We built the same circuit from
    `PauliEvolutionGate`s and proved it matches the library to 10⁻¹⁴ Ha.

**Noise and optimizers**

12. **What is a shot?**
    One run of the circuit followed by measuring the qubits, giving 0s and 1s. Energy is the average over many shots.

13. **Why does noise drop as 1/√N?**
    It's the normal statistics of averaging random samples: 100× more shots gives 10× less spread. Our measured spread
    went 15.9 → 7.1 → 1.8 → 0.65 mHa for 100 → 100,000 shots.

14. **Why does SLSQP fail with noise?**
    It estimates the slope from the difference between two very close energy values. With noise, that tiny difference
    is buried, so the slope is garbage and the angles run away.

15. **What is SPSA and why does it work?**
    Each step it nudges all angles at once in a random direction, measures just 2 energies, and moves downhill. Step sizes
    shrink over time, which averages the noise out. It's the standard choice for real hardware.

16. **Some "reported" energies were below the exact answer. Doesn't that break the variational principle?**
    No. That's the noisy *estimate*. If you take the lowest of many noisy numbers it is biased low. When we re-evaluate the
    final angles exactly, the true energy is always above the exact answer.

17. **How did you simulate shot noise?**
    `BackendEstimatorV2` on `AerSimulator`, which really samples bitstrings in each measurement basis. We first tried Aer's
    `EstimatorV2` but found (by reading its source code) it only adds Gaussian noise to the exact value, so we switched.

**Bond curve and physics**

18. **Why does Hartree–Fock fail when the bond breaks?**
    It forces both electrons into the same orbital, so it keeps a 50% chance of both electrons sitting on the same atom (H⁺H⁻),
    which is wrong for two separate atoms. The true state needs an equal mix of two arrangements.

19. **What happens to θ₂ as the bond stretches?**
    It moves from about −0.11 towards −π/4 ≈ −0.785, the setting for a 50/50 mix of |0101⟩ and |1010⟩.

20. **Your bond energy is 5.5 eV but experiment is 4.75 eV. Is VQE wrong?**
    No. VQE matches the exact answer *within the STO-3G orbital set*. The difference comes from STO-3G being tiny.
    A bigger orbital set would get closer, but needs more qubits.

**Big picture**

21. **Is this a quantum advantage?**
    No. H₂ is easy for a laptop. The point is a verified, working pipeline that shows the method is correct, and what
    goes wrong under realistic noise.

22. **Would it work on real hardware?**
    Not well without help. The circuit needs 56 CNOT gates, and today's gate errors would swamp a 1.6 mHa target.
    It would need error mitigation and fewer qubits (symmetry tapering).

23. **What would you do next?**
    Reduce qubits using symmetries, add a device noise model plus error mitigation, and try a bigger molecule like LiH.

24. **How did you use AI?**
    Claude helped write and debug code, make plots, explain concepts and draft the report and slides. We set the rules:
    test every function in our own environment and check every result against the exact answer. Everything is logged in
    `AI_Usage.md`, and we can explain every part.

25. **What did you personally do?** *(each of you: prepare your own honest answer)*
    Talk about the decisions you made, what you checked, what you learned, and which part you can explain best.

---

## Tips
- Split the slides: e.g. Arjun slides 1–4, Shanti slides 5–8. Both must be ready for any question.
- Point at the plot while talking. Don't read the slide.
- If you don't know an answer: "Good question. We didn't test that, but our expectation is ... because ..."
- Keep the notebook open on a laptop in case judges want to see code.
