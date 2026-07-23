/**
 * Kurze Einblend-Hinweise ("Toasts") oben am Bildschirm – z. B. für frisch
 * freigeschaltete Erfolge oder Boss-Ereignisse. Rein zeitgesteuert und unit-getestet.
 */
class ToastManager {
  constructor() {
    this.toasts = [];
  }

  reset() {
    this.toasts = [];
  }

  /** Fügt einen Hinweis hinzu (Dauer in Sekunden). */
  add(text, duration = 3, color = "#ffd84d") {
    this.toasts.push({ text, time: duration, maxTime: duration, color });
  }

  update(dt) {
    for (const t of this.toasts) t.time -= dt;
    this.toasts = this.toasts.filter((t) => t.time > 0);
  }

  draw(ctx, W) {
    ctx.save();
    ctx.textAlign = "center";
    this.toasts.forEach((t, i) => {
      const y = 130 + i * 30;
      ctx.globalAlpha = Math.min(1, t.time); // letzte Sekunde ausblenden
      ctx.fillStyle = "rgba(27,16,51,0.8)";
      const w = Math.max(180, ctx.measureText(t.text).width + 40);
      ctx.fillRect(W / 2 - w / 2, y - 20, w, 28);
      ctx.fillStyle = t.color;
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.fillText(t.text, W / 2, y);
    });
    ctx.restore();
  }
}

if (typeof window !== "undefined") window.ToastManager = ToastManager;
if (typeof module !== "undefined" && module.exports) module.exports = { ToastManager };
