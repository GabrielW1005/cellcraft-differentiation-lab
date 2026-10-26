/* CellCraft Lab — original schematic cell illustrations. */
(function () {
  'use strict';
  const p = { blue: '#4c83e8', blueLight: '#dae8ff', blueDark: '#24538d', coral: '#ee8d79', coralLight: '#ffe0d5', coralDark: '#bd5a4d', lilac: '#b09bdb', lilacLight: '#ece3fa', lilacDark: '#7961a9', lime: '#a8bc6e', limeLight: '#e9edcf', limeDark: '#677e37', ink: '#344454', muted: '#647384' };
  function label(text, x, y, path, anchor) {
    return `<g class="cell-label"><path d="${path}" fill="none" stroke="${p.muted}" stroke-width="1.5" stroke-linecap="round"/><text x="${x}" y="${y}" text-anchor="${anchor || 'start'}">${text}</text></g>`;
  }
  function nucleus(x, y, rx, ry) {
    return `<ellipse cx="${x}" cy="${y}" rx="${rx || 30}" ry="${ry || 25}" fill="${p.lilac}" stroke="${p.lilacDark}" stroke-width="2"/><ellipse cx="${x + 4}" cy="${y - 2}" rx="${(rx || 30) * .28}" ry="${(ry || 25) * .31}" fill="${p.lilacDark}" opacity=".7"/>`;
  }
  function mitochondrion(x, y, a) {
    return `<g transform="translate(${x} ${y}) rotate(${a || 0})"><rect x="-20" y="-10" width="40" height="20" rx="10" fill="${p.coral}"/><path d="M-12 0l7-5 6 10 6-10 6 5" fill="none" stroke="${p.coralDark}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  function chloroplast(x, y, a) {
    return `<g transform="translate(${x} ${y}) rotate(${a || 0})"><ellipse rx="19" ry="11" fill="${p.lime}" stroke="${p.limeDark}" stroke-width="1.4"/><path d="M-10-4v8m5-9v10m5-10v10m5-10v10m5-9v8" stroke="${p.limeDark}" stroke-width="2" opacity=".7"/></g>`;
  }
  function animalStem(labels) {
    return `<path class="cell-body stem-body" d="M184 109C218 58 309 55 371 85S450 168 417 233 338 314 269 295 171 272 157 216 157 149 184 109Z" fill="${p.blueLight}" stroke="${p.blue}" stroke-width="4"/>
      ${nucleus(290, 177, 48, 43)}${mitochondrion(217, 139, -25)}${mitochondrion(351, 238, 20)}${mitochondrion(218, 238, -10)}
      <g fill="${p.blue}" opacity=".4"><circle cx="350" cy="130" r="5"/><circle cx="365" cy="151" r="4"/><circle cx="244" cy="104" r="4"/><circle cx="250" cy="257" r="4"/><circle cx="383" cy="192" r="4"/></g>
      ${labels ? label('Cell membrane', 419, 80, 'M413 87L434 96 420 126') + label('Nucleus · DNA', 59, 184, 'M165 179H233') + label('Cytoplasm', 443, 278, 'M437 272L402 255 391 232') : ''}`;
  }
  function neuron(labels, active) {
    return `<g fill="none" stroke="${p.blue}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M177 151L143 109 107 98M143 109L137 67M164 164L111 161 77 137M111 161L77 184M166 202L127 230 92 224M127 230L114 271M194 221L182 267 152 290M182 267L209 294M216 134L227 91 207 67M227 91L257 72"/>
      <path d="M250 184C306 180 348 186 405 183L481 183M481 183L508 151 533 141M508 151L510 125M481 183L522 187 545 169M522 187L544 209M481 183L502 227 531 243M502 227L494 250"/>
    </g><path d="M173 144C195 126 224 135 243 155L263 184 239 211C213 235 182 225 165 203L154 178Z" fill="${p.blueLight}" stroke="${p.blue}" stroke-width="4"/>
      ${nucleus(208, 179, 24, 22)}
      <g fill="${p.lilacLight}" stroke="${p.lilac}" stroke-width="2"><rect x="277" y="170" width="39" height="26" rx="12"/><rect x="326" y="170" width="39" height="26" rx="12"/><rect x="375" y="170" width="39" height="26" rx="12"/><rect x="424" y="170" width="39" height="26" rx="12"/></g>
      ${active ? '<g class="neuron-signal"><circle class="flow-dot" cx="269" cy="183" r="6" fill="#ee8d79"/><circle class="flow-dot signal-delay" cx="269" cy="183" r="6" fill="#ee8d79"/></g>' : ''}
      ${labels ? label('Dendrites', 55, 57, 'M124 62L145 80 157 125') + label('Cell body', 208, 326, 'M208 303V231', 'middle') + label('Axon', 364, 124, 'M364 132V166', 'middle') + label('Axon endings', 471, 296, 'M497 278L514 248') : ''}`;
  }
  function muscle(labels) {
    let bands = '';
    for (let x = 143; x <= 463; x += 21) bands += `<path d="M${x} 134V236" stroke="${p.coralDark}" stroke-width="6" opacity=".35"/><path d="M${x + 8} 135V235" stroke="#fff5ef" stroke-width="4" opacity=".6"/>`;
    return `<g class="contract-fiber"><rect x="104" y="125" width="401" height="120" rx="57" fill="${p.coralLight}" stroke="${p.coralDark}" stroke-width="3"/><rect x="133" y="133" width="344" height="104" rx="26" fill="${p.coral}" opacity=".45"/>${bands}<path d="M131 165H477M126 186H482M131 207H477" stroke="${p.coralDark}" opacity=".25" stroke-width="2"/>${nucleus(152, 143, 16, 8)}${nucleus(255, 231, 16, 8)}${nucleus(365, 140, 16, 8)}${nucleus(452, 227, 16, 8)}</g>
      ${labels ? label('Long muscle fiber', 300, 78, 'M300 87V120', 'middle') + label('Stripes', 139, 304, 'M165 285L196 241') + label('Nuclei near the edge', 382, 304, 'M408 285L448 237', 'middle') : ''}`;
  }
  function skin(labels) {
    const tiles = [
      {d:'M92 128L143 89 215 99 233 153 193 195 120 190Z',x:165,y:146},
      {d:'M215 99L284 76 337 114 332 178 278 206 233 153Z',x:280,y:140},
      {d:'M337 114L404 91 458 119 459 184 391 204 332 178Z',x:396,y:149},
      {d:'M458 119L513 144 526 204 486 244 459 184Z',x:488,y:184},
      {d:'M120 190L193 195 228 249 192 290 126 278 87 235Z',x:162,y:239},
      {d:'M193 195L233 153 278 206 287 270 228 249Z',x:244,y:214},
      {d:'M278 206L332 178 391 204 397 265 342 294 287 270Z',x:339,y:239},
      {d:'M391 204L459 184 486 244 453 286 397 265Z',x:438,y:240}
    ];
    return `<g class="skin-layer">${tiles.map((t,i)=>`<path d="${t.d}" fill="${i % 3 === 0 ? p.coralLight : i % 3 === 1 ? '#f9d4d8' : '#f2ddeb'}" stroke="${p.coralDark}" stroke-width="3.5" stroke-linejoin="round"/>${nucleus(t.x,t.y,18,14)}`).join('')}</g>
      ${labels ? label('Closely packed cells', 114, 50, 'M197 59L224 89') + label('Nucleus', 498, 85, 'M495 92L461 112 414 143') + label('Protective layer', 300, 337, 'M300 317L310 289', 'middle') : ''}`;
  }
  function redblood(labels, active) {
    return `<g class="redblood-cell"><ellipse cx="300" cy="180" rx="157" ry="97" fill="${p.coral}" stroke="${p.coralDark}" stroke-width="3.5"/><ellipse cx="300" cy="174" rx="93" ry="49" fill="${p.coralLight}"/><ellipse cx="300" cy="171" rx="70" ry="31" fill="#f8b6a7"/><path d="M190 219C245 259 354 259 410 219" fill="none" stroke="${p.coralDark}" stroke-width="5" opacity=".35" stroke-linecap="round"/></g>
      ${active ? '<g class="oxygen-dots" fill="#4c83e8"><circle class="oxygen-pulse" cx="215" cy="149" r="7"/><circle class="oxygen-pulse signal-delay" cx="363" cy="213" r="7"/><circle class="oxygen-pulse" cx="380" cy="141" r="7"/></g>' : ''}
      ${labels ? label('Flexible disc', 81, 69, 'M156 77L189 111') + label('Thinner center', 449, 81, 'M446 88L380 130 334 157') + label('No nucleus', 108, 305, 'M204 296L254 220') + label('Carries oxygen', 408, 305, 'M436 287L414 244') : ''}`;
  }
  function plantCell(type, labels, active) {
    const leaf = type === 'leaf';
    return `<rect x="125" y="70" width="350" height="230" rx="37" fill="${p.lime}" stroke="${p.limeDark}" stroke-width="4"/><rect x="135" y="80" width="330" height="210" rx="29" fill="${p.limeLight}" stroke="${p.limeDark}" stroke-width="1.5"/>
      ${leaf ? `<rect x="191" y="115" width="225" height="140" rx="34" fill="#d8ebf0" stroke="#9dbfc9" stroke-width="2"/>${nucleus(165,190,22,28)}${[[166,110,0],[228,99,0],[301,99,0],[379,99,0],[438,133,70],[438,210,80],[412,273,0],[333,273,0],[253,273,0],[172,265,10]].map(a=>chloroplast(...a)).join('')}` : `${nucleus(299,182,47,43)}<g fill="#d8ebf0" stroke="#9dbfc9" stroke-width="1.5"><ellipse cx="184" cy="128" rx="26" ry="18"/><ellipse cx="408" cy="223" rx="29" ry="22"/><ellipse cx="198" cy="245" rx="23" ry="17"/></g>${mitochondrion(390,125,15)}${mitochondrion(247,268,0)}`}
      ${active && leaf ? '<g class="light-rays" stroke="#ddad48" stroke-width="4" stroke-linecap="round"><path class="oxygen-pulse" d="M264 32L272 55M295 27V52M326 32L318 55"/></g><g fill="#4c83e8"><circle class="photosynth-particle" cx="439" cy="186" r="5"/><circle class="photosynth-particle signal-delay" cx="439" cy="186" r="5"/></g>' : ''}
      ${labels ? (leaf ? label('Cell wall',54,45,'M116 50L142 73')+label('Chloroplast',451,45,'M464 51L442 118')+label('Large vacuole',297,339,'M297 317V261','middle')+label('Nucleus',52,230,'M114 225L145 205') : label('Cell wall',54,45,'M116 50L142 73')+label('Nucleus · DNA',300,339,'M300 317V229','middle')+label('Small vacuoles',456,339,'M460 317L418 248','middle')) : ''}`;
  }
  function root(labels, active) {
    return `<path d="M92 105Q92 83 116 83H255Q278 83 278 106V154C357 148 409 114 495 112Q518 111 519 125T495 139C413 140 359 190 278 196V270Q278 293 255 293H116Q92 293 92 270Z" fill="${p.lime}" stroke="${p.limeDark}" stroke-width="4"/>
      <path d="M101 108Q101 92 119 92H252Q269 92 269 109V164C356 158 408 122 496 121Q509 120 510 125T495 130C410 132 357 184 269 186V267Q269 284 252 284H119Q101 284 101 267Z" fill="${p.limeLight}" stroke="${p.limeDark}" stroke-width="1.3"/>
      <path d="M115 129Q115 114 134 114H225Q243 114 243 133V157C300 169 330 158 353 151C332 177 289 185 243 191V252Q243 268 226 268H134Q115 268 115 250Z" fill="#d8ebf0" stroke="#9dbfc9" stroke-width="1.6"/>
      ${nucleus(250,234,16,24)}${mitochondrion(146,102,0)}${mitochondrion(255,116,70)}
      ${active ? '<g fill="#4c83e8"><circle class="root-water" cx="480" cy="125" r="5"/><circle class="root-water signal-delay" cx="480" cy="125" r="5"/></g>' : ''}
      ${labels ? label('Root hair',394,62,'M436 71L454 109')+label('Cell wall',40,47,'M105 54L113 80')+label('Large vacuole',135,337,'M182 315V272','middle')+label('Nucleus',320,278,'M315 265L270 239') : ''}`;
  }
  const titles = { stem: 'Unspecialized animal stem cell', neuron: 'Nerve cell with dendrites and a long axon', muscle: 'Skeletal muscle fiber with stripes and multiple peripheral nuclei', skin: 'Closely packed living epithelial cells in skin tissue', redblood: 'Mature human red blood cell, a biconcave disc with no nucleus', leaf: 'Leaf mesophyll cell with chloroplasts and a large central vacuole', root: 'Root hair cell with a long extension and no chloroplasts', plantstem: 'Unspecialized plant meristem cell with a cell wall and small vacuoles' };
  window.CellArt = function (type, options = {}) {
    const key = Object.hasOwn(titles, type) ? type : 'stem';
    const labels = !!options.labels;
    const active = !!options.active;
    const content = key === 'neuron' ? neuron(labels,active) : key === 'muscle' ? muscle(labels) : key === 'skin' ? skin(labels) : key === 'redblood' ? redblood(labels,active) : key === 'root' ? root(labels,active) : key === 'leaf' || key === 'plantstem' ? plantCell(key,labels,active) : animalStem(labels);
    return `<svg xmlns="http://www.w3.org/2000/svg" class="cell-art cell-art-${key}${active ? ' is-active' : ''}" viewBox="0 0 600 370" role="img" aria-label="${titles[key]}" style="display:block;width:100%;height:auto;overflow:visible"><title>${titles[key]}</title><style>
      .cell-art .cell-label text{font:500 14px system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.ink}}
      .cell-art.is-active .stem-body{animation:cellcraft-breathe 3s ease-in-out infinite;transform-origin:300px 185px}
      .cell-art.is-active .contract-fiber{animation:cellcraft-contract 2.1s ease-in-out infinite;transform-origin:300px 185px}
      .cell-art.is-active .flow-dot{animation:cellcraft-signal 2s linear infinite}
      .cell-art.is-active .signal-delay{animation-delay:-1s}
      .cell-art.is-active .oxygen-pulse{animation:cellcraft-oxygen 2.4s ease-in-out infinite}
      .cell-art.is-active .root-water{animation:cellcraft-water 2.6s linear infinite}
      .cell-art.is-active .photosynth-particle{animation:cellcraft-photo 2.4s linear infinite}
      @keyframes cellcraft-breathe{50%{transform:scale(1.025)}}
      @keyframes cellcraft-contract{50%{transform:scale(.84,1.1)}}
      @keyframes cellcraft-signal{0%{transform:translateX(0);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateX(208px);opacity:0}}
      @keyframes cellcraft-oxygen{0%,100%{opacity:.3}50%{opacity:1}}
      @keyframes cellcraft-water{0%{transform:translate(0,0);opacity:0}10%{opacity:1}70%{opacity:1}100%{transform:translate(-155px,39px);opacity:0}}
      @keyframes cellcraft-photo{0%{transform:translateX(0);opacity:0}15%{opacity:1}100%{transform:translateX(64px);opacity:0}}
      @media(prefers-reduced-motion:reduce){.cell-art *{animation:none!important}}
    </style>${content}</svg>`;
  };
})();
