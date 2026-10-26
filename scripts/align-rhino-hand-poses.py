"""Inspect a matching-topology pose pair; export a wrist-aligned morph proof."""
import json
import sys
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / '.audit-logs/rhino-tools'))
import rhino3dm as rhino

document = rhino.File3dm.Read(str(next((root/'public/3D hand').glob('*.3dm'))))
a = np.array([[v.X,v.Y,v.Z] for v in document.Objects[41].Geometry.Vertices])
b = np.array([[v.X,v.Y,v.Z] for v in document.Objects[54].Geometry.Vertices])
# The wrist ring, rather than the differently bent forearm or fingers.
selected = (a[:,2] > 0) & (a[:,2] < 50)
ca, cb = a[selected].mean(axis=0), b[selected].mean(axis=0)
x, y = b[selected]-cb, a[selected]-ca
u, singular, vt = np.linalg.svd(x.T@y)
correction = np.ones(3)
correction[-1] = np.linalg.det(u@vt)
rotation = u@np.diag(correction)@vt
scale = (singular*correction).sum()/(x*x).sum()
aligned = (b-cb)@rotation*scale+ca
rmse = np.sqrt(((aligned[selected]-a[selected])**2).sum(axis=1).mean())
size, centre = np.ptp(a,axis=0).max(), (a.min(axis=0)+a.max(axis=0))/2
def convert(points):
    return np.round(np.column_stack([points[:,0]-centre[0],points[:,2]-centre[2],-(points[:,1]-centre[1])])*2.8/size,6).reshape(-1).tolist()
indices = []
for ia,ib,ic,id in document.Objects[41].Geometry.Faces:
    indices.extend([ia,ib,ic])
    if ic != id:
        indices.extend([ia,ic,id])
result = {'from':'P15','to':'P11','vertices':len(a),'wristScale':float(scale),'wristFitRMSE':float(rmse),'wristFitRelativeToLength':float(rmse/size),'open':convert(aligned),'cupped':convert(a),'indices':indices}
(root/'.audit-logs/hand-authoring/rhino-morph-pair.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k not in ['open','cupped','indices']},indent=2))
