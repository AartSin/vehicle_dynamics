// Small canvas plotting helper used by the interactive demos.
(function () {
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  function sizeCanvas(c) {
    const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function nice(maxAbs) {
    if (!(maxAbs > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(maxAbs))), n = maxAbs / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }

  // plot(canvas, x[], y[], color, {bare, fill, end, lw, xUnit})
  function plot(c, x, y, color, opts = {}) {
    const { ctx, w, h } = sizeCanvas(c);
    const padL = opts.bare ? 0 : 42, padB = opts.bare ? 0 : 20, padT = opts.bare ? 8 : 6, padR = opts.bare ? 0 : 10;
    const W = w - padL - padR, H = h - padB - padT;
    const ymax = nice(Math.max(...y.map(Math.abs)) * 1.1);
    const ymin = Math.min(...y) < -1e-9 ? -ymax : 0;
    const x0 = x[0], x1 = x[x.length - 1];
    const X = v => padL + (v - x0) / ((x1 - x0) || 1) * W;
    const Y = v => padT + (1 - (v - ymin) / (ymax - ymin)) * H;
    ctx.clearRect(0, 0, w, h);
    if (!opts.bare) {
      ctx.strokeStyle = css('--rule'); ctx.fillStyle = css('--muted'); ctx.lineWidth = 1;
      ctx.font = '11px ' + css('--sans');
      for (let i = 0; i <= 4; i++) {
        const v = ymin + (ymax - ymin) * i / 4, yy = Math.round(Y(v)) + .5;
        ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke();
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(+v.toPrecision(3), padL - 6, yy);
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const step = (x1 - x0) > 4 ? 1 : 0.5;
      for (let s = Math.ceil(x0); s <= x1 + 1e-6; s += step) {
        ctx.fillText(s.toFixed(step < 1 ? 1 : 0) + (opts.xUnit || ' s'), Math.min(Math.max(X(s), padL + 12), w - padR - 14), h - padB + 5);
      }
    }
    const path = () => { ctx.beginPath(); y.forEach((v, i) => { const xx = X(x[i]), yy = Y(v); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }); };
    if (opts.fill) {
      path(); ctx.lineTo(X(x1), Y(Math.max(ymin, 0))); ctx.lineTo(X(x0), Y(Math.max(ymin, 0)));
      ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = color; ctx.fill(); ctx.restore();
    }
    path(); ctx.strokeStyle = color; ctx.lineWidth = opts.lw || 2; ctx.lineJoin = 'round'; ctx.stroke();
    if (opts.end) {
      const i = y.length - 1; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(x[i]), Y(y[i]), 3.5, 0, 7); ctx.fill();
    }
  }

  function redraw() { document.dispatchEvent(new Event('site:redraw')); }
  window.SitePlot = { plot, css, redraw };

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redraw, 120); });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(redraw, 30)); } catch (e) {}
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  redraw();
})();
