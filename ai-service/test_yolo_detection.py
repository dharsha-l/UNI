import io
import pytest
from PIL import Image, ImageDraw
from yolo_detector import detect_objects_in_image, get_yolo_model

def create_sample_image_bytes():
    """Creates a simple synthetic RGB image in memory."""
    img = Image.new("RGB", (300, 300), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    # Draw a blue rectangle
    draw.rectangle([50, 50, 200, 200], fill=(0, 0, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_yolo_model_loading():
    model = get_yolo_model()
    assert model is not None, "YOLO model failed to load"

def test_detect_objects_empty_bytes():
    detections = detect_objects_in_image(b"")
    assert detections == [], "Empty bytes should return empty list"

def test_detect_objects_sample_image():
    img_bytes = create_sample_image_bytes()
    detections = detect_objects_in_image(img_bytes)
    assert isinstance(detections, list), "Detections should be a list"

if __name__ == "__main__":
    print("Testing YOLO Model Loading...")
    test_yolo_model_loading()
    print("✓ Model load successful.")

    print("Testing Sample Image Object Detection...")
    img_bytes = create_sample_image_bytes()
    dets = detect_objects_in_image(img_bytes)
    print(f"✓ Detection ran successfully. Detections returned: {len(dets)}")
