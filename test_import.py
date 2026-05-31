"""Test script to debug import paths"""
import sys, os
script_path = os.path.abspath(__file__)
print('__file__:', __file__)
print('abspath:', script_path)
print('dirname:', os.path.dirname(script_path))
sys.path.insert(0, os.path.dirname(script_path))
print('sys.path[0]:', sys.path[0])
print('app dir exists:', os.path.isdir(os.path.join(os.path.dirname(script_path), 'app')))
print('detector exists:', os.path.isfile(os.path.join(os.path.dirname(script_path), 'app', 'detector.py')))
try:
    from app.detector import analyze_video
    print('import OK')
except Exception as e:
    print('import FAILED:', e)
