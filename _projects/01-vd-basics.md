---
title: "Vehicle dynamics basics"
order: 1
code: ""
category: "Handling & ride"
status: done              # done, in progress, or planned
dof: "2 DOF quarter car · 2 DOF bicycle"
purpose: "Learn the core handling and ride models"
tools: "MATLAB"
updated: "April 2026"
summary: "The standard 2-DOF quarter-car and bicycle models, written while learning the theory."
math: true
demo: bicycle             # shows the interactive demo; delete this line to hide it
# code_path: "models/vd-basics"
image: /assets/img/vd-basics-step-steer.png
image_caption: "Step steer response from my step_steer_response.m (RCVD chapter 6 example), with a second steer step at 1 s."
---

Where I started, in spring 2026. Two small models from the textbook:

- a **quarter car** (body and wheel bounce) driven over a road profile, to see what spring and damper changes do to ride
- a **linear bicycle model** (lateral velocity and yaw rate) for step steer, plus the usual handling numbers: understeer gradient, static margin, characteristic or critical speed, yaw natural frequency and damping

## Bicycle model

Constant speed $$u$$, small angles, linear tyres:

$$
m\,(\dot v + u\,r) = F_{yf} + F_{yr}, \qquad I_z\,\dot r = a\,F_{yf} - b\,F_{yr}
$$

$$
F_{yf} = C_f\left(\delta - \frac{v + a r}{u}\right), \qquad F_{yr} = -C_r\,\frac{v - b r}{u}
$$

which gives the understeer gradient

$$
K = \frac{m}{L}\left(\frac{b}{C_f} - \frac{a}{C_r}\right)
$$

