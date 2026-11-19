import { layoutData, uvToWorld } from './layout-data.mjs';

const items = {
  1: { title: '벽면 기구 3개 · 소변기', copy: '평면도에서 읽히는 수량과 치수선 기준의 상대 위치를 반영했습니다.' },
  2: { title: '두겁돌 참고 형상', copy: '새 평면도에서 부위와 위치를 확인하지 못해 모형에는 배치하지 않았습니다.', unplaced: true },
  3: { title: '위생기구 구획 3칸', copy: '우측 벽면의 세 기구와 구획을 반영했습니다. 높이와 문 스윙은 개념 표현입니다.' },
  4: { title: '세면볼 2개', copy: '하단 왼쪽 벽면에 배치했습니다. 거울 형상과 높이는 평면도만으로 확정하지 않았습니다.' },
  5: { title: 'X 표시 구역', copy: '아래쪽 별도 구획의 외곽과 X 표시만 반영했습니다. 용도는 미확정입니다.' },
  6: { title: '하부 사각 기구 · 종류 미확정', copy: '작은 별실 안의 위치만 반영했습니다. 기구 명칭과 세부 치수는 보류했습니다.' },
  7: { title: '우하단 출입구', copy: '개구 위치를 반영했습니다. 두 문짝과 외측 스윙은 평면도 판독에 따른 추정입니다.' },
  8: { title: '바닥 타일 구역', copy: '바닥 패턴은 시각 표현입니다. 치수선 표기는 내측 유효치수나 실측값이 아닙니다.' },
  9: { title: '상부 벽 개구 후보', copy: '위치 후보만 점선으로 표시했습니다. 창인지 다른 개구인지 확정하지 않았습니다.' },
  10: { title: '바닥 배수구 표기', copy: '정확한 위치와 부착면이 확인되지 않아 3D 바닥에 배치하지 않았습니다.', unplaced: true },
  11: { title: '하부 구간과 통로', copy: '1900 표기 구간의 X 구역·작은 실·우측 통로를 분리해 개념 표현했습니다. 바닥 마감과 통로 끝 경계는 미확정입니다.' }
};

const stage = document.querySelector('#stage');
const statusNode = document.querySelector('#render-status');
const detailNumber = document.querySelector('#detail-number');
const detailTitle = document.querySelector('#detail-title');
const detailCopy = document.querySelector('#detail-copy');
const canvas = document.querySelector('#model-canvas');
const fallback = document.querySelector('#fallback-diagram');
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
  fallback.querySelectorAll('[data-item]').forEach((element) => {
    element.classList.toggle('is-selected', element.dataset.item === String(id));
  });
  sceneApi?.select(String(id));
}

selectedButtons.forEach((button) => button.addEventListener('click', () => updateDetail(button.dataset.item)));
fallback.addEventListener('click', (event) => {
  const target = event.target.closest('[data-item]');
  if (target && items[target.dataset.item]) updateDetail(target.dataset.item);
});

