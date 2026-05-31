"""Debug the sys.path issue"""
import sys, os
print('__file__:', repr(__file__))
script_dir = os.path.dirname(os.path.abspath(__file__))
print('script_dir:', repr(script_dir))
sys.path.insert(0, script_dir)
print('sys.path[0]:', repr(sys.path[0]))
app_path = os.path.join(script_dir, 'app', 'detector.py')
print('detector.py exists:', os.path.isfile(app_path))
try:
    from app.detector import analyze_video
    print('import OK')
except ModuleNotFoundError as e:
    print('FAILED:', e)
