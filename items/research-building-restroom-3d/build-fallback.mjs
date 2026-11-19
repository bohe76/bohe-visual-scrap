import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { layoutData, uvToSvg } from './layout-data.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(here, 'index.html');
const args = new Set(process.argv.slice(2));
const fmt = (n) => Number(n.toFixed(2));
const pt = (uv) => uvToSvg(uv).map(fmt);
const pathFor = (points, close = false) => {
  const parts = points.map((point, i) => `${i ? 'L' : 'M'} ${pt(point).join(' ')}`);
  if (close) parts.push('Z');
  return parts.join(' ');
};
const rectFor = (box) => {
  const [x, y] = pt([box.left, box.top]);
  const [x2, y2] = pt([box.right, box.bottom]);
  return { x, y, width: fmt(x2 - x), height: fmt(y2 - y) };
};
const tag = (id, uv, dx = 0, dy = 0) => {
  const [x0, y0] = pt(uv);
  const x = fmt(x0 + dx), y = fmt(y0 + dy);
  return `<g class="number-mark" data-item="${id}" transform="translate(${x} ${y})"><circle r="14"/><text y="5">${String(id).padStart(2, '0')}</text></g>`;
};

function generatedSvg() {
  const { crop, mainFloorUV, mainWalls, entry, extensionUV, lowerContextWalls, lowerRoomWalls, lowerRooms, openingCandidateUV, fixtures, cubiclePartitions, routes } = layoutData;
  const extension = rectFor({ left: extensionUV.left, right: extensionUV.right, top: extensionUV.top, bottom: extensionUV.bottom });
  const xBox = rectFor(lowerRooms.xZone);
  const smallBox = rectFor(lowerRooms.smallRoom);
  const entryStart = pt(entry.from), entryEnd = pt(entry.to);
  const doorCenterX = fmt((entryStart[0] + entryEnd[0]) / 2);
  const doorY = entryStart[1];
  const divX = fmt(lowerRooms.partition.u * crop.width);
  const doorTop = fmt(lowerRooms.partition.doorTop * crop.height);
  const doorBottom = fmt(lowerRooms.partition.doorBottom * crop.height);
  const [openA, openB] = [openingCandidateUV.from, openingCandidateUV.to].map(pt);
  const fixture = Object.fromEntries(fixtures.map((item) => [item.id, item]));
  const urinals = fixture[1].points.map((uv, i) => {
    const [x, y] = pt(uv);
    return `<g class="fixture" data-item="1"><ellipse class="fixture-ceramic" cx="${x}" cy="${y}" rx="11" ry="7"/><ellipse class="fixture-bowl" cx="${fmt(x - 1)}" cy="${y}" rx="5" ry="3"/><path class="fixture-detail" d="M ${fmt(x + 8)} ${fmt(y - 5)} h 8"/></g>`;
  }).join('');
  const toilets = fixture[3].points.map((uv) => {
    const [x, y] = pt(uv);
    return `<g class="fixture" data-item="3"><ellipse class="fixture-ceramic" cx="${x}" cy="${y}" rx="10" ry="6.5"/><ellipse class="fixture-bowl" cx="${fmt(x - 1)}" cy="${y}" rx="5" ry="3.4"/><rect class="fixture-ceramic" x="${fmt(x + 8)}" y="${fmt(y - 5)}" width="8" height="10" rx="1"/></g>`;
  }).join('');
  const basins = fixture[4].points.map((uv) => {
    const [x, y] = pt(uv);
    return `<g class="fixture" data-item="4"><circle class="fixture-ceramic" cx="${x}" cy="${y}" r="11"/><circle class="fixture-bowl" cx="${x}" cy="${y}" r="5"/></g>`;
  }).join('');
  const urinalDividers = fixture[1].points.slice(0, 2).map((uv, i) => {
    const next = fixture[1].points[i + 1];
    const mid = [(uv[0] + next[0]) / 2, (uv[1] + next[1]) / 2];
    const [x, y] = pt(mid);
    return `<path class="partition" d="M ${x} ${y} h 30"/>`;
  }).join('');
  const cubiclePartitionPaths = cubiclePartitions.map(({ id, from, to }) =>
    `<path class="partition cubicle-boundary" data-boundary="${id}" d="${pathFor([from, to])}"/>`
  ).join('');
  const wallPaths = mainWalls.map((wall) => `<path class="room-wall" d="${pathFor([wall.from, wall.to])}"/>`).join('');
  const lowerContextWallPaths = lowerContextWalls.map((wall) => `<path class="lower-wall context-boundary" d="${pathFor([wall.from, wall.to])}"/>`).join('');
  const lowerRoomWallPaths = lowerRoomWalls.map((wall) => `<path class="lower-wall" d="${pathFor([wall.from, wall.to])}"/>`).join('');
  const routeMarkup = Object.entries(routes).map(([name, points]) => `<g class="routes route-${name}" data-route="${name}"><path d="${pathFor(points)}" marker-end="url(#arrow-${name})"/></g>`).join('');
  const x = xBox.x, y = xBox.y, w = xBox.width, h = xBox.height;
  const [qX, qY] = pt(fixture[6].point);
  const tileAnchor = fixture[8].world;
  const lowerContextAnchor = fixture[11].point;
  const generated = `
  <defs>
    <pattern id="floor-grid" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#e8e5dc"/><path d="M48 0H0V48" fill="none" stroke="#c7c3b9" stroke-width="1.4"/></pattern>
    <marker id="arrow-urinal" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#c76d3c"/></marker>
    <marker id="arrow-stall" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#65846b"/></marker>
    <marker id="arrow-wash" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#5086c2"/></marker>
    <clipPath id="main-floor-clip"><path d="${pathFor(mainFloorUV, true)}"/></clipPath>
  </defs>
  <g class="fallback-space">
    <rect class="extension-floor" x="${extension.x}" y="${extension.y}" width="${extension.width}" height="${extension.height}" data-item="11"/>
    <rect class="lower-zone x-zone" x="${xBox.x}" y="${xBox.y}" width="${xBox.width}" height="${xBox.height}" data-item="5"/>
    <rect class="lower-zone small-room" x="${smallBox.x}" y="${smallBox.y}" width="${smallBox.width}" height="${smallBox.height}" data-item="6"/>
    <path class="x-mark" data-item="5" d="M ${x} ${y} L ${fmt(x + w)} ${fmt(y + h)} M ${fmt(x + w)} ${y} L ${x} ${fmt(y + h)}"/>
    <path class="room-floor" d="${pathFor(mainFloorUV, true)}" data-item="8"/>
    <path class="room-tiles" d="${pathFor(mainFloorUV, true)}"/>

    ${wallPaths}
    ${lowerContextWallPaths}
    ${lowerRoomWallPaths}
    <path class="lower-wall" d="M ${divX} ${pt([lowerRooms.partition.u, lowerRooms.partition.top])[1]} V ${doorTop} M ${divX} ${doorBottom} V ${pt([lowerRooms.partition.u, lowerRooms.partition.bottom])[1]}"/>
    <path class="door-swing" data-item="7" d="M ${entryStart[0]} ${doorY} A 46 46 0 0 1 ${fmt(doorCenterX - 4)} ${fmt(doorY + 46)} M ${entryEnd[0]} ${doorY} A 46 46 0 0 0 ${fmt(doorCenterX + 4)} ${fmt(doorY + 46)}"/>
    <path class="door-leaf" data-item="7" d="M ${entryStart[0]} ${doorY} L ${fmt(doorCenterX - 4)} ${fmt(doorY + 37)} M ${entryEnd[0]} ${doorY} L ${fmt(doorCenterX + 4)} ${fmt(doorY + 37)}"/>
    <g data-item="9" class="fixture opening-candidate"><path d="M ${openA[0]} ${fmt(openA[1] - 9)} H ${openB[0]} V ${fmt(openB[1] + 9)} H ${openA[0]} Z"/></g>
    <g data-item="1" class="fixture urinals">${urinals}${urinalDividers}</g>
    <g data-item="3" class="fixture toilets">${toilets}${cubiclePartitionPaths}</g>
    <g data-item="4" class="fixture wash-area"><rect class="counter" x="${fmt(pt([0.393, 0.708])[0])}" y="${fmt(pt([0.393, 0.708])[1])}" width="${fmt(pt([0.518, 0.708])[0] - pt([0.393, 0.708])[0])}" height="${fmt(pt([0.518, 0.744])[1] - pt([0.518, 0.708])[1])}" rx="3"/>${basins}</g>
    <g data-item="5" class="fixture x-zone-symbol"><text x="${fmt(x + w / 2)}" y="${fmt(y + h / 2 + 4)}" text-anchor="middle">X</text></g>
    <g data-item="6" class="fixture unknown-fixture"><rect class="generic-fixture" x="${fmt(qX - 14)}" y="${fmt(qY - 9)}" width="28" height="18" rx="2"/><ellipse class="fixture-bowl" cx="${qX}" cy="${qY}" rx="6" ry="4"/></g>
    <g data-item="11" class="door-lower"><path class="door-swing" d="M ${divX} ${doorTop} A 38 38 0 0 1 ${fmt(divX + 38)} ${fmt(doorTop + 38)}"/><path class="door-leaf" d="M ${divX} ${doorTop} L ${fmt(divX + 30)} ${fmt(doorTop + 25)}"/></g>
    ${routeMarkup}
    ${tag(1, fixture[1].points[1], -28, -18)}
    ${tag(3, fixture[3].points[0], 31, -21)}
    ${tag(4, fixture[4].points[1], 31, 14)}
    ${tag(5, [0.435, 0.862], -26, 0)}
    ${tag(6, fixture[6].point, 27, -14)}
    ${tag(7, entry.anchor, 12, -34)}
    ${tag(8, worldToUv(tileAnchor), 0, 0)}
    ${tag(9, [0.520, 0.249], 12, -18)}
    ${tag(11, lowerContextAnchor, 0, 0)}
  </g>`;
  return generated;
}

function worldToUv([x, , z]) {
  const { basis } = layoutData;
  const u = basis.u0 + ((basis.width / 2 - x) / basis.width) * (basis.u1 - basis.u0);
  const v = basis.v0 + ((basis.depth - z) / basis.depth) * (basis.v1 - basis.v0);
  return [u, v];
}
function awaitlessWorldToSvg(world) { return uvToSvg(worldToUv(world)).map(fmt); }

const index = fs.readFileSync(indexPath, 'utf8');
const markerStart = '<!-- layout-generated:start -->';
const markerEnd = '<!-- layout-generated:end -->';
const start = index.indexOf(markerStart);
const end = index.indexOf(markerEnd);
if (start < 0 || end < start) throw new Error('Generated fallback markers are missing from index.html');
const updated = `${index.slice(0, start + markerStart.length)}\n${generatedSvg()}\n  ${index.slice(end)}`;
if (args.has('--check')) {
  if (updated !== index) throw new Error('Inline fallback is stale; run node build-fallback.mjs');
  console.log('PASS inline 2D fallback matches shared layout data');
} else {
  fs.writeFileSync(indexPath, updated);
  console.log('Generated inline no-JS fallback from layout-data.mjs');
}
