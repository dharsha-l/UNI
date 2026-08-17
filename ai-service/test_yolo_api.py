import io
import os
from PIL import Image, ImageDraw
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def create_sample_jpeg():
    """Creates a sample JPEG image with a simple shape."""
    img = Image.new("RGB", (400, 400), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 300, 300], fill=(0, 128, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_analyze_image_with_file():
    img_bytes = create_sample_jpeg()
    mock_result = {
        "success": True,
        "filename": "sample_photo.jpg",
        "model": "roboflow-rf-detr-medium",
        "detections": [
            {
                "class": "fire-extinguisher",
                "confidence": 0.94,
                "bbox": {"x": 100.0, "y": 80.0, "width": 120.0, "height": 240.0}
            }
        ],
        "summary": {
            "total_detections": 1,
            "classes_found": ["fire-extinguisher"],
            "highest_confidence": 0.94,
            "risk_categories": ["fire-safety"]
        },
        "raw_result": None
    }

    with patch.dict(os.environ, {"ROBOFLOW_API_KEY": "fake_key_12345"}, clear=False):
        with patch("main.run_roboflow_workflow", return_value=mock_result):
            response = client.post(
                "/api/v1/ai/images/analyze",
                data={"image_id": "img-test-101", "filename": "sample_photo.jpg", "category": "Laboratory"},
                files={"file": ("sample_photo.jpg", img_bytes, "image/jpeg")}
            )
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            json_data = response.json()
            assert json_data.get("success") is True
            assert json_data.get("filename") == "sample_photo.jpg"
            assert "detections" in json_data
            assert isinstance(json_data["detections"], list)

def test_analyze_image_missing_file():
    response = client.post(
        "/api/v1/ai/images/analyze",
        data={"image_id": "img-test-102", "filename": "test.jpg", "category": "General"}
    )
    assert response.status_code == 400, f"Expected 400 when file missing, got {response.status_code}"

if __name__ == "__main__":
    print("Testing FastAPI analyze_image with real uploaded file...")
    test_analyze_image_with_file()
    print("✓ analyze_image with file passed!")

    print("Testing FastAPI analyze_image with missing file...")
    test_analyze_image_missing_file()
    print("✓ analyze_image missing file validation passed!")
