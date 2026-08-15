import time
import cv2


class CameraStream:
    """
    Reusable Camera Stream module for OpenCV video capture.
    Provides frame grabbing, FPS tracking, and cleanup handling.
    """

    def __init__(self, source: int | str = 0, width: int | None = None, height: int | None = None):
        """
        Initialize video capture stream.
        
        :param source: Camera index (int) or video file path (str). Default is 0.
        :param width: Optional frame width to request.
        :param height: Optional frame height to request.
        """
        self.source = source
        self.cap = cv2.VideoCapture(self.source)

        if not self.cap.isOpened():
            raise RuntimeError(f"Error: Unable to open camera or video source '{self.source}'.")

        if width is not None:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        if height is not None:
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

        self._prev_time = time.time()
        self._fps = 0.0

    def is_opened(self) -> bool:
        """Check if camera capture is initialized and open."""
        return self.cap is not None and self.cap.isOpened()

    def get_frame(self):
        """
        Read the next frame from the camera.
        
        :return: (success_flag, frame_bgr)
        """
        if not self.is_opened():
            return False, None
        return self.cap.read()

    def compute_fps(self) -> float:
        """Calculate and update current FPS."""
        current_time = time.time()
        delta = current_time - self._prev_time
        if delta > 0:
            self._fps = 1.0 / delta
        self._prev_time = current_time
        return self._fps

    @property
    def fps(self) -> float:
        """Current FPS property."""
        return self._fps

    def draw_fps(self, frame, fps_val: float | None = None) -> None:
        """
        Overlay FPS counter on the top-left of the image frame.
        
        :param frame: The BGR image frame to annotate.
        :param fps_val: Optional custom FPS value to draw; defaults to self._fps.
        """
        if frame is None:
            return
        
        display_fps = fps_val if fps_val is not None else self._fps
        fps_text = f"FPS: {display_fps:.1f}"

        # Draw semi-transparent background box for readability
        cv2.rectangle(frame, (10, 10), (160, 45), (0, 0, 0), -1)
        cv2.putText(
            frame,
            fps_text,
            (20, 35),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

    def release(self) -> None:
        """Release the camera hardware resource."""
        if self.cap and self.cap.isOpened():
            self.cap.release()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()


def run_live_display(
    source: int | str = 0,
    window_name: str = "RoadSight AR - Live Camera",
    frame_processor=None
):
    """
    Standalone runner to open camera, display video feed with FPS, and handle exit on 'q' or 'Q'.
    
    :param source: Video source index or file path.
    :param window_name: Title of the OpenCV display window.
    :param frame_processor: Optional callable to transform/process each frame (e.g. lane detection).
    """
    try:
        with CameraStream(source=source) as camera:
            print(f"[RoadSight AR] Camera stream started from source: {source}")
            print("[RoadSight AR] Press 'q' or 'Q' in the window to quit.")

            while camera.is_opened():
                ret, frame = camera.get_frame()
                if not ret or frame is None:
                    print("[RoadSight AR] Warning: Failed to grab frame or stream ended.")
                    break

                # Apply frame processing pipeline if provided
                if frame_processor is not None:
                    frame = frame_processor(frame)

                # Update FPS & draw overlay
                camera.compute_fps()
                camera.draw_fps(frame)

                # Show live video frame
                cv2.imshow(window_name, frame)

                # Exit when 'q' or 'Q' is pressed
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == ord('Q'):
                    print("[RoadSight AR] Quitting camera stream...")
                    break

    except Exception as e:
        print(f"[RoadSight AR] Camera Error: {e}")
    finally:
        cv2.destroyAllWindows()


if __name__ == "__main__":
    run_live_display()
