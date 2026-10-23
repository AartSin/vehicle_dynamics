// Linear 2-DOF bicycle model (lateral velocity v, yaw rate r), step steer, RK4.
// Same equations as the MATLAB version: see the "Equations" section on the page.
(function () {
  const R2D = 180 / Math.PI, L = 2.7;
  const el = id => document.getElementById(id);
  if (!el('c-yaw')) return;

  function simulate({ u, delta, m, a, Cf, Cr }) {
    const b = L - a, Iz = m * a * b, dt = 0.004, T = 3, tStep = 0.2;
    const f = (v, r, d) => [
      (-(Cf + Cr) / u * v - (m * u + (a * Cf - b * Cr) / u) * r + Cf * d) / m,
      (-(a * Cf - b * Cr) / u * v - (a * a * Cf + b * b * Cr) / u * r + a * Cf * d) / Iz
    ];
    let v = 0, r = 0;
    const t = [], yaw = [], ay = [];
    for (let k = 0; k <= T / dt; k++) {
      const tk = k * dt, d = tk >= tStep ? delta : 0;
      const k1 = f(v, r, d);
      t.push(tk); yaw.push(r * R2D); ay.push((k1[0] + u * r) / 9.81);
      const k2 = f(v + dt / 2 * k1[0], r + dt / 2 * k1[1], d);
      const k3 = f(v + dt / 2 * k2[0], r + dt / 2 * k2[1], d);
      const k4 = f(v + dt * k3[0], r + dt * k3[1], d);
      v += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      r += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (!isFinite(v) || Math.abs(r) > 50) break;
    }
    const K = m / L * (b / Cf - a / Cr);            // understeer gradient, rad per m/s^2
    const denom = L + K * u * u;
    return { t, yaw, ay, K, rss: denom > 0 ? u * delta / denom : NaN };
  }

  const ids = ['u', 'd', 'm', 'a', 'cf', 'cr'];
  const defaults = Object.fromEntries(ids.map(k => [k, el('s-' + k).value]));

  function run() {
    const v = Object.fromEntries(ids.map(k => [k, parseFloat(el('s-' + k).value)]));
    el('o-u').textContent = v.u + ' m/s';
    el('o-d').textContent = v.d.toFixed(1) + '°';
    el('o-m').textContent = v.m + ' kg';
    el('o-a').textContent = v.a.toFixed(2) + ' m';
    el('o-cf').textContent = v.cf + ' kN/rad';
    el('o-cr').textContent = v.cr + ' kN/rad';
    const s = simulate({ u: v.u, delta: v.d / R2D, m: v.m, a: v.a, Cf: v.cf * 1000, Cr: v.cr * 1000 });
    const Kdeg = s.K * 9.81 * R2D;
    el('r-k').textContent = (Kdeg >= 0 ? '+' : '') + Kdeg.toFixed(2) + ' deg/g';
    el('r-r').textContent = isFinite(s.rss) ? (s.rss * R2D).toFixed(1) + ' deg/s' : 'unbounded';
    el('r-b').textContent = Math.abs(Kdeg) < 0.05 ? 'neutral steer' : Kdeg > 0 ? 'understeer' : isFinite(s.rss) ? 'oversteer' : 'above critical speed';
    const { plot, css } = window.SitePlot;
    plot(el('c-yaw'), s.t, s.yaw, css('--plot-1'), { end: true });
    plot(el('c-ay'), s.t, s.ay, css('--plot-2'), { end: true });
  }

  ids.forEach(k => el('s-' + k).addEventListener('input', run));
  el('demo-reset').addEventListener('click', () => { ids.forEach(k => el('s-' + k).value = defaults[k]); run(); });
  document.addEventListener('site:redraw', run);
  run();
})();
