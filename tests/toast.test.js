const { test } = require("node:test");
const assert = require("node:assert/strict");
const { ToastManager } = require("../src/toast.js");

test("add fügt einen Toast hinzu", () => {
  const m = new ToastManager();
  m.add("Hallo", 3);
  assert.equal(m.toasts.length, 1);
  assert.equal(m.toasts[0].text, "Hallo");
});

test("update zählt die Zeit herunter und entfernt abgelaufene Toasts", () => {
  const m = new ToastManager();
  m.add("kurz", 0.5);
  m.update(0.3);
  assert.equal(m.toasts.length, 1);
  m.update(0.3); // jetzt > 0.5 gesamt
  assert.equal(m.toasts.length, 0);
});

test("mehrere Toasts werden unabhängig verwaltet", () => {
  const m = new ToastManager();
  m.add("a", 0.4);
  m.add("b", 2.0);
  m.update(0.5); // 'a' abgelaufen, 'b' bleibt
  assert.equal(m.toasts.length, 1);
  assert.equal(m.toasts[0].text, "b");
});

test("reset leert alle Toasts", () => {
  const m = new ToastManager();
  m.add("x", 5);
  m.reset();
  assert.equal(m.toasts.length, 0);
});
