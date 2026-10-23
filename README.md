# Vehicle dynamics models

Vehicle dynamics and lap time simulation models in MATLAB, by Alvin (Motorsport Engineering, Coventry University).

**Website:** https://aartsin.github.io/vehicle_dynamics/

| Model | DOF | Purpose | Status |
|---|---|---|---|
| Vehicle dynamics basics | 2 DOF quarter car, 2 DOF bicycle | Handling and ride fundamentals | Done |
| A001 point-mass lap sim | Point mass, quasi-steady | First lap time solver | Done |
| B001 bicycle path following | 2 DOF bicycle + position | Steering controller around a track | Done |
| C001 4-wheel GGV | 4-wheel quasi-steady | Steady-state cornering and GGV envelope | In progress |
| D001 powertrain | Drivetrain sub-model | Engine to tyre torque | In progress |
| Validation and correlation | To be decided | Check the simulation against real data | Planned |

The code for each model is in the `models` folder. To edit the website, see [HOW-TO-EDIT.md](HOW-TO-EDIT.md).
