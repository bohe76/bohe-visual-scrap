const items = {
  1: { title: '벽걸이 소변기 3대 · 칸막이', copy: '서측 벽 배치. 칸막이 표기 450 × 1,250 mm, 소변기 간격 표기 0.95 m.' },
  2: { title: '화강석 두겁돌', copy: '서측 소변기 구간 길이 2,900 mm, 두께 20 mm 표기.' },
  3: { title: '일반 대변기 부스 3칸', copy: '동측 벽. 칸당 폭 약 1.0 m × 깊이 약 1.4 m 표기.' },
  4: { title: '세면대 2 · 방습거울', copy: '남측 벽 서쪽. 거울 표기 1,800 × 1,000 mm.' },
  5: { title: 'PS · 배관 샤프트', copy: '남서쪽. 약 1.3 × 1.9 m 표기; 높이는 미표기.' },
  6: { title: '청소 공간 수채기', copy: '신설 표기. 세부 위치와 규격은 개념 배치로 표시.' },
  7: { title: '남측 출입구 · 재료분리대', copy: '출입구 폭 0.9 m, 재료분리대 두께 30 mm 표기.' },
  8: { title: '포세린 타일 구역', copy: '600 × 600 mm 타일 규격 표기. 모형은 타일 패턴을 시각화.' },
  9: { title: '북측 창 (CAW)', copy: '인조대리석 창대석 표기. 창의 크기·개폐 방식은 미표기.' },
  10: { title: '바닥 배수구 · F.D.', copy: 'Ø75 mm 표기. 정확한 위치가 확인되지 않아 3D 바닥에는 배치하지 않음.', unplaced: true },
  11: { title: '남측 로비 · 복도', copy: '출입구 바깥의 맥락을 보여 주는 무치수 개념 표현.' }
};

const stage = document.querySelector('#stage');
const statusNode = document.querySelector('#render-status');
const detailNumber = document.querySelector('#detail-number');
const detailTitle = document.querySelector('#detail-title');
const detailCopy = document.querySelector('#detail-copy');
const canvas = document.querySelector('#model-canvas');
const selectedButtons = [...document.querySelectorAll('.legend-item')];
const routeButtons = [...document.querySelectorAll('[data-route-toggle]')];
let activeItem = null;
let sceneApi = null;

