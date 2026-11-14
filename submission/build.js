const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/Users/arjun2/.claude/skills/synced/d14589e7-9a1d-4e6e-8919-0f88da2e7ffd_a4eaa83d-9b44-4fb6-89c8-87a4e754cab5/pptx/scripts/apply_theme.js");
const FIG = "/Volumes/Arjun work/Hackathon-2026/qiskit-fall-fest-26/submission/figures/";
const OUT = process.argv[2];
const THEME = { name: "Valley", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: "1B1B3A", lt1: "FFFFFF", dk2: "2A2A55", lt2: "EEF6F5",
    accent1: "2A9D8F", accent2: "F2A541", accent3: "E76F51", accent4: "264653", accent5: "8AB17D", accent6: "6C757D",
    hlink: "2A9D8F", folHlink: "264653" } };
const K = THEME.colors;
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };
pres.title = "Finding a Molecule's Happiest Shape"; pres.author = "Team Cdevi Code";
const C = pres.SchemeColor;

pres.defineSlideMaster({ title: "Dark", background: { color: K.dk1 },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.6, w: 7.6, h: 2.0,
    fontSize: 44, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } }] });
pres.defineSlideMaster({ title: "Content", background: { color: K.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.4, w: 11.9, h: 0.9,
      fontSize: 36, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "Team Cdevi Code · Qiskit Fall Fest 2026", options: { x: 0.7, y: 7.0, w: 8, h: 0.3, fontSize: 11, color: C.accent6, margin: 0 } } } ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 11, color: C.accent6, align: "right" } });

const tb = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontSize: 20, color: C.text1 }, o));
const bullets = (items, size = 22) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 22 }, breakLine: i < items.length - 1, fontSize: size, paraSpaceAfter: 10 } }));
const card = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { type: "none" }, objectName: name });
const arrow = (s, x, y, w, h, back) => s.addShape(pres.shapes.LINE, { x, y, w, h, line: Object.assign({ color: K.dk1, width: 2.5 }, back ? { beginArrowType: "triangle" } : { endArrowType: "triangle" }), objectName: "Arrow" });
const img = (s, f, x, y, w, ratio, alt) => s.addImage({ path: FIG + f, x, y, w, h: w / ratio, altText: alt });
const R = 10 / 5.4;
let s;

// 1 Title
pres.addSection({ title: "Intro" });
s = pres.addSlide({ masterName: "Dark", sectionTitle: "Intro" });
s.addText("Finding a Molecule's Happiest Shape", { placeholder: "title" });
tb(s, "VQE: a quantum computer and a laptop working together", { x: 0.7, y: 2.75, w: 7.4, h: 0.6, fontSize: 22, color: C.accent2 });
tb(s, [{ text: "Challenge 01 · VQE · Intermediate", options: { breakLine: true } }, { text: "Molecule: hydrogen (H₂)" }], { x: 0.7, y: 3.75, w: 7.4, h: 1.0, fontSize: 20, color: C.background2 });
tb(s, [{ text: "Team Cdevi Code", options: { bold: true, breakLine: true } }, { text: "Arjun Sharma Poudel · Shanti Thapa" }], { x: 0.7, y: 5.55, w: 7.4, h: 1.0, fontSize: 20, color: C.background1 });
s.addShape(pres.shapes.LINE, { x: 9.55, y: 3.75, w: 1.9, h: 0, line: { color: K.lt2, width: 6 } });
for (const x of [8.55, 10.95]) {
  s.addShape(pres.shapes.OVAL, { x, y: 2.75, w: 2.0, h: 2.0, fill: { color: K.accent1 }, line: { color: K.lt2, width: 3 }, objectName: "H atom" });
  tb(s, "H", { x, y: 2.75, w: 2.0, h: 2.0, fontSize: 60, bold: true, color: C.background1, align: "center", valign: "middle" });
}
s.addNotes("Hi, we're Team Cdevi Code. I'm Arjun, this is Shanti. We used a quantum algorithm called VQE, where a quantum computer and a normal laptop work together, to find the energy of the hydrogen molecule. Then we checked that our answer is right.");

