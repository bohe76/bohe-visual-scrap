export const layoutData = {
  schema: 1,
  coordinateNote: 'Approximate plan registration from dimension-line references; not a survey or clear internal dimensions.',
  crop: { width: 760, height: 680 },
  basis: { u0: 0.374, u1: 0.707, v0: 0.247, v1: 0.768, width: 4.0, depth: 5.6 },
  mainFloorUV: [
    [0.382, 0.249], [0.695, 0.249], [0.707, 0.258], [0.707, 0.276],
    [0.695, 0.276], [0.695, 0.760], [0.382, 0.760]
  ],
  mainWalls: [
    { id: 'west', from: [0.382, 0.760], to: [0.382, 0.249], group: 8 },
    { id: 'north', from: [0.382, 0.249], to: [0.695, 0.249], group: 8 },
    { id: 'upper-east-jog-a', from: [0.695, 0.249], to: [0.707, 0.258], group: 8 },
    { id: 'upper-east-jog-b', from: [0.707, 0.258], to: [0.707, 0.276], group: 8 },
    { id: 'upper-east-jog-c', from: [0.707, 0.276], to: [0.695, 0.276], group: 8 },
    { id: 'east', from: [0.695, 0.276], to: [0.695, 0.760], group: 8 },
    { id: 'south-west', from: [0.382, 0.760], to: [0.592, 0.760], group: 8 }
  ],
  entry: {
    id: 7,
    from: [0.592, 0.760],
    to: [0.695, 0.760],
    anchor: [0.644, 0.778],
    leafCount: 2,
    swingUV: 0.105,
    confidence: 'medium'
  },
  extensionUV: { left: 0.382, right: 0.695, top: 0.768, bottom: 0.944 },
  lowerContextWalls: [
    { id: 'passage-east-boundary', from: [0.695, 0.760], to: [0.695, 0.944] }
  ],
  lowerRoomWalls: [
    { id: 'x-zone-top', from: [0.383, 0.781], to: [0.486, 0.781] },
    { id: 'x-zone-left', from: [0.383, 0.781], to: [0.383, 0.944] },
    { id: 'x-zone-bottom', from: [0.383, 0.944], to: [0.486, 0.944] },
    { id: 'small-room-top', from: [0.495, 0.781], to: [0.577, 0.781] },
    { id: 'small-room-right', from: [0.577, 0.781], to: [0.577, 0.944] },
    { id: 'small-room-bottom', from: [0.495, 0.944], to: [0.577, 0.944] }
  ],
  lowerRooms: {
    xZone: { left: 0.383, right: 0.486, top: 0.781, bottom: 0.944 },
    smallRoom: { left: 0.495, right: 0.577, top: 0.781, bottom: 0.944 },
    partition: { u: 0.490, top: 0.781, doorTop: 0.834, doorBottom: 0.890, bottom: 0.944 },
    doorConfidence: 'medium'
  },
  openingCandidateUV: { from: [0.397, 0.249], to: [0.520, 0.249] },
  fixtures: [
    { id: 1, type: 'urinals', points: [[0.401, 0.340], [0.401, 0.428], [0.401, 0.515]] },
    { id: 3, type: 'cubicles', points: [[0.660, 0.289], [0.660, 0.381], [0.660, 0.474]] },
    { id: 4, type: 'basins', points: [[0.422, 0.727], [0.489, 0.727]] },
    { id: 5, type: 'unknown-x-zone', bounds: { left: 0.383, right: 0.486, top: 0.781, bottom: 0.944 } },
    { id: 6, type: 'unknown-fixture', point: [0.5355, 0.9225] },
    { id: 7, type: 'entry', point: [0.644, 0.778] },
    { id: 8, type: 'tile-anchor', world: [-0.65, 0.014, 3.32] },
    { id: 9, type: 'opening-candidate', segment: [[0.397, 0.249], [0.520, 0.249]] },
    { id: 11, type: 'lower-context', point: [0.645, 0.862] }
  ],
  cubiclePartitions: [
    { id: 'cubicle-divider-1', kind: 'divider', from: [0.6152631579, 0.335], to: [0.695, 0.335] },
    { id: 'cubicle-divider-2', kind: 'divider', from: [0.6152631579, 0.4275], to: [0.695, 0.4275] },
    { id: 'cubicle-end-cap', kind: 'end-boundary', from: [0.6152631579, 0.503], to: [0.695, 0.503] }
  ],
  routes: {
    urinal: [[0.644, 0.778], [0.570, 0.680], [0.480, 0.535], [0.401, 0.428], [0.401, 0.340]],
    stall: [[0.644, 0.778], [0.630, 0.650], [0.650, 0.500], [0.660, 0.381]],
    wash: [[0.422, 0.727], [0.520, 0.740], [0.600, 0.760], [0.644, 0.778]]
  }
};

export function uvToWorld([u, v]) {
  const { u0, u1, v0, v1, width, depth } = layoutData.basis;
  return {
    x: width / 2 - ((u - u0) / (u1 - u0)) * width,
    z: depth - ((v - v0) / (v1 - v0)) * depth
  };
}

export function uvToSvg([u, v]) {
  return [u * layoutData.crop.width, v * layoutData.crop.height];
}

export function worldToSvg([x, , z]) {
  const { u0, u1, v0, v1, width, depth } = layoutData.basis;
  const u = u0 + ((width / 2 - x) / width) * (u1 - u0);
  const v = v0 + ((depth - z) / depth) * (v1 - v0);
  return uvToSvg([u, v]);
}