function updateDetail(id) {
  const item = items[id];
  if (!item) return;
  activeItem = String(id);
  detailNumber.textContent = String(id).padStart(2, '0');
  detailTitle.textContent = item.title;
  detailCopy.textContent = item.copy;
  selectedButtons.forEach((button) => {
    const selected = button.dataset.item === String(id);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('#fallback-diagram [data-item]').forEach((element) => {
    element.classList.toggle('is-selected', element.dataset.item === String(id));
  });
  sceneApi?.select(String(id));
}

selectedButtons.forEach((button) => button.addEventListener('click', () => updateDetail(button.dataset.item)));
document.querySelector('#fallback-diagram').addEventListener('click', (event) => {
  const target = event.target.closest('[data-item]');
  if (target && items[target.dataset.item]) updateDetail(target.dataset.item);
});

routeButtons.forEach((button) => button.addEventListener('click', () => {
  const routeId = button.dataset.routeToggle;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(enabled));
  document.querySelectorAll(`#fallback-diagram [data-route="${routeId}"]`).forEach((route) => route.classList.toggle('is-hidden', !enabled));
  sceneApi?.setRoute(routeId, enabled);
}));

document.querySelector('#view-iso').addEventListener('click', () => sceneApi?.setView('iso'));
document.querySelector('#view-top').addEventListener('click', () => sceneApi?.setView('top'));
document.querySelector('#view-reset').addEventListener('click', () => sceneApi?.reset());
document.querySelector('#zoom-in').addEventListener('click', () => sceneApi?.zoom(1.16));
document.querySelector('#zoom-out').addEventListener('click', () => sceneApi?.zoom(1 / 1.16));

function setStatus(message, mode) {
  statusNode.textContent = message;
  statusNode.classList.toggle('is-live', mode === 'live');
  statusNode.classList.toggle('is-fallback', mode === 'fallback');
  stage.dataset.renderer = mode === 'live' ? 'webgl' : 'fallback';
}

function makeModel(THREE, OrbitControls) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f8f8f7');
  const target = new THREE.Vector3(0, 0.72, 2.65);
  const camera = new THREE.OrthographicCamera(-5, 5, 4, -4, 0.1, 100);
  // South-facing default gives a clear line of sight to both urinals and WC cubicles.
  const defaultPosition = new THREE.Vector3(-5.8, 8.4, -8.2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setClearColor('#f8f8f7', 1);

  scene.add(new THREE.HemisphereLight('#ffffff', '#aaa49a', 2.15));
  const ambient = new THREE.AmbientLight('#ffffff', 0.55);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight('#fff8ed', 2.8);
  keyLight.position.set(-4.5, 10, -3.5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight('#dfe7ef', 1.0);
  fillLight.position.set(5, 7, 5);
  scene.add(fillLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.minDistance = 7;
  controls.maxDistance = 17;
  controls.minPolarAngle = 0.025;
  controls.maxPolarAngle = Math.PI / 2 - 0.075;
  controls.minZoom = 0.76;
  controls.maxZoom = 1.75;
  camera.position.copy(defaultPosition);
  camera.lookAt(target);
  controls.update();

  const modelGroups = new Map();
  const routeGroups = new Map();
  const selectableObjects = [];
  const highlightRestore = [];
  const palette = {
    concrete: '#d6d5d0', slate: '#5c6971', slateLight: '#74818a', grout: '#c5c1b7',
    ceramic: '#f8f8f5', ceramicShade: '#dfe4e2', walnut: '#806a54', navy: '#293849',
    olive: '#79866b', terracotta: '#ad6348', brass: '#b08c55', steel: '#8c999d',
    tileA: '#dedbd1', tileB: '#e8e5dc', tileC: '#d7d4ca', tileD: '#e5d9d2'
  };
  const mats = {};
  Object.entries(palette).forEach(([name, color]) => {
    mats[name] = new THREE.MeshStandardMaterial({ color, roughness: name === 'ceramic' ? 0.27 : 0.83, metalness: name === 'brass' ? 0.66 : 0.03 });
  });
  mats.glass = new THREE.MeshPhysicalMaterial({ color: '#dbe7e8', roughness: 0.19, metalness: 0.1, transparent: true, opacity: 0.67, transmission: 0.06, side: THREE.DoubleSide });
  mats.mirror = new THREE.MeshPhysicalMaterial({ color: '#dce7e8', roughness: 0.22, metalness: 0.36, emissive: '#849699', emissiveIntensity: 0.12, side: THREE.DoubleSide });
  mats.darkBowl = new THREE.MeshStandardMaterial({ color: '#c5d0d1', roughness: 0.36, side: THREE.DoubleSide });
  mats.routeOrange = new THREE.MeshStandardMaterial({ color: '#c76d3c', roughness: 0.8 });
  mats.routeGreen = new THREE.MeshStandardMaterial({ color: '#65846b', roughness: 0.8 });
  mats.routeBlue = new THREE.MeshStandardMaterial({ color: '#5086c2', roughness: 0.78 });

  function getGroup(id) {
    if (!modelGroups.has(String(id))) {
      const group = new THREE.Group();
      group.userData.itemId = String(id);
      modelGroups.set(String(id), group);
      scene.add(group);
    }
    return modelGroups.get(String(id));
  }
  function box(group, position, size, material, options = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;
    if (options.name) mesh.name = options.name;
    group.add(mesh);
    return mesh;
  }
  function cylinder(group, position, radiusTop, radiusBottom, height, material, segments = 24, rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }
  function sphere(group, position, scale, material, segments = 24) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments >> 1)), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }
  function line(group, points, material, radius = 0.012) {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(32, points.length * 10), radius, 8, false), material);
    group.add(mesh);
    return { curve, mesh };
  }
  function addTag(id, position, size = 0.32) {
    const canvasLabel = document.createElement('canvas');
    canvasLabel.width = 128;
    canvasLabel.height = 128;
    const ctx = canvasLabel.getContext('2d');
    ctx.beginPath();
    ctx.arc(64, 64, 54, 0, Math.PI * 2);
    ctx.fillStyle = '#29324c';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 58px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(id), 64, 67);
    const texture = new THREE.CanvasTexture(canvasLabel);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, sizeAttenuation: true }));
    sprite.position.set(...position);
    sprite.scale.set(size, size, 1);
    sprite.userData.itemId = String(id);
    sprite.renderOrder = 5;
    getGroup(id).add(sprite);
    selectableObjects.push(sprite);
  }

  // Main floor and its 600 mm modular grid; the last tile is clipped at the outer edge.
  const floorGroup = getGroup(8);
  box(floorGroup, [0, -0.027, 2.8], [4.08, 0.04, 5.68], mats.slate, { castShadow: false });
  const tileColors = [mats.tileA, mats.tileB, mats.tileC, mats.tileD, mats.tileB, mats.tileA];
  for (let row = 0, z = 0; z < 5.6 - 1e-6; row++, z += 0.6) {
    const depth = Math.min(0.6, 5.6 - z);
    for (let col = 0, x = -2; x < 2 - 1e-6; col++, x += 0.6) {
      const width = Math.min(0.6, 2 - x);
      const tile = box(floorGroup, [x + width / 2, 0.003, z + depth / 2], [width - 0.012, 0.018, depth - 0.012], tileColors[(row * 5 + col) % tileColors.length], { castShadow: false });
      tile.receiveShadow = true;
    }
  }
  // The adjoining lobby is contextual only; its extent is deliberately not dimensioned.
  const lobbyGroup = getGroup(11);
  box(lobbyGroup, [0, -0.032, -0.86], [4.08, 0.035, 1.72], mats.tileA, { castShadow: false });
  for (let x = -1.8; x < 2; x += 0.6) box(lobbyGroup, [x, -0.011, -0.86], [0.012, 0.006, 1.72], mats.grout, { castShadow: false });
  for (let z = -1.6; z < 0; z += 0.6) box(lobbyGroup, [0, -0.011, z], [4.08, 0.006, 0.012], mats.grout, { castShadow: false });

  // Roofless enclosure. Wall heights are illustrative rather than measured.
  const wallHeight = 2.6;
  const wallBand = 0.76;
  const wallMaterial = mats.concrete;
  const westX = 2.0;
  // West wall, including the long urinal run.
  box(scene, [westX, wallBand / 2, 2.8], [0.12, wallBand, 5.6], mats.slate, { name: 'west slate dado' });
  box(scene, [westX, wallBand + (wallHeight - wallBand) / 2, 2.8], [0.12, wallHeight - wallBand, 5.6], wallMaterial, { name: 'west concrete wall' });
  // North/back wall.
  box(scene, [0, wallBand / 2, 5.6], [4, wallBand, 0.12], mats.slate, { name: 'north slate dado' });
  box(scene, [0, wallBand + (wallHeight - wallBand) / 2, 5.6], [4, wallHeight - wallBand, 0.12], wallMaterial, { name: 'north concrete wall' });
  // East/south is a deliberately low cutaway so WC bowls remain visible from the default view.
  box(scene, [-2, 0.14, 2.8], [0.12, 0.28, 5.6], mats.slateLight, { name: 'east cutaway wall' });
  box(scene, [-2, 0.295, 2.8], [0.19, 0.03, 5.6], mats.concrete, { name: 'east cutaway cap' });
  // A short return at the south-east edge implies the cutaway without closing the entrance.
  box(scene, [-1.95, 0.58, 0.08], [0.1, 1.16, 0.16], mats.concrete, { name: 'south-east wall return' });

  // North window: its dimensions are intentionally not stated or marked.
  const windowGroup = getGroup(9);
  box(windowGroup, [0, 1.91, 5.505], [1.56, 0.78, 0.035], mats.navy);
  box(windowGroup, [0, 1.91, 5.477], [1.44, 0.66, 0.018], mats.glass, { castShadow: false });
  box(windowGroup, [0, 1.91, 5.46], [0.026, 0.66, 0.018], mats.steel, { castShadow: false });
  box(windowGroup, [0, 1.91, 5.46], [1.44, 0.026, 0.018], mats.steel, { castShadow: false });
  box(windowGroup, [0, 1.495, 5.38], [1.72, 0.055, 0.28], mats.concrete);
  box(windowGroup, [0, 1.46, 5.25], [1.72, 0.025, 0.36], mats.concrete);

  // 1. Three wall-hung urinals with measured spacing and side panels.
  const urinalGroup = getGroup(1);
  const urinalZ = [2.35, 3.30, 4.25];
  urinalZ.forEach((z) => {
    box(urinalGroup, [1.94, 1.02, z], [0.065, 0.62, 0.43], mats.ceramic, { name: 'urinal mounting plate' });
    const profile = [
      new THREE.Vector2(0.025, -0.145), new THREE.Vector2(0.115, -0.135), new THREE.Vector2(0.175, -0.082),
      new THREE.Vector2(0.22, 0.005), new THREE.Vector2(0.235, 0.105), new THREE.Vector2(0.218, 0.16),
      new THREE.Vector2(0.188, 0.135), new THREE.Vector2(0.15, 0.075), new THREE.Vector2(0.09, 0.01), new THREE.Vector2(0.035, -0.035)
    ];
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), mats.ceramic);
    bowl.rotation.z = Math.PI / 2;
    bowl.position.set(1.91, 0.96, z);
    bowl.castShadow = true;
    urinalGroup.add(bowl);
    const inner = sphere(urinalGroup, [1.72, 0.94, z], [0.025, 0.135, 0.115], mats.darkBowl, 24);
    inner.name = 'urinal bowl interior';
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 12, 32), mats.ceramic);
    lip.rotation.y = -Math.PI / 2;
    lip.scale.set(0.82, 1.0, 1);
    lip.position.set(1.72, 0.99, z);
    urinalGroup.add(lip);
    cylinder(urinalGroup, [1.84, 1.34, z], 0.018, 0.018, 0.16, mats.brass, 12);
  });
  [2.825, 3.775].forEach((z) => {
    box(urinalGroup, [1.72, 0.625, z], [0.45, 1.25, 0.03], mats.concrete, { name: 'urinal divider 450 x 1250' });
    box(urinalGroup, [1.72, 1.258, z], [0.45, 0.016, 0.035], mats.slateLight, { castShadow: false });
  });
  addTag(1, [1.28, 1.52, 3.3], 0.34);

  // 2. 20 mm granite cap, exactly 2.9 m along the indicated west-side run.
  const capGroup = getGroup(2);
  box(capGroup, [1.91, 0.79, 3.45], [0.14, 0.02, 2.9], mats.slateLight, { name: 'granite coping 20 mm x 2.9 m' });
  box(capGroup, [1.91, 0.802, 3.45], [0.14, 0.004, 2.9], mats.grout, { castShadow: false });
  addTag(2, [1.66, 1.12, 4.9], 0.30);

  // 3. Three cubicles along the east; unmarked panel/door heights remain illustrative.
  const stallGroup = getGroup(3);
  const stallBounds = [0.9, 1.9, 2.9, 3.9];
  stallBounds.forEach((z) => {
    // Partial-height cutaway keeps the WC pans readable; this is not a real partition-height claim.
    box(stallGroup, [-1.30, 0.36, z], [1.4, 0.72, 0.06], mats.concrete, { name: 'cubicle partition cutaway' });
    box(stallGroup, [-1.30, 0.735, z], [1.4, 0.025, 0.08], mats.navy, { castShadow: false });
  });
  const stallCenters = [1.4, 2.4, 3.4];
  stallCenters.forEach((z, index) => {
    box(stallGroup, [-1.96, 0.36, z], [0.055, 0.72, 0.98], mats.concrete, { name: 'east stall side cutaway' });
    // Source palette accents; exact finish assignment remains conceptual.
    box(stallGroup, [-1.92, 1.18, z], [0.025, 0.62, 0.78], [mats.navy, mats.olive, mats.terracotta][index], { name: 'concept accent panel' });
    // Doors are shown swung open only to reveal the fixtures; no swing direction is asserted.
    const door = new THREE.Group();
    door.position.set(-0.61, 0, z - 0.40);
    door.rotation.y = 0.88;
    box(door, [0, 0.35, 0.40], [0.055, 0.70, 0.80], mats.navy, { name: 'stall door cutaway, shown open' });
    box(door, [0.034, 0.35, 0.40], [0.014, 0.62, 0.72], mats.concrete, { castShadow: false });
    box(door, [0.048, 0.40, 0.16], [0.018, 0.08, 0.025], mats.brass, { castShadow: false });
    stallGroup.add(door);
    // Bowl, open seat and back cistern; all fixture heights are schematic.
    cylinder(stallGroup, [-1.50, 0.38, z], 0.12, 0.15, 0.38, mats.ceramic, 28);
    sphere(stallGroup, [-1.50, 0.49, z], [0.27, 0.20, 0.19], mats.ceramic, 28);
    const seat = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.027, 12, 36), mats.navy);
    seat.rotation.x = Math.PI / 2;
    seat.scale.set(1.12, 0.78, 1);
    seat.position.set(-1.48, 0.63, z);
    stallGroup.add(seat);
    box(stallGroup, [-1.88, 0.80, z], [0.22, 0.46, 0.48], mats.ceramic, { name: 'toilet cistern' });
    box(stallGroup, [-1.755, 0.94, z], [0.025, 0.045, 0.06], mats.brass, { castShadow: false });
  });
  addTag(3, [-0.45, 2.16, 3.95], 0.34);

  // 4. South wash counter and framed mirror, dimensions shown only where called out.
  const washGroup = getGroup(4);
  box(washGroup, [-0.34, 0.79, 0.52], [1.5, 0.12, 0.48], mats.walnut, { name: 'wash counter' });
  [-0.75, 0.05].forEach((x) => {
    sphere(washGroup, [x, 0.85, 0.49], [0.28, 0.075, 0.18], mats.ceramic, 28);
    sphere(washGroup, [x, 0.895, 0.49], [0.205, 0.018, 0.12], mats.darkBowl, 24);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.015, 10, 32), mats.ceramic);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1.35, 0.9, 1);
    rim.position.set(x, 0.91, 0.49);
    washGroup.add(rim);
    cylinder(washGroup, [x + 0.13, 0.99, 0.61], 0.016, 0.016, 0.15, mats.brass, 12);
    cylinder(washGroup, [x + 0.20, 1.055, 0.56], 0.016, 0.016, 0.14, mats.brass, 12, [0, 0, Math.PI / 2]);
  });
  // Mirror is 1.8 x 1.0 m as stated; its mounting is a readable cutaway panel.
  box(washGroup, [-0.32, 1.73, 0.12], [1.8, 1.0, 0.06], mats.navy, { name: 'waterproof mirror frame' });
  box(washGroup, [-0.32, 1.73, 0.082], [1.68, 0.88, 0.018], mats.mirror, { castShadow: false, name: 'mirror glass' });
  box(washGroup, [-0.32, 2.05, 0.069], [1.52, 0.025, 0.006], new THREE.MeshBasicMaterial({ color: '#f1f6f6', transparent: true, opacity: 0.72 }), { castShadow: false, receiveShadow: false });
  box(washGroup, [-0.32, 1.205, 0.11], [1.88, 0.025, 0.08], mats.concrete, { castShadow: false });
  addTag(4, [0.80, 2.30, 0.26], 0.34);

  // 5. Southwest PS/service shaft: 1.3 x 1.9 m footprint; no height claim.
  const shaftGroup = getGroup(5);
  box(shaftGroup, [1.35, 0.72, 1.05], [1.3, 1.44, 1.9], mats.concrete, { name: 'PS concept mass' });
  box(shaftGroup, [1.35, 1.45, 1.05], [1.36, 0.035, 1.96], mats.slateLight, { name: 'PS cap, schematic' });
  box(shaftGroup, [1.35, 0.40, 0.08], [0.9, 0.58, 0.035], mats.navy, { castShadow: false });
  const psCanvas = document.createElement('canvas');
  psCanvas.width = 192;
  psCanvas.height = 96;
  const psContext = psCanvas.getContext('2d');
  psContext.fillStyle = '#f7f7f4';
  psContext.fillRect(0, 0, psCanvas.width, psCanvas.height);
  psContext.fillStyle = '#293849';
  psContext.font = '600 54px sans-serif';
  psContext.textAlign = 'center';
  psContext.textBaseline = 'middle';
  psContext.fillText('PS', psCanvas.width / 2, psCanvas.height / 2);
  const psTexture = new THREE.CanvasTexture(psCanvas);
  psTexture.colorSpace = THREE.SRGBColorSpace;
  const psLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: psTexture, transparent: true, depthTest: false }));
  psLabel.position.set(1.35, 1.49, 1.05);
  psLabel.scale.set(0.48, 0.24, 1);
  psLabel.renderOrder = 4;
  shaftGroup.add(psLabel);
  addTag(5, [0.78, 1.76, 1.76], 0.34);

  // 6. New utility sink near the cleaning/service zone.
  const utilityGroup = getGroup(6);
  box(utilityGroup, [0.42, 0.68, 1.64], [0.54, 0.12, 0.44], mats.concrete);
  sphere(utilityGroup, [0.42, 0.75, 1.62], [0.23, 0.08, 0.17], mats.ceramic, 24);
  sphere(utilityGroup, [0.42, 0.795, 1.62], [0.16, 0.018, 0.11], mats.darkBowl, 20);
  cylinder(utilityGroup, [0.59, 0.91, 1.73], 0.018, 0.018, 0.17, mats.brass, 12);
  cylinder(utilityGroup, [0.66, 0.99, 1.66], 0.018, 0.018, 0.14, mats.brass, 12, [0, 0, Math.PI / 2]);
  addTag(6, [0.20, 1.26, 1.82], 0.31);

  // 7. South entry and 30 mm transition strip.
  const entryGroup = getGroup(7);
  const doorCenter = -1.43;
  box(entryGroup, [doorCenter, 0.015, 0.035], [0.9, 0.03, 0.055], mats.brass, { name: '30 mm material transition strip' });
  box(entryGroup, [doorCenter - 0.45, 0.98, 0.04], [0.06, 1.96, 0.10], mats.concrete);
  box(entryGroup, [doorCenter + 0.45, 0.98, 0.04], [0.06, 1.96, 0.10], mats.concrete);
  box(entryGroup, [doorCenter, 1.98, 0.04], [0.96, 0.06, 0.10], mats.concrete);
  // A walnut leaf is shown open to echo the source illustration; its swing is illustrative.
  const entryLeaf = new THREE.Group();
  entryLeaf.position.set(doorCenter - 0.45, 0, 0.055);
  entryLeaf.rotation.y = -0.92;
  box(entryLeaf, [0.45, 0.97, 0], [0.9, 1.94, 0.055], mats.walnut, { name: 'south entry door leaf, shown open' });
  box(entryLeaf, [0.80, 0.97, -0.038], [0.024, 0.12, 0.018], mats.brass, { castShadow: false, name: 'entry door handle' });
  entryGroup.add(entryLeaf);
  addTag(7, [-1.72, 2.10, 0.32], 0.31);

  // 8. Tile selection tag, #9 tag on window, #11 tag outside; no physical #10 marker.
  addTag(8, [-0.65, 0.13, 3.32], 0.31);
  addTag(9, [0.98, 2.37, 5.30], 0.31);
  addTag(11, [-1.92, 0.28, -1.12], 0.32);

  // Diagrammatic paths float slightly over the floor, never painted into it.
  const orangeGroup = new THREE.Group();
  const orangeLine = line(orangeGroup, [[-1.43, 0.105, -0.12], [-1.05, 0.105, 0.72], [-0.25, 0.105, 1.48], [0.75, 0.105, 2.05], [1.22, 0.105, 2.55], [1.2, 0.105, 3.3]], mats.routeOrange, 0.04);
  const orangeTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 12), mats.routeOrange);
  orangeTip.position.set(1.2, 0.12, 3.1);
  orangeTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), orangeLine.curve.getTangent(0.88).normalize());
  orangeGroup.add(orangeTip);
  scene.add(orangeGroup);
  routeGroups.set('urinal', orangeGroup);

  const greenGroup = new THREE.Group();
  const greenLine = line(greenGroup, [[-1.43, 0.11, -0.13], [-1.15, 0.11, 0.58], [-0.72, 0.11, 1.10], [-0.47, 0.11, 2.3], [-0.42, 0.11, 3.35]], mats.routeGreen, 0.04);
  const greenTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 12), mats.routeGreen);
  greenTip.position.set(-0.42, 0.12, 3.12);
  greenTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), greenLine.curve.getTangent(0.9).normalize());
  greenGroup.add(greenTip);
  scene.add(greenGroup);
  routeGroups.set('stall', greenGroup);

  const blueGroup = new THREE.Group();
  const bluePoints = [[-0.24, 0.115, 0.52], [-0.65, 0.115, 0.48], [-1.05, 0.115, 0.16], [-1.43, 0.115, -0.13], [-1.43, 0.115, -1.1]];
  const blueCurve = new THREE.CatmullRomCurve3(bluePoints.map((point) => new THREE.Vector3(...point)));
  const blueSamples = blueCurve.getPoints(48);
  for (let i = 0; i < blueSamples.length - 1; i += 4) {
    const start = blueSamples[i];
    const end = blueSamples[Math.min(i + 2, blueSamples.length - 1)];
    const direction = new THREE.Vector3().subVectors(end, start);
    const dash = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, direction.length(), 8), mats.routeBlue);
    dash.position.copy(start).add(end).multiplyScalar(0.5);
    dash.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    blueGroup.add(dash);
  }
  const blueTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 12), mats.routeBlue);
  blueTip.position.copy(blueCurve.getPoint(0.97));
  blueTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), blueCurve.getTangent(0.97).normalize());
  blueGroup.add(blueTip);
  scene.add(blueGroup);
  routeGroups.set('wash', blueGroup);

  // Number sprites and model surfaces participate in raycasting; the unknown drain does not.
  scene.traverse((object) => {
    if (object.isMesh || object.isSprite) {
      let parent = object;
      while (parent && !parent.userData.itemId) parent = parent.parent;
      if (parent?.userData.itemId) {
        object.userData.itemId = parent.userData.itemId;
        selectableObjects.push(object);
      }
    }
  });
  // Remove accidental duplicates from explicitly registered sprites.
  const uniqueSelectable = [...new Set(selectableObjects)];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let down = null;

  function clearHighlight() {
    highlightRestore.forEach(({ object, material }) => {
      (Array.isArray(object.material) ? object.material : [object.material]).forEach((clone) => clone.dispose());
      object.material = material;
    });
    highlightRestore.length = 0;
  }
  function select(id) {
    clearHighlight();
    const group = modelGroups.get(String(id));
    if (!group) return;
    group.traverse((object) => {
      if (!object.isMesh) return;
      const original = object.material;
      const cloned = Array.isArray(original) ? original.map((material) => material.clone()) : original.clone();
      highlightRestore.push({ object, material: original });
      object.material = cloned;
      (Array.isArray(cloned) ? cloned : [cloned]).forEach((material) => {
        if (material.emissive) {
          material.emissive.set('#3d84b4');
          material.emissiveIntensity = 0.38;
        } else if (material.color) {
          material.color.lerp(new THREE.Color('#75a8d4'), 0.22);
        }
      });
    });
  }
  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    down = { x: event.clientX, y: event.clientY };
  }
  function onPointerUp(event) {
    if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) { down = null; return; }
    down = null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(uniqueSelectable, false).find((entry) => entry.object.userData.itemId);
    if (hit) updateDetail(hit.object.userData.itemId);
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', () => { down = null; });

  function updateViewButtons(view) {
    const iso = view === 'iso';
    document.querySelector('#view-iso').classList.toggle('is-active', iso);
    document.querySelector('#view-iso').setAttribute('aria-pressed', String(iso));
    document.querySelector('#view-top').classList.toggle('is-active', !iso);
    document.querySelector('#view-top').setAttribute('aria-pressed', String(!iso));
  }
  function resize() {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const frustumHeight = 7.7;
    const aspect = rect.width / rect.height;
    camera.left = (-frustumHeight * aspect) / 2;
    camera.right = (frustumHeight * aspect) / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  // Camera-facing upper exterior walls are removed like an architectural cutaway.
  const westUpper = scene.getObjectByName('west concrete wall');
  const northUpper = scene.getObjectByName('north concrete wall');
  renderer.setAnimationLoop(() => {
    controls.update();
    westUpper.visible = camera.position.x < 2.1;
    northUpper.visible = camera.position.z < 5.7;
    renderer.render(scene, camera);
  });

  function clearOrbitMomentum() {
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = true;
  }
  function setView(view) {
    clearOrbitMomentum();
    if (view === 'top') {
      camera.up.set(0, 1, 0);
      camera.position.set(target.x, target.y + 12, target.z - 0.01);
      camera.zoom = 1.0;
      camera.lookAt(target);
      controls.minPolarAngle = 0.025;
    } else {
      camera.up.set(0, 1, 0);
      camera.position.copy(defaultPosition);
      camera.zoom = 1.0;
      camera.lookAt(target);
      controls.minPolarAngle = 0.16;
    }
    controls.target.copy(target);
    camera.updateProjectionMatrix();
    controls.update();
    updateViewButtons(view);
  }
  function reset() {
    clearOrbitMomentum();
    camera.up.set(0, 1, 0);
    camera.position.copy(defaultPosition);
    camera.zoom = 1;
    controls.minPolarAngle = 0.16;
    controls.target.copy(target);
    camera.lookAt(target);
    controls.update();
    camera.updateProjectionMatrix();
    updateViewButtons('iso');
  }
  function zoom(factor) {
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
    camera.updateProjectionMatrix();
  }
  function keyboardRotate(key) {
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const step = 0.11;
    if (key === 'ArrowLeft') spherical.theta -= step;
    if (key === 'ArrowRight') spherical.theta += step;
    if (key === 'ArrowUp') spherical.phi = Math.max(controls.minPolarAngle, spherical.phi - step);
    if (key === 'ArrowDown') spherical.phi = Math.min(controls.maxPolarAngle, spherical.phi + step);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    camera.lookAt(controls.target);
    controls.update();
  }
  canvas.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      keyboardRotate(event.key);
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault(); zoom(1.12);
    } else if (event.key === '-') {
      event.preventDefault(); zoom(1 / 1.12);
    } else if (event.key === 'Home') {
      event.preventDefault(); reset();
    }
  });

  return {
    select,
    setView,
    reset,
    zoom,
    setRoute(id, enabled) { const group = routeGroups.get(id); if (group) group.visible = enabled; }
  };
}

try {
  const [THREE, controlsModule] = await Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]);
  sceneApi = makeModel(THREE, controlsModule.OrbitControls);
  setStatus('3D 모형 표시 중', 'live');
  if (activeItem) sceneApi.select(activeItem);
  routeButtons.forEach((button) => sceneApi.setRoute(button.dataset.routeToggle, button.getAttribute('aria-pressed') === 'true'));
} catch (_error) {
  setStatus('3D 사용 불가 · 2D 대체 도식', 'fallback');
}