// 2 Big idea
pres.addSection({ title: "Idea" });
s = pres.addSlide({ masterName: "Content", sectionTitle: "Idea" });
s.addText("The big idea: nature rolls downhill", { placeholder: "title" });
tb(s, bullets(["A ball always stops at the valley bottom", "Electrons in a molecule do the same", "That bottom is the \"ground-state energy\"", "It decides how chemicals bond and react", "Big molecules: too hard for normal computers"]), { x: 0.7, y: 1.6, w: 5.5, h: 4.9, valign: "top" });
s.addImage({ path: "valley.png", x: 6.5, y: 1.5, w: 6.1, h: 3.97, altText: "A ball rolling into the bottom of a valley, labelled ground-state energy" });
tb(s, "Our job: find the bottom of the valley for H₂.", { x: 6.5, y: 5.75, w: 6.1, h: 0.5, fontSize: 20, italic: true, color: C.accent1, align: "center" });
s.addNotes("Picture a ball in a valley. It always rolls down and stops at the bottom. The electrons in a molecule do the same: they settle into the lowest energy they can. That lowest energy is called the ground-state energy, and it decides how a molecule bonds and reacts. For big molecules, normal computers can't find it, because the work doubles with every extra orbital. Quantum computers might help.");

// 3 Glossary
pres.addSection({ title: "Words" });
s = pres.addSlide({ masterName: "Content", sectionTitle: "Words" });
s.addText("Key words, made simple", { placeholder: "title" });
const terms = [
  ["Ground state", "The lowest energy a molecule can have"],
  ["Hartree (Ha)", "Chemists' energy unit, like calories for food. 1 mHa = 1/1000 Ha"],
  ["Qubit", "A quantum bit. Here: one electron \"seat\", filled (1) or empty (0)"],
  ["Hamiltonian", "The energy rulebook: gives the energy of any electron arrangement"],
  ["Ansatz", "Our \"guess circuit\": a quantum circuit with knobs (angles θ)"],
  ["Optimizer", "Laptop program that turns the knobs to lower the energy"],
  ["Shot", "One run + measurement. Real energy = average of many shots"],
  ["Chemical accuracy", "Within 1.6 mHa of the truth: good enough for chemistry"]];
terms.forEach(([t, d], i) => {
  const x = 0.7 + (i % 4) * 3.05, y = 1.55 + Math.floor(i / 4) * 2.65;
  card(s, x, y, 2.85, 2.45, i === 5 ? K.accent2 : K.lt2, "Term card");
  tb(s, t, { x: x + 0.25, y: y + 0.25, w: 2.35, h: 0.55, fontSize: 20, bold: true, color: i === 5 ? C.text1 : C.accent4 });
  tb(s, d, { x: x + 0.25, y: y + 0.9, w: 2.35, h: 1.4, fontSize: 16, valign: "top" });
});
s.addNotes("A few words we'll use. Ground state: the lowest energy. Hartree: just the unit chemists use for energy, like calories for food. A qubit is a quantum bit; for us, each qubit is one seat an electron can sit in. The Hamiltonian is the energy rulebook. The ansatz is our guess circuit, with knobs we can turn. The optimizer is a normal program that turns those knobs to lower the energy. A shot is one run of the quantum computer. And chemical accuracy means within 1.6 milli-Hartree of the truth.");