routeButtons.forEach((button) => button.addEventListener('click', () => {
  const routeId = button.dataset.routeToggle;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(enabled));
  fallback.querySelectorAll(`[data-route="${routeId}"]`).forEach((route) => route.classList.toggle('is-hidden', !enabled));
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
  stage.setAttribute('aria-busy', 'false');
}

function makeModel(THREE, OrbitControls) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f8f8f7');
  const target = new THREE.Vector3(0, 0.74, 1.86);
  const camera = new THREE.OrthographicCamera(-5, 5, 4, -4, 0.1, 120);
  const defaultPosition = new THREE.Vector3(target.x - 5.8, target.y + 7.68, target.z - 10.85);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setClearColor('#f8f8f7', 1);

  scene.add(new THREE.HemisphereLight('#ffffff', '#aaa49a', 2.15));
  scene.add(new THREE.AmbientLight('#ffffff', 0.55));
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
  controls.maxDistance = 24;
  controls.minPolarAngle = 0.025;
  controls.maxPolarAngle = Math.PI / 2 - 0.075;
  controls.minZoom = 0.62;
  controls.maxZoom = 2.0;
  camera.position.copy(defaultPosition);
  camera.lookAt(target);
  controls.update();

  const modelGroups = new Map();
  const routeGroups = new Map();
  const selectableObjects = [];
  const highlightRestore = [];
  const upperWestWalls = [];
  const upperNorthWalls = [];
  const palette = {
    concrete: '#d6d5d0', slate: '#5c6971', slateLight: '#74818a', grout: '#c5c1b7',
    ceramic: '#f8f8f5', ceramicShade: '#dfe4e2', walnut: '#806a54', navy: '#293849',
    olive: '#79866b', terracotta: '#ad6348', brass: '#b08c55', steel: '#8c999d',
    tileA: '#dedbd1', tileB: '#e8e5dc', extension: '#e9e7e1', unknown: '#dadbd6'
  };
  const mats = {};
  Object.entries(palette).forEach(([name, color]) => {
    mats[name] = new THREE.MeshStandardMaterial({ color, roughness: name === 'ceramic' ? 0.27 : 0.83, metalness: name === 'brass' ? 0.66 : 0.03 });
  });
  mats.glass = new THREE.MeshPhysicalMaterial({ color: '#dbe7e8', roughness: 0.19, metalness: 0.1, transparent: true, opacity: 0.42, transmission: 0.02, side: THREE.DoubleSide });
  mats.mirror = new THREE.MeshPhysicalMaterial({ color: '#dce7e8', roughness: 0.22, metalness: 0.36, emissive: '#849699', emissiveIntensity: 0.12, side: THREE.DoubleSide });
  mats.darkBowl = new THREE.MeshStandardMaterial({ color: '#c5d0d1', roughness: 0.36, side: THREE.DoubleSide });
  mats.routeOrange = new THREE.MeshStandardMaterial({ color: '#c76d3c', roughness: 0.8 });
  mats.routeGreen = new THREE.MeshStandardMaterial({ color: '#65846b', roughness: 0.8 });
  mats.routeBlue = new THREE.MeshStandardMaterial({ color: '#5086c2', roughness: 0.78 });
  mats.unknown = new THREE.MeshStandardMaterial({ color: '#dadbd6', roughness: 0.88 });

  function getGroup(id) {
    const key = String(id);
    if (!modelGroups.has(key)) {
      const group = new THREE.Group();
      group.userData.itemId = key;
      modelGroups.set(key, group);
      scene.add(group);
    }
    return modelGroups.get(key);
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
  function sphere(group, position, scale, material, segments = 24) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments >> 1)), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }
  function cylinder(group, position, radiusTop, radiusBottom, height, material, segments = 20, rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }
  function addTag(id, position, size = 0.32, surface = false) {
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 128;
    tagCanvas.height = 128;
    const ctx = tagCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(64, 64, 54, 0, Math.PI * 2);
    ctx.fillStyle = '#29324c';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 50px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(id).padStart(2, '0'), 64, 67);
    const texture = new THREE.CanvasTexture(tagCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const tagObject = surface
      ? new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }))
      : new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, sizeAttenuation: true }));
    if (surface) {
      tagObject.name = 'tile-surface-tag';
      tagObject.rotation.x = -Math.PI / 2;
    }
    tagObject.position.set(...position);
    tagObject.scale.set(size, size, 1);
    tagObject.userData.itemId = String(id);
    tagObject.renderOrder = 5;
    getGroup(id).add(tagObject);
    selectableObjects.push(tagObject);
  }
  function shapeFromUv(uvPoints) {
    const shape = new THREE.Shape();
    uvPoints.forEach((uv, index) => {
      const { x, z } = uvToWorld(uv);
      if (index === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }
  function addFloor(group, uvPoints, material, y, name) {
    const mesh = new THREE.Mesh(shapeFromUv(uvPoints), material);
    mesh.position.y = y;
    mesh.receiveShadow = true;
    if (name) mesh.name = name;
    group.add(mesh);
    return mesh;
  }
  function wallBox(group, fromUv, toUv, height, thickness, material, name) {
    const from = uvToWorld(fromUv), to = uvToWorld(toUv);
    const dx = to.x - from.x, dz = to.z - from.z;
    const length = Math.hypot(dx, dz);
    const mesh = box(group, [(from.x + to.x) / 2, height / 2, (from.z + to.z) / 2], [length, height, thickness], material, { name });
    mesh.rotation.y = Math.atan2(-dz, dx);
    return mesh;
  }
  function floorGrid(group, polygon, y, material, step = 0.6) {
    const vertices = [];
    const pts = polygon.map(uvToWorld);
    const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
    const minZ = Math.min(...pts.map((p) => p.z)), maxZ = Math.max(...pts.map((p) => p.z));
    const crossAtX = (x) => {
      const zs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a.x <= x && b.x > x) || (b.x <= x && a.x > x)) zs.push(a.z + ((x - a.x) / (b.x - a.x)) * (b.z - a.z));
      }
      zs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < zs.length; i += 2) vertices.push(x, y, zs[i], x, y, zs[i + 1]);
    };
    const crossAtZ = (z) => {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a.z <= z && b.z > z) || (b.z <= z && a.z > z)) xs.push(a.x + ((z - a.z) / (b.z - a.z)) * (b.x - a.x));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) vertices.push(xs[i], y, z, xs[i + 1], y, z);
    };
    for (let x = Math.ceil(minX / step) * step; x <= maxX; x += step) crossAtX(x);
    for (let z = Math.ceil(minZ / step) * step; z <= maxZ; z += step) crossAtZ(z);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const lines = new THREE.LineSegments(geometry, material);
    lines.name = 'illustrative tile grid';
    group.add(lines);
    return lines;
  }
  function addUpperWall(segment, group, side) {
    const lower = wallBox(group, segment.from, segment.to, 0.76, 0.12, mats.slate, `${segment.id}-lower-wall`);
    const upper = wallBox(group, segment.from, segment.to, 1.65, 0.12, mats.concrete, `${side} upper wall`);
    upper.position.y = 0.76 + 1.65 / 2;
    if (side === 'west') upperWestWalls.push(upper);
    if (side === 'north') upperNorthWalls.push(upper);
    return [lower, upper];
  }
  function lineSegment(group, from, to, y, material, radius = 0.018) {
    const points = [
      new THREE.Vector3(from.x, y, from.z),
      new THREE.Vector3(to.x, y, to.z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances?.();
    group.add(line);
    return line;
  }
  function addDoorPanel(group, hinge, length, orientation, angle, material, name) {
    const pivot = new THREE.Group();
    pivot.position.set(hinge.x, 0, hinge.z);
    pivot.rotation.y = angle;
    const alongX = orientation === 'x' || orientation === 'negX';
    const center = alongX ? [(orientation === 'negX' ? -1 : 1) * length / 2, 0.78, 0] : [0, 0.78, -length / 2];
    const size = alongX ? [length, 1.56, 0.045] : [0.045, 1.56, length];
    box(pivot, center, size, material, { name });
    group.add(pivot);
    return pivot;
  }
  function addTagAtUv(id, uv, y = 1.4, offset = [0, 0]) {
    const { x, z } = uvToWorld(uv);
    addTag(id, [x + offset[0], y, z + offset[1]], 0.34);
  }

  const mainGroup = getGroup(8);
  const mainBase = new THREE.Mesh(shapeFromUv(layoutData.mainFloorUV), mats.slate);
  mainBase.position.y = -0.045;
  mainGroup.add(mainBase);
  addFloor(mainGroup, layoutData.mainFloorUV, mats.tileB, 0.014, 'main floor');
  const gridMaterial = new THREE.LineBasicMaterial({ color: '#c6c2b9', transparent: true, opacity: 0.62 });
  floorGrid(mainGroup, layoutData.mainFloorUV, 0.019, gridMaterial, 0.6);

  const ext = layoutData.extensionUV;
  const extUv = [[ext.left, ext.top], [ext.right, ext.top], [ext.right, ext.bottom], [ext.left, ext.bottom]];
  const extensionGroup = getGroup(11);
  addFloor(extensionGroup, extUv, mats.extension, 0.012, 'lower context plane · finish unspecified');

  // Main enclosure follows the plan outline; wall heights are illustrative cutaway geometry.
  const wallGroup = getGroup(8);
  layoutData.mainWalls.forEach((segment) => {
    if (segment.id === 'west') addUpperWall(segment, wallGroup, 'west');
    else if (segment.id === 'north') addUpperWall(segment, wallGroup, 'north');
    else if (segment.id === 'east') wallBox(wallGroup, segment.from, segment.to, 0.28, 0.16, mats.slateLight, 'east low cutaway wall');
    else if (segment.id === 'south-west') wallBox(wallGroup, segment.from, segment.to, 0.28, 0.16, mats.slateLight, 'south low cutaway wall');
    else wallBox(wallGroup, segment.from, segment.to, 0.76, 0.14, mats.concrete, segment.id);
  });

  const xBounds = layoutData.lowerRooms.xZone;
  const lowerWalls = getGroup(11);
  layoutData.lowerContextWalls.forEach((segment) => wallBox(lowerWalls, segment.from, segment.to, 0.76, 0.10, mats.slateLight, segment.id));
  layoutData.lowerRoomWalls.forEach((segment) => wallBox(lowerWalls, segment.from, segment.to, 0.76, 0.10, mats.concrete, segment.id));
  const partition = layoutData.lowerRooms.partition;
  const doorTopUv = [partition.u, partition.doorTop];
  const doorBottomUv = [partition.u, partition.doorBottom];
  wallBox(lowerWalls, [partition.u, partition.top], doorTopUv, 0.76, 0.10, mats.slateLight, 'lower partition upper');
  wallBox(lowerWalls, doorBottomUv, [partition.u, partition.bottom], 0.76, 0.10, mats.slateLight, 'lower partition lower');
  const lowerDoorGroup = getGroup(11);
  const lowerDoorHinge = uvToWorld(doorTopUv);
  const lowerDoorLength = Math.abs(uvToWorld(doorBottomUv).z - lowerDoorHinge.z);
  addDoorPanel(lowerDoorGroup, lowerDoorHinge, lowerDoorLength, 'z', Math.PI / 3, mats.walnut, 'lower partition door · plan reading');

  const xGroup = getGroup(5);
  const xA = uvToWorld([xBounds.left, xBounds.top]);
  const xB = uvToWorld([xBounds.right, xBounds.bottom]);
  const xC = uvToWorld([xBounds.right, xBounds.top]);
  const xD = uvToWorld([xBounds.left, xBounds.bottom]);
  const xLineMat = new THREE.LineBasicMaterial({ color: '#a9a7a0', transparent: true, opacity: 0.8 });
  lineSegment(xGroup, xA, xB, 0.015, xLineMat);
  lineSegment(xGroup, xC, xD, 0.015, xLineMat);
  addTagAtUv(5, [0.435, 0.862], 1.0);

  // Anonymous square fixture symbol: its use and exact size remain unknown.
  const unknownGroup = getGroup(6);
  const q = uvToWorld([0.5355, 0.9225]);
  box(unknownGroup, [q.x, 0.12, q.z], [0.42, 0.16, 0.30], mats.unknown, { name: 'unidentified plan fixture' });
  sphere(unknownGroup, [q.x, 0.205, q.z], [0.12, 0.025, 0.07], mats.darkBowl, 18);
  addTag(6, [q.x + 0.35, 1.05, q.z + 0.12], 0.31);

  // Left-wall fixture row, placed from the shared plan anchors.
  const urinalGroup = getGroup(1);
  const urinalAnchors = layoutData.fixtures.find((item) => item.id === 1).points;
  const urinalWorld = urinalAnchors.map(uvToWorld);
  urinalWorld.forEach(({ x, z }) => {
    box(urinalGroup, [x + 0.15, 1.0, z], [0.08, 0.55, 0.42], mats.concrete, { name: 'wall-side mounting plane' });
    sphere(urinalGroup, [x - 0.02, 0.76, z], [0.22, 0.25, 0.16], mats.ceramic, 24);
    sphere(urinalGroup, [x - 0.075, 0.82, z], [0.11, 0.035, 0.085], mats.darkBowl, 20);
    cylinder(urinalGroup, [x + 0.06, 1.30, z], 0.014, 0.014, 0.12, mats.brass, 12);
  });
  for (let i = 0; i < urinalWorld.length - 1; i++) {
    const z = (urinalWorld[i].z + urinalWorld[i + 1].z) / 2;
    box(urinalGroup, [urinalWorld[i].x - 0.02, 0.50, z], [0.34, 0.72, 0.035], mats.concrete, { name: 'illustrative divider' });
  }
  const urinalMid = uvToWorld([0.401, 0.428]);
  addTag(1, [urinalMid.x - 0.55, 1.55, urinalMid.z], 0.34);

  // Right-side three cubicles and fixtures. Panel heights are presentation-only.
  const cubicleGroup = getGroup(3);
  const toiletAnchors = layoutData.fixtures.find((item) => item.id === 3).points.map(uvToWorld);
  const mainRightWallX = uvToWorld([0.695, 0.5]).x;
  layoutData.cubiclePartitions.forEach(({ id, from, to }) => {
    wallBox(cubicleGroup, from, to, 0.80, 0.065, mats.concrete, id);
    const cap = wallBox(cubicleGroup, from, to, 0.03, 0.085, mats.slateLight, `${id}-cap`);
    cap.position.y = 0.815;
    cap.castShadow = false;
  });
  toiletAnchors.forEach(({ x, z }, index) => {
    const panX = mainRightWallX + 0.34;
    box(cubicleGroup, [mainRightWallX + 0.12, 0.42, z], [0.20, 0.84, 0.72], mats.concrete, { name: 'side cutaway' });
    sphere(cubicleGroup, [panX, 0.38, z], [0.29, 0.22, 0.21], mats.ceramic, 24);
    sphere(cubicleGroup, [panX + 0.04, 0.50, z], [0.18, 0.045, 0.13], mats.darkBowl, 20);
    box(cubicleGroup, [mainRightWallX + 0.15, 0.62, z], [0.18, 0.46, 0.32], mats.ceramic, { name: 'rear fixture block' });
    const accent = [mats.navy, mats.olive, mats.terracotta][index];
    box(cubicleGroup, [mainRightWallX + 0.075, 1.05, z], [0.035, 0.42, 0.48], accent, { castShadow: false, name: 'illustrative finish reference' });
  });
  const toiletMid = toiletAnchors[0];
  addTag(3, [toiletMid.x + 0.85, 1.55, toiletMid.z + 0.15], 0.34);

  // Two basins on the lower-left wall; no unverified mirror is added.
  const washGroup = getGroup(4);
  const basinAnchors = layoutData.fixtures.find((item) => item.id === 4).points.map(uvToWorld);
  const basinMidX = (basinAnchors[0].x + basinAnchors[1].x) / 2;
  const basinZ = basinAnchors[0].z;
  box(washGroup, [basinMidX, 0.78, basinZ + 0.10], [Math.abs(basinAnchors[0].x - basinAnchors[1].x) + 0.42, 0.12, 0.42], mats.walnut, { name: 'wash counter · schematic' });
  basinAnchors.forEach(({ x, z }) => {
    sphere(washGroup, [x, 0.86, z + 0.10], [0.22, 0.075, 0.16], mats.ceramic, 24);
    sphere(washGroup, [x, 0.91, z + 0.10], [0.14, 0.022, 0.10], mats.darkBowl, 20);
    cylinder(washGroup, [x - 0.11, 1.02, z + 0.22], 0.014, 0.014, 0.14, mats.brass, 12);
  });
  const basinTag = basinAnchors[1];
  addTag(4, [basinTag.x - 0.05, 1.55, basinTag.z + 0.50], 0.34);

  // Entrance opening and two-leaf swing are a medium-confidence plan reading.
  const entry = layoutData.entry;
  const entryStart = uvToWorld(entry.from), entryEnd = uvToWorld(entry.to);
  const openingWidth = Math.abs(entryEnd.x - entryStart.x);
  const entryGroup = getGroup(7);
  const southWallZ = (entryStart.z + entryEnd.z) / 2;
  const leftHinge = { x: entryStart.x, z: southWallZ };
  const rightHinge = { x: entryEnd.x, z: southWallZ };
  const leafWidth = openingWidth / entry.leafCount;
  addDoorPanel(entryGroup, leftHinge, leafWidth, 'negX', -Math.PI / 3, mats.walnut, 'entry leaf A · inferred swing');
  addDoorPanel(entryGroup, rightHinge, leafWidth, 'x', Math.PI / 3, mats.walnut, 'entry leaf B · inferred swing');
  const jambMat = mats.concrete;
  const jambWidth = 0.065;
  box(entryGroup, [entryStart.x, 0.82, southWallZ], [jambWidth, 1.64, 0.16], jambMat, { name: 'entry jamb' });
  box(entryGroup, [entryEnd.x, 0.82, southWallZ], [jambWidth, 1.64, 0.16], jambMat, { name: 'entry jamb' });
  const entryCenter = uvToWorld(entry.anchor);
  addTag(7, [entryCenter.x - 0.55, 1.70, entryCenter.z + 0.30], 0.31);

  // Candidate upper-wall line is deliberately not modeled as a window or a door.
  const openingGroup = getGroup(9);
  const openingA = uvToWorld(layoutData.openingCandidateUV.from);
  const openingB = uvToWorld(layoutData.openingCandidateUV.to);
  const dashedMaterial = new THREE.LineDashedMaterial({ color: '#71808a', dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.95 });
  const candidateLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(openingA.x, 0.20, openingA.z - 0.025),
    new THREE.Vector3(openingB.x, 0.20, openingB.z - 0.025)
  ]), dashedMaterial);
  candidateLine.computeLineDistances();
  openingGroup.add(candidateLine);
  const openingMid = { x: (openingA.x + openingB.x) / 2, z: (openingA.z + openingB.z) / 2 };
  addTag(9, [openingMid.x, 1.20, openingMid.z - 0.36], 0.31);

  // The 08 annotation remains fixed to the same floor tile in world coordinates.
  const tileAnchor = layoutData.fixtures.find((item) => item.id === 8).world;
  addTag(8, tileAnchor, 0.31, true);
  const lowerContextAnchor = uvToWorld(layoutData.fixtures.find((item) => item.id === 11).point);
  addTag(11, [lowerContextAnchor.x, 0.70, lowerContextAnchor.z], 0.32);

  // Route overlays are explanatory and are generated from the same plan anchors.
  const routeColors = { urinal: mats.routeOrange, stall: mats.routeGreen, wash: mats.routeBlue };
  Object.entries(layoutData.routes).forEach(([id, points]) => {
    const group = new THREE.Group();
    const curvePoints = points.map((uv) => {
      const { x, z } = uvToWorld(uv);
      return new THREE.Vector3(x, 0.115, z);
    });
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.035, 8, false), routeColors[id]);
    group.add(tube);
    const end = curve.getPoint(0.97);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 12), routeColors[id]);
    tip.position.copy(end);
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangent(0.97).normalize());
    group.add(tip);
    scene.add(group);
    routeGroups.set(id, group);
  });

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
          material.emissiveIntensity = 0.34;
        } else if (material.color) {
          material.color.lerp(new THREE.Color('#75a8d4'), 0.22);
        }
      });
    });
  }
  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    // Any excursion beyond the click slop makes the whole gesture a drag,
    // including a drag returning to its start; a second touch cancels selection.
    if (down || event.isPrimary === false) { down = null; return; }
    down = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, dragged: false };
  }
  function onPointerMove(event) {
    if (down && event.pointerId === down.pointerId && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) down.dragged = true;
  }
  function onPointerUp(event) {
    if (!down || event.pointerId !== down.pointerId || down.dragged || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) { down = null; return; }
    down = null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(uniqueSelectable, false).find((entry) => entry.object.userData.itemId);
    if (hit) updateDetail(hit.object.userData.itemId);
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', () => { down = null; });

  function updateViewButtons(view) {
    const iso = view === 'iso';
    document.querySelector('#view-iso').classList.toggle('is-active', iso);
    document.querySelector('#view-iso').setAttribute('aria-pressed', String(iso));
    document.querySelector('#view-top').classList.toggle('is-active', !iso);
    document.querySelector('#view-top').setAttribute('aria-pressed', String(!iso));
  }
  scene.updateMatrixWorld(true);
  const framingBounds = new THREE.Box3();
  scene.traverse((object) => {
    if (object.isMesh || object.isLine) framingBounds.union(new THREE.Box3().setFromObject(object));
  });
  framingBounds.expandByScalar(0.22);
  const framingCorners = [];
  for (const x of [framingBounds.min.x, framingBounds.max.x]) {
    for (const y of [framingBounds.min.y, framingBounds.max.y]) {
      for (const z of [framingBounds.min.z, framingBounds.max.z]) {
        framingCorners.push(new THREE.Vector3(x, y, z));
      }
    }
  }
  function resize() {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const aspect = rect.width / rect.height;
    const inverseRotation = camera.quaternion.clone().invert();
    let halfWidth = 0, halfHeight = 0;
    framingCorners.forEach((corner) => {
      const offset = corner.clone().sub(controls.target).applyQuaternion(inverseRotation);
      halfWidth = Math.max(halfWidth, Math.abs(offset.x));
      halfHeight = Math.max(halfHeight, Math.abs(offset.y));
    });
    const frustumHeight = Math.max(7.7, halfHeight * 2.05, halfWidth * 2.05 / aspect);
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
  function applyCutaway() {
    upperWestWalls.forEach((wall) => { wall.visible = camera.position.x < 2.1; });
    upperNorthWalls.forEach((wall) => { wall.visible = camera.position.z < 5.7; });
  }
  applyCutaway();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(() => {
    controls.update();
    applyCutaway();
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
      camera.position.set(target.x, target.y + 14, target.z - 0.01);
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
    applyCutaway();
    resize();
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
    applyCutaway();
    camera.updateProjectionMatrix();
    resize();
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
    applyCutaway();
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
    setRoute(id, enabled) { const group = routeGroups.get(id); if (group) group.visible = enabled; },
    __qa: { scene, camera, controls, framingCorners, renderer }
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
