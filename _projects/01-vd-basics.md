---
title: "VD basics: quarter car and bicycle model step steer"
order: 1
code: "VD0"
category: "Vehicle dynamics basics"
status: done
dof: "Quarter car 2 DOF · bicycle 2 DOF (β, r)"
purpose: "Learn ride and handling basics; check each model against hand calculations and a textbook example"
tools: "MATLAB, ode45"
summary: "A 2-DOF quarter car and the Race Car Vehicle Dynamics step-steer example. Both match hand calculations; the step steer reproduces the book's results at 40 and 80 mph."
math: true
# image: /assets/img/vd-step-steer.png   <- switch on only if the Projects list needs a card image; it also shows at the top of the page
---

My first two vehicle dynamics models, built to learn the basics before the lap-time simulators: a 2-DOF quarter car for ride, and the linear bicycle model step steer from Race Car Vehicle Dynamics (RCVD) chapter 6. B001 builds its path-following model on the same bicycle equations.

## Quarter car

Body (sprung mass) and wheel (unsprung mass), suspension spring and damper, tyre as a spring:

<figure><img src="{{ '/assets/img/vd-fbd-quarter.png' | relative_url }}" alt="Quarter car model and free-body diagrams of body and wheel"><figcaption class="small">Quarter car and the free-body diagram of each mass. Newton's second law on each mass gives the two equations below.</figcaption></figure>

$$
m_b\ddot y_b = k_s(y_t - y_b) + c(\dot y_t - \dot y_b) - m_b g
$$

$$
m_t\ddot y_t = k_t(y_r - y_t) - k_s(y_t - y_b) - c(\dot y_t - \dot y_b) - m_t g, \qquad c = 2\zeta\sqrt{k_s m_b}
$$

Example parameter set: m<sub>b</sub> 300 kg, m<sub>t</sub> 40 kg, k<sub>s</sub> 15,000 N/m, k<sub>t</sub> 200,000 N/m, ζ 0.3 (c = 1,273 N s/m). The car settles under gravity, then meets a 20 mm road step at 5 s. Integrated with `ode45`, 3000 output points.

| Check | Hand calc | 2-DOF model |
|---|---:|---:|
| Static body / tyre deflection | 212.9 / 16.7 mm | 212.9 / 16.7 mm |
| Body mode, √(k<sub>s</sub>/m<sub>b</sub>) | 1.13 Hz | 1.10 Hz, ζ 0.27 |
| Wheel hop, √((k<sub>s</sub>+k<sub>t</sub>)/m<sub>t</sub>) | 11.67 Hz | 11.54 Hz, ζ 0.22 |

Static deflections come from the simulation; the 2-DOF frequencies from the eigenvalues of the linear model. The hand calc treats each mode on its own. The body mode is 2.4% lower in the full model because the tyre spring sits in series with the suspension spring, and its damping is 0.27 rather than the 0.3 set on k<sub>s</sub> alone.

<figure><img src="{{ '/assets/img/vd-quarter-car-step.png' | relative_url }}" alt="Body and wheel response to a 20 mm road step"><figcaption class="small">20 mm road step at 5 s, motion about the static position. The wheel follows within 0.2 s at wheel-hop frequency. The body peaks at 29.9 mm 0.39 s after the step (50% overshoot) and settles at the body mode. Tyre load stays above 1,608 N (static 3,335 N), so the wheel never leaves the road.</figcaption></figure>

## Bicycle model step steer

Linear bicycle model with stability derivatives from RCVD p.151:

<figure><img src="{{ '/assets/img/vd-fbd-bicycle.png' | relative_url }}" alt="Bicycle model top view with tyre forces, sideslip, yaw rate and steer angle"><figcaption class="small">Lateral forces and yaw moment about the CG give mV(β̇ + r) = F<sub>yf</sub> + F<sub>yr</sub> and I<sub>z</sub>ṙ = aF<sub>yf</sub> − bF<sub>yr</sub> (small angles). Linear tyres make both sums linear in β, r and δ, which gives the stability-derivative form below.</figcaption></figure>

$$
\dot\beta = \frac{Y_\beta\beta + Y_r r + Y_\delta\delta}{mV} - r, \qquad \dot r = \frac{N_\beta\beta + N_r r + N_\delta\delta}{I_z}
$$

Car and speeds from RCVD's first step-response example (p.256): 2000 lb, 65% front, I<sub>z</sub> 832 slug ft², wheelbase 8.33 ft, C<sub>F</sub> / C<sub>R</sub> −13,752 / −11,460 lb/rad. A 5° steer step from straight running. Understeer gradient: 1.91 °/g in the book, 1.917 °/g from my code.

| | 40 mph book | 40 mph mine | 80 mph book | 80 mph mine |
|---|---:|---:|---:|---:|
| ω<sub>n</sub> [rad/s] | 9.36 | 9.37 | 6.45 | 6.46 |
| ζ | 0.864 | 0.864 | 0.628 | 0.627 |
| τ<sub>r</sub> / τ<sub>β</sub> [s] | 0.112 / −0.45 | 0.111 / −0.459 | 0.224 / −0.049 | 0.223 / −0.049 |
| r: time to 90% / peak [s] | 0.17 / 0.38 | 0.175 / 0.372 | 0.13 / 0.34 | 0.129 / 0.329 |
| r: overshoot | 3.0% | 2.6% | 29.0% | 29.7% |
| β: time to 90% / peak [s] | 0.49 / 0.76 | 0.509 / 0.757 | 0.41 / 0.67 | 0.417 / 0.664 |
| β: overshoot | 1.5% | 1.1% | 8.0% | 8.3% |

The book reads its response times and overshoots off graphs, and rounds a / b to 2.92 / 5.41 ft where my code computes them from the 65% front weight. Everything agrees to within 0.02 s and 0.7 percentage points.

<figure><img src="{{ '/assets/img/vd-step-steer.png' | relative_url }}" alt="Yaw rate and sideslip step response at 40 and 80 mph"><figcaption class="small">5° steer step at 40 and 80 mph, normalised by steady state and plotted against ω<sub>n</sub>t as in RCVD Figs 6.9–6.12. Yaw overshoot grows from 2.6% to 29.7% as damping falls from 0.864 to 0.627. At 40 mph sideslip first moves the wrong way (τ<sub>β</sub> = −0.46 s) before settling.</figcaption></figure>

## Limits

Both models are linear: springs, damper and tyres never saturate. The quarter car has no bump stops or tyre lift-off, its road step is instantaneous, and its parameters are an example set, not a real car. The step steer runs at constant speed, in the book's imperial units.

<!-- What I learned: add 1–2 lines in your words, then remove these comment marks.
## What I learned
-->

## Documents

PDF: [VD basics summary]({{ '/assets/pdf/VD_basics_summary.pdf' | relative_url }})
