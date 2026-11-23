---
layout: project
title: "Lap time sim A001: technical report"
permalink: /projects/a001/report/
status: done
dof: "Point mass, quasi-steady"
tools: "MATLAB"
math: true
summary: "Full technical report for A001: method, verification against OptimumLap, numerical check, results and sensitivity."
image: /assets/img/a001-speed-overlay.png
image_caption: "Coventry FSUK car, ClA 6, FSEC 2025. A001 59.35 s against OptimumLap 58.98 s (+0.6%). Speeds agree within 2 km/h over 81% of the lap (RMS 1.5 km/h); the largest gap is +8 km/h in one corner at 297 m. Small jitter mid-corner is curvature noise (see Numerical check)."
---

[← Back to the A001 summary]({{ '/projects/02-a001/' | relative_url }})

## Aim

A001 is my first lap-time simulator. It is a point-mass, quasi-steady model that turns a car's grip, power and aero into a speed profile and a lap time. It answers first-order questions for a Formula Student car: what a unit of downforce is worth in lap time, and whether the car is grip-limited or power-limited.

I matched OptimumLap's simplifications on purpose. With the same physics on both sides, any difference comes from my code, so OptimumLap works as a test bench for the solver.

## Method

Corner speed limit, solved with `fzero` because downforce makes F<sub>z</sub> depend on v:

$$
v_{corner} = \sqrt{\frac{\mu_y F_z(v)}{m\,|k|}}
$$

Forward and backward passes, keeping the lower speed at each point:

$$
v_{n+1}^2 = v_n^2 + 2a_x\,\Delta s
$$

Tyre force left after cornering, from the friction ellipse:

$$
F_{x,tyre} = \mu_x F_z\sqrt{1-\left(\frac{m a_y}{\mu_y F_z}\right)^2}
$$

Accelerating, only the driven axle's share λ is available. Drag and rolling resistance act on the body, outside the tyre limit:

$$
a_{x,acc} = \frac{\min(F_{engine},\ \lambda F_{x,tyre}) - F_{drag} - F_{rr}}{m}
$$

$$
a_{x,brk} = \frac{\min(F_{brake},\ F_{x,tyre}) + F_{drag} + F_{rr}}{m}
$$

Laps repeat until lap time and start speed settle, which takes 3 laps.

## Fidelity and the direction of each error

| Assumption | Effect on lap time |
|---|---|
| Constant μ: no load sensitivity, no load transfer | faster; aero benefit overstated |
| Drive grip a fixed 0.45 of load (no rearward transfer) | slower out of corners |
| Centreline, not racing line | slower |
| No shift time, best gear always selected | faster |

## Verification: A/B against OptimumLap

Same car, same track, same inputs in both tools. A001 test car: 200 kg, μ 1.4, grip from all four wheels.

| ClA | OptimumLap [s] | A001 before [s] | A001 after [s] | Δ after |
|---|---:|---:|---:|---:|
| 0.5 | 66.99 | 64.88 | 66.78 | −0.3% |
| 3 | 62.33 | 60.12 | 61.99 | −0.5% |
| 6 | 57.32 | 54.80 | 56.51 | −1.4% |

A001's own step-size sensitivity is about 0.5% (see Numerical check), so the 0.3% and 0.5% matches are inside A001's own noise. Agreement is quoted as within about 1%. The 1.4% gap at ClA 6 is real.

Bugs the A/B test found, largest first:

1. **Braking ignored the tyres.** A unit error in the friction-ellipse check made it pick the brake model every time, so the car braked at 2.9 g on 1.4 g tyres. Worth 1.7 s.
2. **2WD applied to power, not grip.** Scaling engine power by 0.45 cut top speed to 88 km/h. Scaling the rear tyres' grip gives 109 km/h and 1.0 s back.
3. **Drag on the wrong side of the tyre limit** in both passes. The two errors partly cancelled.
4. **The convergence check never passed.** It compared against an empty entry, so every run hit the 20 s timeout. Now it settles in 3 laps.
5. **Gears stopped at the 12,250 rpm upshift point,** not the 13,000 rpm limiter. Worth 0.05 s.

**Rear-wheel drive.** OptimumLap does not publish how its 2WD option works. I tested two ways of copying it on the test car: cutting engine force to 45%, or limiting drive force to 45% of tyre grip (only the rear tyres push). Grip × 0.45 matched OptimumLap 2WD (+0.36 / −0.11 / −0.69 s at ClA 0.5 / 3 / 6); power × 0.45 did not (−1.88 / −1.66 / −0.79 s) and capped the Coventry car at 88 km/h. A001 uses λ = 0.45 on drive grip, in the forward pass only; braking uses all four tyres. λ = 0.45 copies OptimumLap's 2WD; it is not this car's rear weight share (0.53).

