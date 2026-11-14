import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
INK, AMBER, TEAL = "#1B1B3A", "#F2A541", "#2A9D8F"
x = np.linspace(-3, 3, 400); y = 0.35*x**2 + 0.15*np.sin(2.2*x)
fig, ax = plt.subplots(figsize=(8, 5.2))
ax.fill_between(x, y, 4, color="#E8F4F2")
ax.fill_between(x, -1, y, color=TEAL, alpha=0.9)
ax.plot(x, y, color=INK, lw=3)
xb = x[np.argmin(y)]; yb = y.min()
for i, xs in enumerate([-2.6, -1.9, -1.2]):
    ys = 0.35*xs**2 + 0.15*np.sin(2.2*xs)
    ax.scatter([xs], [ys+0.22], s=520, color=AMBER, alpha=0.25+0.2*i, zorder=3, edgecolor="none")
ax.scatter([xb], [yb+0.22], s=700, color=AMBER, zorder=4, edgecolor=INK, lw=2)
ax.annotate("", xy=(-0.55, 0.55), xytext=(-2.3, 2.35),
            arrowprops=dict(arrowstyle="-|>", color=INK, lw=2.5, connectionstyle="arc3,rad=0.25"))
ax.text(-2.85, 3.3, "Ball rolls downhill", fontsize=20, color=INK, fontweight="bold")
ax.text(xb, yb-0.55, "Bottom = ground-state energy", fontsize=20, color="white", fontweight="bold", ha="center")
ax.set_xlim(-3, 3); ax.set_ylim(-1, 4); ax.axis("off")
fig.tight_layout(pad=0.2); fig.savefig("valley.png", dpi=200, transparent=True)
