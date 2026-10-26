"""Re-extract selected reference poses after deliberately replacing the Rhino source.

Requires rhino3dm and numpy in the authoring Python environment; neither ships
to the browser. Review the contact sheet whenever source object IDs change.
"""
import json
import runpy
from pathlib import Path

root = Path(__file__).resolve().parents[1]
for script in ['inspect-rhino-hands.py', 'align-rhino-hand-poses.py']:
    runpy.run_path(str(root / 'scripts' / script), run_name='__main__')
audit = root / '.audit-logs/hand-authoring'
catalog = json.loads((audit / 'rhino-poses.json').read_text(encoding='utf-8'))
pinch = next(p for p in catalog['poses'] if p['id'] == 'P08')
pair = json.loads((audit / 'rhino-morph-pair.json').read_text(encoding='utf-8'))
poses = {p['id']: p for p in catalog['poses']}
assert poses['P11']['mainTopology'] == poses['P15']['mainTopology'], 'Pose correspondence changed'
assert pinch['key'] == 'group-01', 'Pinch identity changed; review the source'
destination = root / 'scripts/assets/rhino-hand-poses.json'
destination.parent.mkdir(exist_ok=True)
destination.write_text(json.dumps({'source': catalog['source'], 'pinch': pinch, 'grip': pair}, separators=(',', ':')), encoding='utf-8')
print('Selected reference poses exported. Run node scripts/build-hand-particles.mjs next.')