// 4 Workflow
pres.addSection({ title: "Workflow" });
s = pres.addSlide({ masterName: "Content", sectionTitle: "Workflow" });
s.addText("Our project workflow", { placeholder: "title" });
const box = (x, y, w, h, n, t, d, fill, tc) => {
  card(s, x, y, w, h, fill, "Flow box");
  tb(s, [{ text: (n ? n + "  " : "") + t, options: { bold: true, fontSize: 19, breakLine: true } }, { text: d, options: { fontSize: 15 } }],
     { x: x + 0.18, y, w: w - 0.36, h, valign: "middle", color: tc || C.background1 });
};
box(0.7, 1.6, 2.55, 1.2, "1", "Molecule", "H₂, atoms 0.735 Å apart", K.accent4);
arrow(s, 3.25, 2.2, 0.35, 0);
box(3.6, 1.6, 2.55, 1.2, "2", "PySCF", "Builds the energy map", K.accent4);
arrow(s, 6.15, 2.2, 0.35, 0);
box(6.5, 1.6, 2.55, 1.2, "3", "Jordan–Wigner", "Map → 4 qubits, 15 terms", K.accent4);
arrow(s, 9.05, 2.2, 0.9, 0);
box(9.95, 1.6, 2.7, 1.2, "4", "Exact solver", "The answer key (3 ways)", K.accent6);
card(s, 0.7, 3.35, 8.85, 3.4, K.lt2, "VQE loop area");
tb(s, "5  VQE LOOP  (quantum circuit + laptop)", { x: 0.95, y: 3.45, w: 8.3, h: 0.4, fontSize: 16, bold: true, color: C.accent1, charSpacing: 1 });
arrow(s, 7.775, 2.8, 0, 0.55);
box(1.0, 3.95, 2.4, 1.35, "", "Guess circuit", "UCCSD ansatz, 3 knobs (θ)", K.accent1);
arrow(s, 3.4, 4.62, 0.6, 0);
box(4.0, 3.95, 2.4, 1.35, "", "Measure energy", "Qiskit Estimator", K.accent1);
arrow(s, 6.4, 4.62, 0.6, 0);
box(7.0, 3.95, 2.4, 1.35, "", "Optimizer", "Turns the knobs lower", K.accent2, C.text1);
s.addShape(pres.shapes.LINE, { x: 8.2, y: 5.3, w: 0, h: 0.95, line: { color: K.dk1, width: 2.5 } });
s.addShape(pres.shapes.LINE, { x: 2.2, y: 6.25, w: 6.0, h: 0, line: { color: K.dk1, width: 2.5 } });
arrow(s, 2.2, 5.3, 0, 0.95, true);
tb(s, "↺  repeat until the energy stops going down", { x: 2.5, y: 5.55, w: 5.4, h: 0.45, fontSize: 16, italic: true, align: "center" });
arrow(s, 11.3, 2.8, 0, 1.2);
arrow(s, 9.55, 4.8, 0.4, 0);
box(9.95, 4.0, 2.7, 1.6, "6", "Compare", "VQE vs exact → same answer ✓", K.accent3);
s.addNotes("Here is our whole project in one picture. One: the molecule, hydrogen. Two: a chemistry program called PySCF builds the energy map. Three: a method called Jordan–Wigner translates that map into qubits; we need 4. Four: before any quantum work, a normal computer solves it exactly. That's our answer key, and we computed it three different ways. Five: the VQE loop. The guess circuit makes a guess, Qiskit measures its energy, and the optimizer turns the knobs to lower it. We repeat until the energy stops dropping. Six: we compare VQE with the answer key.");

