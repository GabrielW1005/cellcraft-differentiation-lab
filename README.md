# Cellcraft: Micro Missions

Play: https://gabrielw1005.github.io/cellcraft-differentiation-lab/

An original 2D action game about cell specialization, built with Canvas 2D and browser-local progress. No external assets, libraries, network calls, worksheets, or accounts are required.

## Four playable missions

- **Tissue Patrol:** crawl as a macrophage, surround bacteria with pseudopods, seal a phagosome, then digest the captured material. Healthy tissue cells and the macrophage membrane have collision boundaries.
- **Oxygen Run:** a red blood cell is carried by a visible current. Guide the model toward tissue exchange zones and model passive deformation through narrow capillaries. Oxygen loading and unloading are by diffusion.
- **Signal Sprint:** time incoming cues to start electrical waves along a fixed neuron. Chemical messengers cross the synapse. The wave is an electrical change, not a single particle traveling through the axon.
- **Water Reach:** grow one anchored root hair around soil particles. Existing contacted membrane takes up water by osmosis even when growth stops. Very salty external soil can cause net water loss.

WASD/arrows or drag for movement, Space/Action for the current cell action, P/Escape to pause. Touch joystick and action button are included. Signal Sprint uses timed taps. Root-hair growth moves forward with up/down steering. Sound is optional and off by default. Standard and relaxed pacing are available. Best scores and completed missions save on the device.

## Science scope

Each mission begins with a fresh, tissue-appropriate developing cell. Mature cells do not switch freely into unrelated types. Real cells do not consciously steer or choose their jobs. Sizes, speeds, molecule counts, scores, timers, and the timing ring are game abstractions.

Mature human red blood cells remain red and have no nucleus or mitochondria. They do not use the oxygen they transport for their own ATP production. Macrophages do not gain powers or DNA instructions by engulfing bacteria. Water and mineral-ion uptake are distinct; root hair cells usually lack chloroplasts. All living cells use energy.

Primary sources are linked in the in-game Science notes and recorded in `science.js`: NIH Stem Cell Basics and OpenStax biology, anatomy/physiology, and microbiology.

## Implementation

`engine.js` contains the simulation, `render.js` original drawing helpers, `science.js` mission content and source links, and `game.js` controls, HUD and render loop. Open `index.html` or serve this directory as static files. `.nojekyll` enables direct GitHub Pages hosting.
