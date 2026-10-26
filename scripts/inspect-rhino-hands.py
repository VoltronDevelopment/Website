"""Read-only inspection/export of the supplied Rhino pose library to audit JSON."""
import hashlib
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / '.audit-logs/rhino-tools'))
import rhino3dm as rhino

source = next((root / 'public/3D hand').glob('*.3dm'))
document = rhino.File3dm.Read(str(source))
grouped = {}
for index, obj in enumerate(document.Objects):
    geometry = obj.Geometry
    bounds = geometry.GetBoundingBox()
    if max(bounds.Max.X-bounds.Min.X, bounds.Max.Y-bounds.Min.Y, bounds.Max.Z-bounds.Min.Z) > 2000:
        continue  # Ground plane, not a hand.
    groups = list(obj.Attributes.GetGroupList())
    key = f'group-{groups[0]:02d}' if groups else f'object-{index:02d}'
    meshes = [geometry] if isinstance(geometry, rhino.Mesh) else [face.GetMesh(rhino.MeshType.Render) for face in geometry.Faces] if isinstance(geometry, rhino.Brep) else []
    for mesh in meshes:
        if mesh:
            grouped.setdefault(key, []).append((index, mesh, obj.Attributes.LayerIndex))

catalog = []
for key, items in grouped.items():
    all_points = [v for _, mesh, _ in items for v in mesh.Vertices]
    low = [min(getattr(v, axis) for v in all_points) for axis in ['X', 'Y', 'Z']]
    high = [max(getattr(v, axis) for v in all_points) for axis in ['X', 'Y', 'Z']]
    centre = [(a+b)/2 for a,b in zip(low, high)]
    scale = 2.8 / max(b-a for a,b in zip(low, high))
    parts = []
    for index, mesh, layer in items:
        positions = []
        normals = []
        for vertex in mesh.Vertices:
            positions.extend([round((vertex.X-centre[0])*scale,6), round((vertex.Z-centre[2])*scale,6), round(-(vertex.Y-centre[1])*scale,6)])
        if len(mesh.Normals) == len(mesh.Vertices):
            for normal in mesh.Normals:
                normals.extend([round(normal.X,6),round(normal.Z,6),round(-normal.Y,6)])
        indices = []
        for a,b,c,d in mesh.Faces:
            indices.extend([a,b,c])
            if c != d:
                indices.extend([a,c,d])
        topology = hashlib.sha256(json.dumps(indices, separators=(',',':')).encode()).hexdigest()[:12]
        parts.append({'object':index,'layer':layer,'vertices':len(mesh.Vertices),'triangles':len(indices)//3,'topology':topology,'positions':positions,'normals':normals,'indices':indices})
    main = max(parts, key=lambda p:p['vertices'])
    catalog.append({'key':key,'centre':centre,'scale':scale,'sourceBounds':[low,high],'mainVertices':main['vertices'],'mainTopology':main['topology'],'parts':parts})

catalog.sort(key=lambda p:(round(p['centre'][1]/500),p['centre'][0]))
for number, pose in enumerate(catalog,1):
    pose['id'] = f'P{number:02d}'
out = root / '.audit-logs/hand-authoring'
out.mkdir(parents=True,exist_ok=True)
(out/'rhino-poses.json').write_text(json.dumps({'source':str(source.relative_to(root)),'poses':catalog},separators=(',',':')),encoding='utf-8')
summary = [{key:pose[key] for key in ['id','key','mainVertices','mainTopology']} | {'parts':len(pose['parts']),'triangles':sum(p['triangles'] for p in pose['parts'])} for pose in catalog]
(out/'rhino-summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
print(json.dumps(summary,indent=2))
