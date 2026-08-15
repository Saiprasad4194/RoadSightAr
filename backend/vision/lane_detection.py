"""
RoadSight AR - Lane Detection Module
Classical OpenCV Computer Vision Pipeline for Real-Time Road Lane Detection & Drivable Area Visualization.

Pipeline Steps:
1. Grayscale Conversion: Reduces color image to single intensity channel.
2. Gaussian Blur: Smooths image noise to prevent false edges.
3. Canny Edge Detection: Highlights strong intensity gradients (road lines).
4. Region of Interest (ROI) Masking: Isolates lower trapezoidal road perspective.
5. Hough Line Transform (HoughLinesP): Extracts line segments from edge pixels.
6. Slope Separation & Fitting: Classifies left vs. right lanes and extrapolates boundary lines.
7. Drivable Road Polygon Generation: Constructs 4-point trapezoid between detected boundaries.
8. Overlay Visualization: Blends semi-transparent road area polygon and renders solid lane boundary lines.
"""

from typing import List, Tuple, Optional
import cv2
import numpy as np


def to_grayscale(frame: np.ndarray) -> np.ndarray:
    """
    Step 1: Convert BGR camera frame to Grayscale.
    Removing color channels simplifies the image into pixel intensities (0-255),
    which accelerates edge detection and makes gradient computation channel-independent.
    """
    if frame is None or frame.size == 0:
        return frame
    return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)


