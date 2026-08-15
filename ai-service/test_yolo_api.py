import io
from PIL import Image, ImageDraw
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
    response = client.post(
        "/api/v1/ai/images/analyze",
        data={"image_id": "img-test-101", "filename": "sample_photo.jpg", "category": "Laboratory"},
        files={"file": ("sample_photo.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    json_data = response.json()
    assert json_data.get("success") is True
    assert json_data.get("image_id") == "img-test-101"
    assert json_data.get("filename") == "sample_photo.jpg"
    assert json_data.get("category") == "Laboratory"
    assert "detections_count" in json_data
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
