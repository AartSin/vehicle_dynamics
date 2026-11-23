---
layout: project
title: "Lap time sim B001: technical report"
permalink: /projects/b001/report/
status: done
dof: "2 DOF bicycle + X, Y, heading (5 states)"
tools: "MATLAB, ode45"
math: true
summary: "Full technical report for B001: method, closed-form verification, controller finding, stability, numerical check and track conversion."
image: /assets/img/b001-circle-error.png
image_caption: "30 m circle at 15 m/s (0.76 g). With heading error taken from ψ, the car settles 25 mm off the line; from ψ+β, 1.4 mm. The fix was tested on a copy of the code; it is not yet applied."
---

[← Back to the B001 summary]({{ '/projects/03-b001/' | relative_url }})

## Aim

A001 has no yaw and no driver. B001 adds both: yaw dynamics from the bicycle model, and a steering controller that follows a reference line. It runs at constant speed, so it gives no lap time. It is the step that proves the driver model before C001 adds four wheels and a speed profile.

## Method

States $$x = [\beta,\ r,\ X,\ Y,\ \psi]$$. Linear bicycle model, with stability derivatives from RCVD p.151 (C<sub>f</sub>, C<sub>r</sub> as positive cornering stiffnesses):

$$
\begin{bmatrix}\dot\beta\\ \dot r\end{bmatrix} = \begin{bmatrix}\frac{Y_\beta}{mV} & \frac{Y_r}{mV}-1\\ \frac{N_\beta}{I_z} & \frac{N_r}{I_z}\end{bmatrix}\begin{bmatrix}\beta\\ r\end{bmatrix} + \begin{bmatrix}\frac{Y_\delta}{mV}\\ \frac{N_\delta}{I_z}\end{bmatrix}\delta
$$

$$
Y_\beta = -(C_f+C_r) \qquad Y_r = -\frac{aC_f-bC_r}{V} \qquad Y_\delta = C_f
$$

$$
N_\beta = -(aC_f-bC_r) \qquad N_r = -\frac{a^2C_f+b^2C_r}{V} \qquad N_\delta = aC_f
$$

Position in the track frame:

$$
\dot X = V\cos\psi - V_y\sin\psi \qquad \dot Y = V\sin\psi + V_y\cos\psi \qquad V_y = V\tan\beta \qquad \dot\psi = r
$$

Steering is the kinematic feedforward plus feedback on yaw rate, heading and lateral error. All three are taken at the nearest track point:

$$
\delta = \tan^{-1}(L\kappa) + K_r(V\kappa - r) - K_\psi e_\psi - K_y e_y
$$

$$
e_\psi = \psi - \psi_{ref} \qquad e_y = (Y-Y_{ref})\cos\psi_{ref} - (X-X_{ref})\sin\psi_{ref}
$$

Gains: K<sub>r</sub> 0.32, K<sub>ψ</sub> 7.8, K<sub>y</sub> 2.

## Fidelity and the direction of each error

| Assumption | Effect |
|---|---|
| Linear tyres, no saturation | no grip limit, so any speed is possible; tracking error optimistic |
| Constant speed, no longitudinal dynamics | no lap time; no braking or drive load transfer |
| No load transfer or roll; fixed cornering stiffness | cornering stiffness too high when loaded; optimistic |
| No steering angle or rate limit, no actuator lag | steering can jump instantly; optimistic |
| Nearest track point, not projection | e<sub>y</sub> and κ quantised to ds = 0.1 m |

## Verification: code against closed form

<p class="small">200 kg, I<sub>z</sub> 90 kg m², a 0.72 m, b 0.88 m, C<sub>f</sub> 32,000 N/rad, C<sub>r</sub> 30,000 N/rad</p>

| Check | Code | Closed form |
|---|---:|---:|
| Understeer gradient (`understeer_gradient.m`) | 0.246 °/g | 0.246 °/g |
| Yaw gain r/δ at 10 / 20 / 30 m/s [1/s] | 6.084 / 11.268 / 15.047 | same, < 10<sup>−10</sup>% |
| Sideslip gain β/δ at 10 / 20 / 30 m/s | 0.353 / −0.180 / −0.913 | same, < 10<sup>−10</sup>% |
| ω<sub>n</sub>, ζ at 20 m/s (`W_freq_response.m` vs eig(A)) | 19.46 rad/s, 0.967 | 19.46 rad/s, 0.967 |

