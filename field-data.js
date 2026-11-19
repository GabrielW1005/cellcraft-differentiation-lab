'use strict';
window.fieldMissions = [
  {
    id: 'neuron', name: 'Nerve cell', course: 'Relay Run', domain: 'Animal', color: '#85accd', glyph: 'ϟ',
    precursor: 'Neural precursor', genes: ['Axon & branches', 'Signal proteins'],
    summary: 'A long axon helps a signal travel. Branches help a neuron connect with other cells.',
    tasks: [{ x: 1820, y: 222, glyph: 'ϟ', label: 'Relay', action: 'Send a signal at the relay', done: 'Signal traveled down the axon to a neighboring cell.' }],
    question: 'Which structure carries a signal away from a neuron’s cell body?', answers: ['The axon', 'A chloroplast', 'A root hair'], correct: 0,
    science: 'The axon carries signals away from the cell body. Its endings can communicate with other cells.',
  },
  {
    id: 'muscle', name: 'Skeletal muscle fiber', course: 'Pull Station', domain: 'Animal', color: '#fa9c8e', glyph: '↕',
    precursor: 'Muscle precursor', genes: ['Contractile proteins', 'ATP supply'],
    summary: 'Contractile proteins produce a pull. The fiber shortens as it lifts this load.',
    tasks: [{ x: 1760, y: 253, glyph: '↑', label: 'Load', action: 'Contract to pull the load', done: 'The fiber shortened and pulled the load. The contraction used ATP.' }],
    question: 'What did the skeletal muscle fiber do to lift the load in this model?', answers: ['It added chloroplasts', 'It shortened and pulled', 'It divided into two cells'], correct: 1,
    science: 'Contractile proteins help the fiber shorten and pull. Contraction uses ATP for energy. A real skeletal muscle fiber forms when developing muscle cells fuse.',
  },
  {
    id: 'skin', name: 'Skin surface cell', course: 'Barrier Breach', domain: 'Animal', color: '#ffc784', glyph: '▦',
    precursor: 'Epithelial precursor', genes: ['Flattened cells', 'Cell connections'],
    summary: 'Tightly connected epithelial cells form a protective layer.',
    tasks: [
      { x: 1480, y: 323, glyph: '▦', label: 'Gap 1', action: 'Close the first gap in the barrier', done: 'One gap closed. Close the second gap to finish the layer.' },
      { x: 1840, y: 193, glyph: '▦', label: 'Gap 2', action: 'Close the second gap in the barrier', done: 'Two gaps closed. Closely packed cells help protect the tissue below.' },
    ],
    question: 'How does the arrangement of these cells help protect tissue?', answers: ['The cells carry extra oxygen', 'The cells move farther apart', 'The cells fit tightly together'], correct: 2,
    science: 'Closely packed, connected epithelial cells help form a protective barrier. The game models a living layer of skin cells.',
  },
  {
    id: 'redblood', name: 'Red blood cell', course: 'Oxygen Courier', domain: 'Animal', color: '#f28eaa', glyph: 'O₂',
    precursor: 'Blood-forming precursor', genes: ['Hemoglobin', 'Flexible disc'],
    summary: 'Hemoglobin binds oxygen. A flexible disc shape helps the cell pass through narrow vessels.',
    tasks: [
      { x: 1420, y: 150, glyph: 'O₂', label: 'Lungs', action: 'Load oxygen at the lungs', done: 'Hemoglobin picked up oxygen in capillaries near the air sacs.' },
      { x: 1945, y: 310, glyph: 'O₂', label: 'Body tissue', action: 'Release oxygen at body tissue', done: 'Oxygen was released near body cells that need it.' },
    ],
    question: 'What helps the cell carry oxygen?', answers: ['Hemoglobin', 'A nucleus', 'A cell wall'], correct: 0,
    science: 'Hemoglobin binds oxygen. Developing red blood cells use DNA instructions, then lose their nuclei as they mature in humans.',
  },
  {
    id: 'leaf', name: 'Leaf mesophyll cell', course: 'Light Harvest', domain: 'Plant', color: '#b8dc8a', glyph: '☀',
    precursor: 'Plant shoot precursor', genes: ['Chloroplasts', 'Light-capturing proteins'],
    summary: 'Chloroplasts use energy from light to make sugars from water and carbon dioxide.',
    tasks: [
      { x: 1372, y: 331, glyph: 'H₂O', label: 'Water', action: 'Take up water', done: 'Water acquired. Water reaches leaves from roots through plant tissues.' },
      { x: 1645, y: 148, glyph: 'CO₂', label: 'Carbon dioxide', action: 'Take in carbon dioxide', done: 'Carbon dioxide acquired. The gas can enter a leaf through pores.' },
      { x: 1944, y: 227, glyph: '☀', label: 'Sunlit leaf', action: 'Use light at the sunlit leaf', done: 'Chloroplasts used light energy to make sugar and release oxygen.' },
    ],
    question: 'What two materials go into photosynthesis with light energy?', answers: ['Sugar and oxygen', 'Water and carbon dioxide', 'Oxygen and hemoglobin'], correct: 1,
    science: 'Photosynthesis uses water and carbon dioxide with light energy. Sugars are made and oxygen is released.',
  },
  {
    id: 'root', name: 'Root hair cell', course: 'Water Channel', domain: 'Plant', color: '#83d8c9', glyph: '↝',
    precursor: 'Root epidermal precursor', genes: ['Long hair extension', 'Ion transport proteins'],
    summary: 'The long extension increases the area in contact with soil. Water enters by osmosis.',
    tasks: [
      { x: 1420, y: 173, glyph: 'H₂O', label: 'Water pocket', action: 'Absorb water at the water pocket', done: 'Water moved through a selectively permeable membrane by osmosis.' },
      { x: 1900, y: 334, glyph: 'K⁺', label: 'Mineral pocket', action: 'Take up mineral ions', done: 'Transport proteins help the cell take up mineral ions.' },
    ],
    question: 'How does a long root hair help absorption?', answers: ['It makes oxygen from sunlight', 'It makes the roots shorter', 'It increases surface area in contact with soil'], correct: 2,
    science: 'The long extension increases the area touching soil. Water enters by osmosis, and membrane transport proteins help take up mineral ions.',
  },
];
