# Cellcraft: Micro Missions

Play: https://gabrielw1005.github.io/cellcraft-differentiation-lab/

An original 2D action game about cell specialization, built with Canvas 2D and browser-local progress. No external assets, libraries, network calls, worksheets, or accounts are required.

## Four missions, twelve levels

- **Tissue Patrol:** defend healthy tissue across three waves of harmful bacteria. Chase motile, flagellated swimmers and prioritize dividing bacteria before binary fission increases their numbers. Hold Engulf to surround a target with pseudopods and form a phagosome; lysosomal digestion follows. Hold Shift/Quick crawl for faster amoeboid movement at an energy cost. Bacteria near tissue create visible infection pressure and reduce tissue integrity. Healthy tissue and cell membranes have collision boundaries. No projectiles, gore, or magical powers.
- **Oxygen Run:** a red blood cell is carried by a visible current. Guide the model toward tissue exchange zones and model passive deformation through narrow capillaries. Oxygen loading and unloading are by diffusion.
- **Signal Sprint:** time incoming cues to start electrical waves along a fixed neuron. Chemical messengers cross the synapse. The wave is an electrical change, not a single particle traveling through the axon.
- **Water Reach:** grow one anchored root hair around soil particles. Existing contacted membrane takes up water by osmosis even when growth stops. Very salty external soil can cause net water loss.

Each mission has three selectable levels with larger, distinct maps and gradually more demanding objectives. Tissue regions and passages, winding blood vessels, longer fixed axons, and soil pockets give each specialist a different route. Named landmarks and a minimap help players find their way. All levels are available from the level selector; completing one offers the next level without locking students out of later content.

WASD/arrows or drag for movement, Space/Action for the current cell action, P/Escape to pause. Touch joystick and action button are included. Signal Sprint uses timed taps. Root-hair growth moves forward with up/down steering. Sound is optional and off by default. Relaxed, Standard, and Challenge settings change bacterial speed, division timing, tissue damage, flow speed, timing windows, and root-growth pressure. Completion and best scores save on the device for each level and difficulty. Progress stays local to that browser.

## Science scope

Each mission begins with a fresh, tissue-appropriate developing cell. Mature cells do not switch freely into unrelated types. Real cells do not consciously steer or choose their jobs. Sizes, speeds, molecule counts, scores, timers, and the timing ring are game abstractions. Waves represent repeated bacterial entry. Swimmer/divider are gameplay roles, not scientific categories; both can reproduce under suitable conditions. Division counts are capped to keep the scenario finite. Bacteria respond to local conditions and do not deliberately plan attacks. Tissue integrity and crawling energy are game meters, not biological measurements. Map distances, named landmarks, and oxygen/water totals are schematic navigation and scoring tools, not anatomical measurements. A larger map does not turn the fixed neuron or anchored root hair into a freely moving cell.

Mature human red blood cells remain red and have no nucleus or mitochondria. They do not use the oxygen they transport for their own ATP production. Macrophages do not gain powers or DNA instructions by engulfing bacteria. Water and mineral-ion uptake are distinct; root hair cells usually lack chloroplasts. All living cells use energy.

Primary sources are linked in the in-game Science notes and recorded in `science.js`: NIH Stem Cell Basics and OpenStax biology, anatomy/physiology, and microbiology.

## Implementation

`levels.js` defines the twelve maps and objectives, `engine.js` contains the simulation, `render.js` supplies cell drawings, `maps.js` adds map details and the minimap, `science.js` holds mission content and source links, and `game.js` handles controls, level selection, progress, the HUD, and the render loop. Open `index.html` or serve this directory as static files. `.nojekyll` enables direct GitHub Pages hosting.