**Coventry FSUK car against OptimumLap.** Same inputs in both tools (280 kg, Kawasaki turbo dyno map, μ<sub>x</sub> 1.6, μ<sub>y</sub> 1.55, ClA 6 / CdA 2.0, 2WD, overall ratio 7.6, rev limit 11,635 rpm, FSEC 2025 track), except wheel radius (A001 0.223 m, OptimumLap 0.23 m) and drivetrain efficiency (98% against 100%). Wheel radius does not affect lap time here: changing it from 0.2032 to 0.223 m moved no lap time by more than 0.001 s, because rear grip, not the engine, limits acceleration. Compared on lap time, top speed and minimum speed:

|  | OptimumLap 2WD | A001, λ 0.45 | Δ |
|---|---:|---:|---:|
| Lap time | 58.98 s | 59.35 s | +0.6% |
| Top speed | 110.6 km/h | 109.3 km/h | −1.1% |
| Minimum speed | 31.2 km/h | 31.3 km/h | +0.3% |

OptimumLap values are from its exported results. Speed traces agree within 2 km/h over 81% of the lap (RMS 1.5 km/h). A λ sweep puts OptimumLap's lap between λ = 0.45 (59.35 s) and 0.50 (58.71 s), at about 0.47.

**The gap left grows with downforce:** 0.2 s at ClA 0.5, 0.8 s at ClA 6. The track is not the cause: my converted track matches OptimumLap's length and net heading exactly (985.06 m, −360.00°), with minimum radius 0.7% larger. Load sensitivity is not the cause either: it is switched off in the OptimumLap runs (both mass-friction terms are 0). The cause is not yet found.

## Numerical check

| ds [m] | 0.05 | 0.1 | 0.2 | 0.5 |
|---|---:|---:|---:|---:|
| Lap time [s] | 66.27 | 65.94 | 65.73 | 64.84 |

Not converged: halving ds adds 0.33 s (0.5%). Curvature comes from finite differences on the centreline, and its noise grows as ds shrinks. The spikes lower the corner speed limit, which shows as jitter mid-corner in the speed trace.

**How results are used:** every run uses ds = 0.1 m, and absolute lap times carry ±0.5% (±0.3 s) numerical uncertainty. Comparisons at fixed ds (the ClA table and the sensitivity) are much less affected, because the same curvature noise is in both runs.

<figure><img src="{{ '/assets/img/a001-curvature.png' | relative_url }}" alt="Raw and smoothed track curvature against distance"><figcaption class="small">Raw curvature against a 21-point moving mean. Tightest radius is 4.5 m.</figcaption></figure>

## Results

<p class="small">FSEC 2025 (985 m) · Coventry FSUK car: 280 kg, Kawasaki turbo dyno map, μ<sub>x</sub> 1.6, μ<sub>y</sub> 1.55, rear-wheel drive (λ 0.45 on drive grip) · ClA 1</p>

- Flying lap: 65.9 s ± 0.3 s
- Standing start: 67.1 s ± 0.3 s

| ClA | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|---:|
| Lap time [s] | 65.94 | 64.61 | 63.27 | 61.94 | 60.64 | 59.35 |

Each +1 ClA saves about 1.3 s, almost linearly (1.33 s down to 1.28 s). CdA rises with ClA in these maps. This is an upper bound: load sensitivity is not modelled, and real tyres lose grip under load, so the real gain is likely smaller.

## Sensitivity

| +5% in | Δ lap [s] |
|---|---:|
| Lateral grip μ<sub>y</sub> | −1.32 |
| Longitudinal grip μ<sub>x</sub> | −0.35 |
| Mass | +0.04 |
| Drag | +0.02 |
| Engine torque | 0.00 |

Lateral grip dominates. With only the rear tyres driving, the car is grip-limited everywhere on this track, so more torque changes nothing. Mass barely matters because grip scales with weight; only aero and drag don't.

## Validation (model vs reality)

In progress.

## Limits

- No balance or yaw, so C001 moves to four wheels.
- λ is a fixed number fitted to OptimumLap, not computed from load transfer.
- Curvature noise sets a 0.5% numerical floor. Next fix: smooth curvature over a fixed length in metres, then repeat the ds check.

<!-- What I learned: add 1–2 lines in your words, then remove these comment marks.
## What I learned
-->

<details markdown="1">
<summary>Architecture</summary>

```
lap_time_sim_tester_optimumlap        run script
├─ io / preprocess_track_reference    track → s, ds, k
├─ config_cov_uni_fsae_optimumlap     selects the Excel sheets
├─ packing_parameter_car_A001         → parameter_car_set
└─ solver_forbackward_A002_optimumlap
   ├─ module_ggloop (fzero)           corner speed limit
   ├─ forward:  aero → tyre (λ) → drivetrain
   ├─ backward: aero → tyre → brake
   └─ repeat until settled (3 laps)   → datalog
```

</details>