Steady-state gains come from $$-A^{-1}B$$ and are checked against $$r/\delta = V/(L+KV^2)$$, with K the understeer gradient. The signs of all six derivatives check out.

### Closed-loop test: 30 m circle at 15 m/s (0.76 g)

The car settles 25 mm off the line, and the heading error settles at −0.389°. The steady sideslip from the closed form is $$\beta = (b - maV^2/LC_r)/R = 0.391°$$. The heading error is β with the sign flipped. The controller holds the *body* on the tangent, but the car has to yaw β away from its path to corner. So the velocity points off the line, and K<sub>y</sub>e<sub>y</sub> grows until it balances K<sub>ψ</sub>β.

The fix is to measure heading error from the velocity direction, $$e_\psi = \psi + \beta - \psi_{ref}$$. It was tested on a copy of the code and is not yet applied. RMS lateral error on the 44 × 24 m ellipse, first 10 m excluded:

| Speed [m/s] | 5 | 10 | 15 | 20 | 25 | 30 | circle |
|---|---:|---:|---:|---:|---:|---:|---:|
| e<sub>ψ</sub> from ψ [mm] | 176 | 122 | 41 | 76 | 225 | 420 | 25.0 |
| e<sub>ψ</sub> from ψ+β [mm] | 5.3 | 6.5 | 3.5 | 12.0 | 35 | 98 | 1.4 |

The old error is smallest near 17 m/s, the speed where steady sideslip crosses zero ($$V=\sqrt{bLC_r/ma}$$ = 17.1 m/s). That points to β as the cause.

<figure><img src="{{ '/assets/img/b001-error-vs-speed.png' | relative_url }}" alt="RMS lateral error against speed"><figcaption class="small">Shaded: speeds this ellipse cannot be driven at with μ<sub>y</sub> = 1.5. Above 9.8 m/s the results are a mathematical stress test, not feasible driving.</figcaption></figure>

Other issues found, largest first:

1. **Start/finish seam.** The spline and `gradient` in the track preprocess are not periodic, so curvature at the seam is wrong by 0.074 1/m (48% of peak). The 5 s test covers 100 m of the 109 m lap and never reaches the seam. Running 6 s crosses it, and peak steer rises from 19.8° to 35.8°.
2. **Start condition.** The car starts with zero yaw rate at the tightest point of the ellipse, which needs 3.1 rad/s. The yaw-rate term alone asks for 36° of steer, and the total peaks at 57° in the first 0.2 m. Starting at r = Vκ cuts the peak to 41°.
3. **Feedforward ignores understeer.** $$\tan^{-1}(L\kappa)$$ misses the K a<sub>y</sub> term, 0.19° on the circle. Feedback covers it; it is small on this car (0.25 °/g).
4. **Dead parameter.** The run script sets `basic.mass = 300`. The model reads `chassis.mass = 200`.

## Stability with fixed gains

Linearised closed loop [β, r, e<sub>ψ</sub>, e<sub>y</sub>] on a straight:

| Speed [m/s] | 5 | 10 | 15 | 20 | 25 | 30 | 40 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Slowest pole, real part [1/s] | −1.15 | −2.59 | −5.15 | −6.46 | −5.03 | −4.03 | −2.76 |
| Lowest damping ζ | 1.00 | 1.00 | 1.00 | 0.80 | 0.62 | 0.49 | 0.34 |

The closed loop is stable at every speed tested. Damping falls above 15 m/s because the gains are fixed, not scheduled with speed.

<figure><img src="{{ '/assets/img/b001-damping.png' | relative_url }}" alt="Lowest closed-loop damping against speed"></figure>

## Numerical check

Results at 20 m/s on the ellipse, first 10 m excluded:

| Setting | max \|e<sub>y</sub>\| [mm] | RMS e<sub>y</sub> [mm] | max \|δ\| [°] |
|---|---:|---:|---:|
| ode45 default, ds 0.1 m | 182.1 | 75.5 | 19.8 |
| RelTol 10<sup>−6</sup> | 182.3 | 76.1 | 19.8 |
| ds 0.05 m | 179.2 | 71.6 | 17.6 |
| ds 0.2 m | 175.6 | 76.7 | 22.8 |
| ds 0.5 m | 188.3 | 79.5 | 38.7 |

The solver tolerance is converged: the change is 0.1%. Track spacing moves RMS error by ±5%. At ds 0.5 m, curvature noise doubles the steer peaks, so ds should stay at 0.1 m or below.

