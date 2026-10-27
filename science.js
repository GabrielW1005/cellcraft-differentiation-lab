/* Original grade-7 science content. Each mission starts with a fresh,
   tissue-appropriate precursor. All living cells use energy. */
'use strict';
window.MISSIONS = [
  {
    id: 'immune',
    title: 'Tissue Patrol',
    cell: 'Macrophage',
    tag: 'ENGULF & DEFEND',
    color: '#b89bff',
    summary: 'Defend healthy tissue through 3 waves of invading bacteria. Catch fast swimmers and engulf dividing cells before their numbers grow.',
    precursor: 'A new monocyte can develop into a macrophage. This is a fresh immune cell, not a different mature cell switching jobs.',
    structure: 'A flexible cell membrane forms extensions called pseudopods. Compartments called lysosomes supply substances that help digest engulfed bacteria.',
    job: 'Engulf and break down invading bacteria and cell debris.',
    controls: 'Move with WASD, arrow keys, or dragging. Hold Space or Engulf beside a bacterium until the membrane seals. Hold Shift or Quick crawl while moving to crawl faster; release it to recover energy.',
    goal: 'Clear all bacteria in 3 waves before time or tissue integrity runs out. Protect glowing tissue and stop dividing bacteria early.',
    modelNote: 'Waves represent repeated bacterial entry. Speeds, division times, tissue damage, and the energy meter are game rules. Quick crawl models faster crawling. Swimmer and divider are gameplay roles, not scientific categories: both can reproduce in suitable conditions. Bacteria respond to their environment; they do not plan attacks.',
    discovery: [
      'In phagocytosis, pseudopods surround a bacterium. The membrane seals it into a phagosome; lysosomes help digest it.',
      'Some bacteria swim using rotating flagella. Bacteria commonly reproduce by binary fission: one cell grows, copies its DNA, and divides into two.',
      'These targets model harmful invaders. Many bacteria are harmless or helpful. Macrophages use energy to move and engulf; they do not gain powers from captured bacteria.'
    ],
    sources: [
      { label: 'OpenStax: Phagocytosis', url: 'https://openstax.org/books/microbiology/pages/17-4-pathogen-recognition-and-phagocytosis' },
      { label: 'OpenStax: Bacterial structures and movement', url: 'https://openstax.org/books/microbiology/pages/3-3-unique-characteristics-of-prokaryotic-cells' },
      { label: 'OpenStax: Binary fission', url: 'https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow' },
      { label: 'OpenStax: Infection and tissue damage', url: 'https://openstax.org/books/microbiology/pages/15-2-how-pathogens-cause-disease' },
      { label: 'NIH: Cell differentiation', url: 'https://stemcells.nih.gov/info/basics/stc-basics' }
    ]
  },
  {
    id: 'flow',
    title: 'Oxygen Run',
    cell: 'Human red blood cell',
    tag: 'FLOW & DELIVER',
    color: '#ff927e',
    summary: 'Ride the blood current, squeeze through narrow passages, and deliver oxygen to working tissues.',
    precursor: 'A fresh blood-forming precursor develops in bone marrow. During development, a human red blood cell loses its nucleus.',
    structure: 'A flexible, indented disc carries hemoglobin, a protein that binds oxygen.',
    job: 'Transport oxygen from the lungs to body tissues while staying inside blood vessels.',
    controls: 'The current carries you forward. Use W/S, up/down, or dragging to guide the model vertically. Hold Space or Action to model squeezing through a narrow passage.',
    goal: 'Load oxygen near the lungs and supply every tissue target shown for this level.',
    modelNote: 'Real red blood cells do not steer or squeeze on command: blood flow carries and deforms them. Oxygen loading and unloading happen by diffusion. Targets and molecule counts are game symbols.',
    discovery: [
      'Oxygen diffuses into blood near the lungs and binds to hemoglobin. Some oxygen is released near tissues that need it.',
      'Mature human red blood cells have no nucleus or mitochondria. They make usable cell energy without using the oxygen they carry.',
      'Blood is red: oxygen-rich blood is brighter red, and oxygen-poor blood is darker red—not blue.'
    ],
    sources: [
      { label: 'OpenStax: Red blood cells', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes' },
      { label: 'OpenStax: Gas transport', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-5-transport-of-gases' }
    ]
  },
  {
    id: 'signal',
    title: 'Signal Sprint',
    cell: 'Neuron',
    tag: 'RECEIVE & RELAY',
    color: '#79c4ff',
    summary: 'Time incoming signals and send an electrical wave along a fixed neuron.',
    precursor: 'A new neural precursor develops the structures of a neuron. A mature blood or plant cell is not turning into a neuron.',
    structure: 'Branching connections receive signals. A long extension called an axon carries an electrical signal toward its endings.',
    job: 'Receive information and communicate with other cells using electrical and chemical signals.',
    controls: 'Press Space or Action when the incoming cue reaches the ring. Let the neuron reset before the next transmission.',
    goal: 'Complete this level’s goal of successful signal transmissions.',
    modelNote: 'The neuron stays in place. The glow represents a changing electrical state along its membrane, not one particle racing through the cell. The timing challenge and reset period are simplified.',
    discovery: [
      'An action potential is an electrical change that spreads along the axon membrane.',
      'At many synapses, an arriving electrical signal triggers release of chemical messengers to the next cell.',
      'A short refractory period helps the membrane reset. Maintaining the conditions for signaling uses cell energy.'
    ],
    sources: [
      { label: 'OpenStax: How neurons communicate', url: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate' },
      { label: 'NIH: Cell differentiation', url: 'https://stemcells.nih.gov/info/basics/stc-basics' }
    ]
  },
  {
    id: 'root',
    title: 'Water Reach',
    cell: 'Root hair cell',
    tag: 'GROW & ABSORB',
    color: '#c2d889',
    summary: 'Grow one anchored root hair around soil particles to reach moist soil and increase water uptake.',
    precursor: 'A fresh developing cell in a young root’s outer layer specializes as a root hair cell. The hair is an extension of that one cell.',
    structure: 'A long, thin extension increases the membrane area in contact with soil water.',
    job: 'Absorb water and mineral nutrients from the soil.',
    controls: 'Hold Space or Action to grow. Use W/S, up/down, or aim ahead with the pointer to bend the growing tip as it extends forward. Water enters automatically where the existing hair contacts moist soil.',
    goal: 'Reach this level’s water goal. Water units are a game score, not a real biological measurement.',
    modelNote: 'The cell remains anchored, and only one extension grows. Your steering models growth direction; real cells respond to biological conditions. Water uptake is passive osmosis. Mineral-ion uptake uses transport proteins and is not simulated in this mission.',
    discovery: [
      'A root hair increases surface area, giving soil water more membrane to cross.',
      'Water moves across the cell membrane by osmosis. It is not swallowed like food.',
      'Mineral ions use membrane transport proteins. They do not enter by osmosis, and the root hair usually has no chloroplasts.'
    ],
    sources: [
      { label: 'OpenStax: Roots', url: 'https://openstax.org/books/biology/pages/30-3-roots' },
      { label: 'OpenStax: Water and solute transport', url: 'https://openstax.org/books/biology/pages/30-5-transport-of-water-and-solutes-in-plants' }
    ]
  }
];