// 5 Guess circuit
pres.addSection({ title: "Method" });
s = pres.addSlide({ masterName: "Content", sectionTitle: "Method" });
s.addText("The guess circuit: 3 knobs from chemistry", { placeholder: "title" });
tb(s, bullets(["Start: both electrons in the low orbital", "3 knobs (θ) let electrons jump up", "Knobs at 0 = old shortcut answer ✓", "Matches Qiskit's built-in UCCSD ✓"], 20), { x: 0.7, y: 1.55, w: 5.6, h: 2.6, valign: "top" });
const qy = [4.5, 5.0, 5.5, 6.0];
qy.forEach((y, q) => {
  tb(s, "q" + q, { x: 0.7, y: y - 0.18, w: 0.45, h: 0.36, fontSize: 16, bold: true, valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 1.2, y, w: 4.9, h: 0, line: { color: K.accent6, width: 1.5 } });
});
for (const q of [0, 2]) { card(s, 1.45, qy[q] - 0.2, 0.5, 0.4, K.accent4, "X gate"); tb(s, "X", { x: 1.45, y: qy[q] - 0.2, w: 0.5, h: 0.4, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" }); }
const gate = (x, q0, q1, label, fill, tc) => { card(s, x, qy[q0] - 0.22, 0.85, qy[q1] - qy[q0] + 0.44, fill, "Knob gate"); tb(s, label, { x, y: qy[q0] - 0.22, w: 0.85, h: qy[q1] - qy[q0] + 0.44, fontSize: 18, bold: true, color: tc, align: "center", valign: "middle" }); };
gate(2.3, 0, 1, "θ₀", K.accent1, C.background1);
gate(3.3, 2, 3, "θ₁", K.accent1, C.background1);
gate(4.35, 0, 3, "θ₂", K.accent2, C.text1);
tb(s, "Start", { x: 1.3, y: 6.3, w: 0.8, h: 0.35, fontSize: 14, color: C.accent6, align: "center" });
tb(s, "one jumps", { x: 2.2, y: 6.3, w: 2.0, h: 0.35, fontSize: 14, color: C.accent6, align: "center" });
tb(s, "both jump", { x: 4.2, y: 6.3, w: 1.2, h: 0.35, fontSize: 14, color: C.accent6, align: "center" });
img(s, "fig6_landscape.png", 6.6, 1.6, 6.0, R, "Energy as the both-jump knob turns: it dips from the old answer down to the true answer");
tb(s, "Turning only θ₂ already reaches the true answer.", { x: 6.6, y: 5.0, w: 6.0, h: 0.5, fontSize: 16, italic: true, color: C.accent6, align: "center" });
s.addNotes("This is our guess circuit. We start with both electrons in the low-energy orbital; that's the old shortcut's answer. Then we add three knobs from chemistry, called UCCSD. Knobs theta-zero and theta-one let one electron jump up; theta-two lets both jump up together. We checked: with all knobs at zero, we get the old answer exactly, and our circuit matches Qiskit's built-in one. The plot shows that turning just theta-two takes us down to the true answer.");

// 6 Result
pres.addSection({ title: "Results" });
s = pres.addSlide({ masterName: "Content", sectionTitle: "Results" });
s.addText("Result: VQE hits the exact answer", { placeholder: "title" });
card(s, 0.7, 1.5, 5.1, 1.9, K.accent2, "Highlight card");
tb(s, "OUR VQE ENERGY", { x: 1.0, y: 1.62, w: 4.5, h: 0.4, fontSize: 16, bold: true, charSpacing: 2 });
tb(s, "−1.137306 Ha", { x: 1.0, y: 2.0, w: 4.5, h: 0.9, fontSize: 50, bold: true });
tb(s, "Same as exact to 10 decimal places ✓", { x: 1.0, y: 2.9, w: 4.5, h: 0.4, fontSize: 16 });
[["Old shortcut (Hartree–Fock)", "−1.116999 Ha", K.accent3], ["Exact classical answer", "−1.137306 Ha", K.accent1], ["Missing energy found", "100%", K.accent2]].forEach(([l, v, col], i) => {
  const y = 3.6 + i * 0.5;
  s.addShape(pres.shapes.OVAL, { x: 0.75, y: y + 0.12, w: 0.25, h: 0.25, fill: { color: col }, line: { type: "none" }, objectName: "Legend dot" });
  tb(s, l, { x: 1.2, y, w: 2.9, h: 0.5, fontSize: 17, valign: "middle" });
  tb(s, v, { x: 4.0, y, w: 1.8, h: 0.5, fontSize: 18, bold: true, valign: "middle", align: "right" });
});
img(s, "fig1_downhill.png", 6.2, 1.45, 6.45, R, "VQE energy dropping step by step from the Hartree-Fock line to the exact answer");
s.addImage({ path: FIG + "fig5_state.png", x: 3.6, y: 5.2, w: 6.1, h: 6.1 / (10 / 2.6), altText: "Final state: 98.8 percent both electrons low, 1.2 percent both jumped up" });
s.addNotes("And it works. Our VQE energy is minus 1.137306 Hartree. The exact answer is minus 1.137306 Hartree: the same to 10 decimal places. [pause] The old shortcut stops at minus 1.117; VQE finds 100% of the energy it misses. The plot shows VQE walking downhill, from the orange line to the green one. The bar at the bottom shows what VQE found: 98.8% of the time both electrons sit low, and 1.2% of the time they jump up together. That 1.2% is the electrons dodging each other, which the old method leaves out.");

// 7 Shots
s = pres.addSlide({ masterName: "Content", sectionTitle: "Results" });
s.addText("Real quantum computers are noisy", { placeholder: "title" });
tb(s, bullets(["Real machines give random 0s and 1s", "So we average many \"shots\"", "More shots → less wobble", "Need ~10,000+ shots for 1.6 mHa"], 21), { x: 0.7, y: 1.6, w: 5.0, h: 3.2, valign: "top" });
card(s, 0.7, 4.85, 5.0, 1.6, K.lt2, "Analogy card");
tb(s, [{ text: "Like a poll: ", options: { bold: true } }, { text: "ask 100 people and the answer wobbles; ask 100,000 and it's steady." }], { x: 0.95, y: 4.85, w: 4.5, h: 1.6, fontSize: 18, valign: "middle" });
img(s, "fig3_shots.png", 6.1, 1.6, 6.55, R, "Noise in the energy falls from 15.9 mHa at 100 shots to 0.65 mHa at 100,000 shots");
s.addNotes("So far that was a perfect simulation. But a real quantum computer doesn't hand you an energy; it gives random zeros and ones, and you average many runs, called shots. It's like a poll: ask 100 people and the result wobbles, ask 100,000 and it's steady. Our wobble went from 16 milli-Hartree with 100 shots down to 0.65 with 100,000. You need about ten thousand shots or more to be accurate enough.");

// 8 Optimizers
s = pres.addSlide({ masterName: "Content", sectionTitle: "Results" });
s.addText("What is an optimizer, and which one wins?", { placeholder: "title" });
tb(s, [{ text: "Optimizer = a hiker in fog ", options: { bold: true } }, { text: "feeling for the way downhill. It picks the next knob setting." }], { x: 0.7, y: 1.45, w: 11.9, h: 0.5, fontSize: 20 });
const opts = [["SLSQP", "Measures the slope very precisely", "Fastest with no noise (10 steps). Noise ruins the slope → fails", K.accent3],
              ["COBYLA", "Tries nearby points, no slope", "Gets close, but stops early (0.9–3.1 mHa)", K.accent2],
              ["SPSA", "Wiggles all knobs randomly, 2 measurements a step", "Built for noise. Best every time (~0.03 mHa)", K.accent1]];
opts.forEach(([n, how, res, col], i) => {
  const y = 2.2 + i * 1.5;
  card(s, 0.7, y, 5.6, 1.35, K.lt2, "Optimizer card");
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: y + 0.42, w: 0.5, h: 0.5, fill: { color: col }, line: { type: "none" }, objectName: "Optimizer dot" });
  tb(s, [{ text: n + ": ", options: { bold: true } }, { text: how, options: { breakLine: true } }, { text: res, options: { fontSize: 15, color: C.accent4 } }], { x: 1.6, y, w: 4.55, h: 1.35, fontSize: 17, valign: "middle" });
});
img(s, "fig4_optimizers.png", 6.6, 2.15, 6.05, R, "Final error under noise: SLSQP fails, COBYLA close, SPSA best");
tb(s, "Best on paper ≠ best in real life.", { x: 6.6, y: 5.55, w: 6.05, h: 0.5, fontSize: 18, bold: true, italic: true, color: C.accent3, align: "center" });
s.addNotes("The optimizer is the part that turns the knobs. Think of a hiker in fog, feeling for the way downhill. We tested three. SLSQP measures the slope very precisely; with no noise it was fastest, just 10 steps. But with noise the slope becomes garbage, and it failed completely, ending worse than the old shortcut. COBYLA doesn't use slopes; it got close but stopped early. SPSA wiggles all knobs at once randomly and only needs two measurements per step; it's built for noise and was the best every time. Lesson: the best method on paper isn't always the best in real life.");

// 9 Bond curve
s = pres.addSlide({ masterName: "Content", sectionTitle: "Results" });
s.addText("Pulling the molecule apart", { placeholder: "title" });
img(s, "fig2_bond.png", 0.7, 1.5, 7.1, R, "Energy versus distance: VQE dots sit on the exact curve; Hartree-Fock goes wrong at long distances");
tb(s, bullets(["Repeated for 25 distances", "VQE matches exact everywhere", "Old shortcut: up to 278 mHa off", "Most stable: 0.75 Å (real 0.741)"], 20), { x: 8.1, y: 1.7, w: 4.55, h: 4.2, valign: "top" });
s.addNotes("Finally, we pulled the two atoms apart, 25 different distances. VQE, the blue dots, sits on the exact curve everywhere. The old shortcut is fine near the normal bond length but goes badly wrong as the bond breaks, off by up to 278 milli-Hartree. The lowest point of our curve is at 0.75 angstrom; the real measured value is 0.741.");

// 10 Summary
pres.addSection({ title: "Close" });
s = pres.addSlide({ masterName: "Dark", sectionTitle: "Close" });
s.addText("What we found", { placeholder: "title" });
const hdr = { bold: true, color: K.lt1, fill: { color: K.accent1 }, fontSize: 16 };
const cell = { color: K.dk1, fill: { color: K.lt1 }, fontSize: 16 };
s.addTable([
  [{ text: "Test", options: hdr }, { text: "Error vs exact", options: hdr }, { text: "< 1.6 mHa?", options: Object.assign({ align: "center" }, hdr) }],
  [{ text: "Perfect simulation", options: cell }, { text: "0.000000000012 mHa", options: cell }, { text: "✓", options: Object.assign({ align: "center", bold: true }, cell) }],
  [{ text: "Noisy, SPSA, 10k shots", options: cell }, { text: "0.028 mHa", options: cell }, { text: "✓", options: Object.assign({ align: "center", bold: true }, cell) }],
  [{ text: "25 bond distances", options: cell }, { text: "max 0.00000003 mHa", options: cell }, { text: "✓", options: Object.assign({ align: "center", bold: true }, cell) }]],
  { x: 0.7, y: 1.55, w: 7.0, colW: [2.9, 2.6, 1.5], rowH: 0.55, border: { type: "solid", pt: 1, color: K.lt2 }, fontFace: "Calibri", valign: "middle" });
tb(s, bullets(["VQE found the exact energy of H₂", "Noise changes which optimizer works", "Next: bigger molecules, real hardware"], 20), { x: 0.7, y: 4.05, w: 7.0, h: 1.8, color: C.background1 });
tb(s, "AI use: Claude helped with code; we checked every result. Logged in AI_Usage.md.", { x: 0.7, y: 6.1, w: 7.0, h: 0.6, fontSize: 15, color: C.background2 });
tb(s, [{ text: "Thank you!", options: { breakLine: true } }, { text: "Questions?" }], { x: 8.3, y: 2.6, w: 4.35, h: 2.2, fontSize: 48, bold: true, color: C.accent2, align: "right", valign: "middle" });
tb(s, "github.com/arjun-whiteshadow/qiskit-fall-fest-26", { x: 7.6, y: 6.1, w: 5.05, h: 0.6, fontSize: 14, color: C.background2, align: "right" });
s.addNotes("To sum up: VQE found the exact energy of hydrogen in a perfect simulation, stayed accurate with realistic noise when we used SPSA, and worked at every bond distance. Things that went wrong along the way: the newest Qiskit crashed on our Python, so we pinned a working version, and one noise simulator wasn't doing real sampling, so we switched. Next we'd try bigger molecules and real hardware. We used Claude as a coding assistant and checked every result against the exact answer. Thank you, we're happy to take questions.");

pres.writeFile({ fileName: OUT }).then(() => applyTheme(OUT, THEME)).then(() => console.log("wrote", OUT));