## Track conversion: OptimumLap to X–Y

OptimumLap stores tracks as arcs (length, radius, direction). B001 needs X–Y points, so I decoded the binary `.OLTra` format and integrated the arcs. FSEC 2025, ds 0.1 m:

| Check | OptimumLap | B001 | Error |
|---|---:|---:|---:|
| File statistics recomputed (7 values) | stored | decoded | 0% |
| Lap length | 985.06 m | 985.06 m | 0.0003% |
| Net heading change | −360° | −360.00° | 0.0003% |
| Minimum corner radius | 4.488 m | 4.521 m | +0.7% |
| Curvature correlation, 1 m average |  | r = 0.9998 | RMSE 2.6% of mean \|κ\| |

**OptimumLap's arcs do not close.** Integrated, they leave a 2.87 m gap and a 2.42° heading error. I added a smooth periodic correction to curvature, solved by Newton in 5 iterations. It changes curvature by 0.1% RMS but moves points by up to 5.6 m (2.8 m mean). Without it, lap length is +0.29% and net heading is −376.9°. Minimum radius depends on ds: +0.7% at 0.1 m, +3.4% at 0.25 m, +15.5% at 1 m.

<figure><img src="{{ '/assets/img/b001-track-curvature.png' | relative_url }}" alt="Track curvature from OptimumLap arcs and from the B001 conversion"><figcaption class="small">First 300 m of FSEC 2025, OptimumLap arcs against the B001 conversion (1 m average).</figcaption></figure>

## Results

<p class="small">44 × 24 m ellipse (109 m, minimum radius 6.5 m) · 20 m/s · first 10 m excluded</p>

- Lateral error: max 182 mm, RMS 76 mm. With ψ+β: max 40 mm, RMS 12 mm.
- Peak steer 19.8°, peak sideslip 3.0°.
- Peak lateral acceleration 7.2 g.

**The test case is not physical.** 20 m/s on a 6.5 m radius needs 6.2 g. At μ<sub>y</sub> 1.5, the limit is 9.8 m/s. Linear tyres never saturate, so B001 cannot see this. That is the main reason C001 needs nonlinear tyres and a speed profile. The 30 m circle at 15 m/s (0.76 g) is the physically possible test.

## Sensitivity

RMS lateral error at 20 m/s (base 75.5 mm):

| Gain | −20% [mm] | +20% [mm] |
|---|---:|---:|
| K<sub>y</sub> (lateral) | 92.1 | 63.7 |
| K<sub>ψ</sub> (heading) | 60.2 | 86.0 |
| K<sub>r</sub> (yaw rate) | 73.6 | 78.8 |

More heading gain gives *more* lateral error. That fits the β finding: the heading term pulls the body onto the tangent and pushes the car off the line.

## Validation (model vs reality)

In progress.

## Limits

- Linear tyres: no grip limit, so B001 cannot produce a speed profile or a lap time.
- Gains are tuned at 20 m/s and not scheduled; damping drops to 0.34 at 40 m/s.
- The car data is placeholder (the chassis sheet says so). C<sub>f</sub>, C<sub>r</sub>, a and b match the RCVD worked-example numbers.

<!-- What I learned: add 1–2 lines in your words, then remove these comment marks.
## What I learned
-->

<details markdown="1">
<summary>Architecture</summary>

```
lap_time_sim_tester                    run script: V, gains, ode45
├─ config_test_B001                    selects the Excel sheets
├─ packing_parameter_B001              → parameter_car_set, reference path
│  └─ preprocess_track_reference_B001  X, Y → s, ψ_ref, κ_ref (spline, ds 0.1 m)
├─ vehicle_model_B001                  5 states
│  ├─ module_lateral_Yaw_moment_derivatives   RCVD p.151
│  ├─ module_track_geometry_B001       nearest point → e_ψ, e_y, κ
│  ├─ module_control_system_B001       δ = feedforward + feedback
│  └─ module_global_kinematics_B001    Ẋ, Ẏ, ψ̇
└─ postprocess_* → plot_B001

track_converter_app_B001               .OLTra → X–Y xlsx + validation report
├─ io_track_oltra_B001                 binary decoder
├─ preprocess_track_oltra_B001         arcs → X–Y, closure correction
└─ tests/validate_track_conversion_B001
```

</details>
