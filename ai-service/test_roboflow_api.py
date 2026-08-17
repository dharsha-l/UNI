import os
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
from roboflow_client import normalize_class_name, get_risk_category, normalize_roboflow_result

client = TestClient(app)

def test_class_name_normalization():
    assert normalize_class_name("Fire_Extinguisher") == "fire-extinguisher"
    assert normalize_class_name("Fire_Exit") == "fire-exit-sign"
    assert normalize_class_name("Fire_Blanket") == "fire-blanket"
    assert normalize_class_name("White_Domes") == "smoke-detector"
    assert normalize_class_name("Alarm_Activator") == "alarm-activator"
    assert normalize_class_name("camera") == "camera"
    assert normalize_class_name("Electrical_Hazard") == "electrical-hazard"
    assert normalize_class_name("Broken Glass") == "broken-glass"

def test_risk_category_mapping():
    assert get_risk_category("fire-extinguisher") == "fire-safety"
    assert get_risk_category("smoke-detector") == "fire-safety"
    assert get_risk_category("camera") == "security"
    assert get_risk_category("exposed-wire") == "electrical-safety"
    assert get_risk_category("blocked-exit") == "building-safety"

def test_normalize_roboflow_result_schema():
    raw_mock_output = [
        {
            "predictions": [
                {
                    "class": "Fire_Extinguisher",
                    "confidence": 0.93,
                    "x": 100.5,
                    "y": 80.2,
                    "width": 120.0,
                    "height": 240.0
                },
                {
                    "class": "camera",
                    "confidence": 0.88,
                    "x": 300.0,
                    "y": 150.0,
                    "width": 50.0,
                    "height": 50.0
                }
            ]
        }
    ]

    normalized = normalize_roboflow_result(raw_mock_output, "test_room.jpg")

    assert normalized["success"] is True
    assert normalized["filename"] == "test_room.jpg"
    assert normalized["model"] == "roboflow-rf-detr-medium"
    assert len(normalized["detections"]) == 2
    assert normalized["detections"][0]["class"] == "fire-extinguisher"
    assert normalized["detections"][0]["confidence"] == 0.93
    assert normalized["detections"][1]["class"] == "camera"

    summary = normalized["summary"]
    assert summary["total_detections"] == 2
    assert summary["classes_found"] == ["camera", "fire-extinguisher"]
    assert summary["highest_confidence"] == 0.93
    assert summary["risk_categories"] == ["fire-safety", "security"]

def test_analyze_image_missing_key_returns_503():
    with patch.dict(os.environ, {"ROBOFLOW_API_KEY": ""}, clear=False):
        files = {"image": ("test.jpg", b"fake image bytes", "image/jpeg")}
        response = client.post("/api/v1/ai/images/analyze", files=files)

        assert response.status_code == 503
        data = response.json()
        assert data["success"] is False
        assert data["error_code"] == "ROBOFLOW_NOT_CONFIGURED"
        assert "message" in data
        assert "ROBOFLOW_API_KEY" not in str(data)

def test_analyze_image_unsupported_file_type_returns_400():
    with patch.dict(os.environ, {"ROBOFLOW_API_KEY": "fake_test_key_xyz"}, clear=False):
        files = {"image": ("test.txt", b"plain text content", "text/plain")}
        response = client.post("/api/v1/ai/images/analyze", files=files)

        assert response.status_code == 400
        assert "Unsupported file type" in response.json()["detail"]

def test_analyze_image_success_mocked_workflow():
    mock_workflow_result = {
        "success": True,
        "filename": "sample.jpg",
        "model": "roboflow-rf-detr-medium",
        "detections": [
            {
                "class": "fire-extinguisher",
                "confidence": 0.95,
                "bbox": {"x": 50.0, "y": 50.0, "width": 100.0, "height": 200.0}
            }
        ],
        "summary": {
            "total_detections": 1,
            "classes_found": ["fire-extinguisher"],
            "highest_confidence": 0.95,
            "risk_categories": ["fire-safety"]
        },
        "raw_result": None
    }

    with patch.dict(os.environ, {"ROBOFLOW_API_KEY": "fake_key_12345"}, clear=False):
        with patch("main.run_roboflow_workflow", return_value=mock_workflow_result) as mock_run:
            files = {"image": ("sample.jpg", b"\xff\xd8\xff\xe0fakejpegbytes", "image/jpeg")}
            response = client.post("/api/v1/ai/images/analyze", files=files)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["model"] == "roboflow-rf-detr-medium"
            assert len(data["detections"]) == 1
            assert data["detections"][0]["class"] == "fire-extinguisher"

            # Confirm API key is never exposed in response
            assert "fake_key_12345" not in str(data)
            assert "api_key" not in data

            # Confirm mock received temporary file path
            assert mock_run.called
            temp_path = mock_run.call_args[0][0]
            # Temporary file should be deleted by main.py finally block
            assert not os.path.exists(temp_path)
