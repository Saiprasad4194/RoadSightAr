import sys
from pathlib import Path

# Add project root directory to Python path to support execution from any working directory
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

try:
    from backend.vision.camera import run_live_display
    from backend.vision.lane_detection import process_frame
except ImportError:
    from vision.camera import run_live_display
    from vision.lane_detection import process_frame


def main():
    """
    RoadSight AR Main Entrypoint.
    Launches camera feed and passes every frame through the OpenCV lane detection pipeline.
    """
    print("=" * 50)
    print("         RoadSight AR - Main Application        ")
    print("=" * 50)
    print("[RoadSight AR] Launching webcam feed with Lane Detection...")
    
    # Run live display with lane detection frame processing
    run_live_display(
        source=0,
        window_name="RoadSight AR - Lane Detection Stream",
        frame_processor=process_frame
    )


if __name__ == "__main__":
    main()