def apply_gaussian_blur(gray_frame: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """
    Step 2: Apply Gaussian Blur.
    Convolves the image with a Gaussian kernel to suppress high-frequency noise
    and small image details (e.g. asphalt texture, small debris) before edge detection.
    """
    if gray_frame is None or gray_frame.size == 0:
        return gray_frame
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.GaussianBlur(gray_frame, (kernel_size, kernel_size), 0)


def detect_edges(blur_frame: np.ndarray, low_threshold: int = 50, high_threshold: int = 150) -> np.ndarray:
    """
    Step 3: Canny Edge Detection.
    Computes spatial image gradients using Sobolev derivative operators.
    Pixels with intensity gradient > high_threshold are marked as edges.
    Pixels below low_threshold are discarded. Pixels in between are kept if connected to strong edges.
    """
    if blur_frame is None or blur_frame.size == 0:
        return blur_frame
    return cv2.Canny(blur_frame, low_threshold, high_threshold)


def get_region_of_interest(
    edges: np.ndarray,
    roi_vertices: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Step 4 & 5: Create and apply a Trapezoidal Region of Interest (ROI) mask.
    Masks out irrelevant upper regions of the frame (sky, trees, oncoming traffic)
    and side view artifacts, retaining only the lower trapezoidal perspective of the road lane ahead.
    """
    if edges is None or edges.size == 0:
        return edges

    height, width = edges.shape[:2]

    # If no custom vertices provided, construct default trapezoid focused on lower road section
    if roi_vertices is None:
        roi_vertices = np.array([
            [
                (int(width * 0.08), height),                   # Bottom-Left
                (int(width * 0.43), int(height * 0.60)),      # Top-Left (near horizon)
                (int(width * 0.57), int(height * 0.60)),      # Top-Right (near horizon)
                (int(width * 0.92), height)                   # Bottom-Right
            ]
        ], dtype=np.int32)

    # Create empty black mask matching edges image dimension
    mask = np.zeros_like(edges)

    # Fill the trapezoidal polygon with white (255)
    cv2.fillPoly(mask, roi_vertices, 255)

    # Bitwise AND to keep only edge pixels located inside the trapezoid
    masked_edges = cv2.bitwise_and(edges, mask)
    return masked_edges


def detect_hough_lines(
    masked_edges: np.ndarray,
    rho: float = 1.0,
    theta: float = np.pi / 180.0,
    threshold: int = 20,
    min_line_len: int = 20,
    max_line_gap: int = 300
) -> Optional[np.ndarray]:
    """
    Step 6: Probabilistic Hough Line Transform (HoughLinesP).
    Transforms edge pixels into polar coordinates (r, theta) to identify collinear points forming line segments.
    Returns array of line endpoints [[x1, y1, x2, y2], ...] or None if no lines detected.
    """
    if masked_edges is None or masked_edges.size == 0:
        return None

    lines = cv2.HoughLinesP(
        masked_edges,
        rho=rho,
        theta=theta,
        threshold=threshold,
        minLineLength=min_line_len,
        maxLineGap=max_line_gap
    )
    return lines


def separate_and_fit_lanes(
    lines: Optional[np.ndarray],
    image_shape: Tuple[int, int]
) -> Tuple[Optional[Tuple[int, int, int, int]], Optional[Tuple[int, int, int, int]]]:
    """
    Step 7: Separate and estimate Left and Right Lane Lines.
    1. Calculates slope m = (y2 - y1) / (x2 - x1) for each line segment.
    2. Filters horizontal/extreme slopes (noise/crosswalk lines).
    3. Groups lines into Left Lane (negative slope in image space) and Right Lane (positive slope).
    4. Computes fitted line parameters x = f(y) and extrapolates endpoints from bottom of frame
       to the top ROI horizon level.

    Handles cases where no lines or only one side is detected by returning None for missing lanes.
    """
    if lines is None or len(lines) == 0:
        return None, None

    height, width = image_shape[:2]

    left_x, left_y = [], []
    right_x, right_y = [], []

    # Y bounds for extrapolation: from bottom of image to ROI apex (~60% height)
    y_max = height
    y_min = int(height * 0.60)

    for line in lines:
        x1, y1, x2, y2 = line[0] if len(line.shape) > 1 and line.shape[0] == 1 else line
        if x1 == x2:
            continue  # Skip vertical lines to prevent division by zero slope

        slope = (y2 - y1) / (x2 - x1)

        # Filter out near-horizontal or extreme slopes to remove noise
        if abs(slope) < 0.35 or abs(slope) > 3.0:
            continue

        # OpenCV image origin is top-left:
        # - Left lane extends from bottom-left to top-center (y decreases as x increases -> negative slope)
        # - Right lane extends from top-center to bottom-right (y increases as x increases -> positive slope)
        if slope < 0 and x1 < width * 0.55 and x2 < width * 0.55:
            left_x.extend([x1, x2])
            left_y.extend([y1, y2])
        elif slope > 0 and x1 > width * 0.45 and x2 > width * 0.45:
            right_x.extend([x1, x2])
            right_y.extend([y1, y2])

    left_line = None
    right_line = None

    # Fit linear polynomial x = f(y) for left lane
    if len(left_x) >= 2 and len(left_y) >= 2:
        try:
            poly_left = np.polyfit(left_y, left_x, deg=1)
            x_max_left = int(np.polyval(poly_left, y_max))
            x_min_left = int(np.polyval(poly_left, y_min))
            left_line = (x_max_left, y_max, x_min_left, y_min)
        except (np.linalg.LinAlgError, ValueError):
            left_line = None

    # Fit linear polynomial x = f(y) for right lane
    if len(right_x) >= 2 and len(right_y) >= 2:
        try:
            poly_right = np.polyfit(right_y, right_x, deg=1)
            x_max_right = int(np.polyval(poly_right, y_max))
            x_min_right = int(np.polyval(poly_right, y_min))
            right_line = (x_max_right, y_max, x_min_right, y_min)
        except (np.linalg.LinAlgError, ValueError):
            right_line = None

    return left_line, right_line


def create_drivable_road_polygon(
    left_line: Optional[Tuple[int, int, int, int]],
    right_line: Optional[Tuple[int, int, int, int]]
) -> Optional[np.ndarray]:
    """
    Constructs a 4-point convex polygon representing the drivable road area
    enclosed between the detected left and right lane boundary lines.

    Calculation Details:
    1. Check boundary availability: Both left_line and right_line must be valid (not None).
       If either boundary is missing, returns None to avoid rendering an unreliable polygon.
    2. Extract endpoints:
       - left_line = (x1_left, y1_left, x2_left, y2_left) [bottom -> top horizon]
       - right_line = (x1_right, y1_right, x2_right, y2_right) [bottom -> top horizon]
    3. Vertex ordering: Points are ordered clockwise to form a quadrangle:
       - Point 1 (Bottom-Left):  (x1_left, y1_left)
       - Point 2 (Top-Left):     (x2_left, y2_left)
       - Point 3 (Top-Right):    (x2_right, y2_right)
       - Point 4 (Bottom-Right): (x1_right, y1_right)
    """
    if left_line is None or right_line is None:
        return None

    x1_l, y1_l, x2_l, y2_l = left_line
    x1_r, y1_r, x2_r, y2_r = right_line

    polygon_points = np.array([
        [
            [x1_l, y1_l],  # Bottom-Left
            [x2_l, y2_l],  # Top-Left (horizon apex)
            [x2_r, y2_r],  # Top-Right (horizon apex)
            [x1_r, y1_r]   # Bottom-Right
        ]
    ], dtype=np.int32)

    return polygon_points


def draw_drivable_road_overlay(
    frame: np.ndarray,
    road_polygon: Optional[np.ndarray],
    color: Tuple[int, int, int] = (0, 200, 100),
    alpha: float = 0.35
) -> np.ndarray:
    """
    Renders the drivable road area polygon onto the frame with transparency.

    - cv2.fillPoly fills the polygon onto a temporary overlay layer.
    - cv2.addWeighted blends the filled overlay with the original frame so the road texture
      remains visible underneath the semi-transparent highlight.
    """
    if frame is None or frame.size == 0 or road_polygon is None:
        return frame

    overlay = frame.copy()
    cv2.fillPoly(overlay, road_polygon, color)
    blended_frame = cv2.addWeighted(overlay, alpha, frame, 1.0 - alpha, 0)
    return blended_frame


def draw_lane_lines(
    frame: np.ndarray,
    left_line: Optional[Tuple[int, int, int, int]],
    right_line: Optional[Tuple[int, int, int, int]],
    line_color: Tuple[int, int, int] = (0, 255, 0),
    thickness: int = 8,
    show_drivable_area: bool = True
) -> np.ndarray:
    """
    Step 8: Render drivable road visualization overlay and solid lane boundary lines on original frame.

    1. Computes drivable road polygon if both left and right boundaries exist.
    2. Overlays translucent road polygon onto the frame.
    3. Draws solid left and right lane lines on top for crisp visual boundaries.
    """
    if frame is None or frame.size == 0:
        return frame

    output_frame = frame.copy()

    # 1. Overlay drivable road area polygon (if both boundaries exist)
    if show_drivable_area:
        road_poly = create_drivable_road_polygon(left_line, right_line)
        if road_poly is not None:
            output_frame = draw_drivable_road_overlay(output_frame, road_poly, color=(0, 200, 100), alpha=0.35)

    # 2. Draw solid left lane line (Green)
    if left_line is not None:
        cv2.line(output_frame, (left_line[0], left_line[1]), (left_line[2], left_line[3]), line_color, thickness)

    # 3. Draw solid right lane line (Green)
    if right_line is not None:
        cv2.line(output_frame, (right_line[0], right_line[1]), (right_line[2], right_line[3]), line_color, thickness)

    return output_frame


def process_frame(frame: np.ndarray) -> np.ndarray:
    """
    Main Entrypoint: Complete OpenCV Lane Detection & Drivable Road Visualization Pipeline.

    Receives a BGR camera frame, passes it through all computer vision stages:
    1. Grayscale conversion
    2. Gaussian blur smoothing
    3. Canny edge detection
    4. ROI trapezoid masking
    5. Hough lines extraction
    6. Left/Right lane fitting & extrapolation
    7. Drivable road area polygon generation & transparent overlay rendering
    8. Solid lane line drawing

    Returns the processed frame with drivable road and lane annotations.
    """
    if frame is None or frame.size == 0:
        return frame

    # 1. Convert frame to grayscale
    gray = to_grayscale(frame)

    # 2. Apply Gaussian blur
    blurred = apply_gaussian_blur(gray, kernel_size=5)

    # 3. Apply Canny edge detection
    edges = detect_edges(blurred, low_threshold=50, high_threshold=150)

    # 4 & 5. Apply ROI trapezoid mask
    masked_edges = get_region_of_interest(edges)

    # 6. Use HoughLinesP to detect lane lines
    lines = detect_hough_lines(masked_edges)

    # 7. Separate/estimate left and right lane lines
    left_line, right_line = separate_and_fit_lanes(lines, frame.shape)

    # 8. Draw drivable road area polygon overlay and solid lane lines on original frame
    output_frame = draw_lane_lines(frame, left_line, right_line)

    return output_frame


if __name__ == "__main__":
    # Self-test demo generating synthetic frame with road lanes
    print("[RoadSight AR] Running lane detection self-test with drivable road visualization...")
    test_img = np.zeros((480, 640, 3), dtype=np.uint8)

    # Draw synthetic white/yellow lane lines
    cv2.line(test_img, (50, 480), (280, 280), (255, 255, 255), 10)
    cv2.line(test_img, (590, 480), (360, 280), (0, 255, 255), 10)

    result = process_frame(test_img)
    print(f"[RoadSight AR] Self-test complete. Output shape: {result.shape}")
