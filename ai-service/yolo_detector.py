"""
YOLO Object Detection Module for InspectAI

This module provides object detection capability using Ultralytics YOLOv8.

NOTE FOR INSPECTION PLATFORM:
This standard COCO-trained YOLO model (yolov8n.pt) serves as a development
detector. Generic COCO classes (person, chair, laptop, cell phone, tv, book, etc.)
are detected from actual visual pixels in uploaded images.
It is NOT specifically fine-tuned for college regulatory compliance (e.g.,
expired fire safety tags or barrier-free accessibility standards).
"""

import io
import uuid
import logging
from typing import List, Dict, Any, Optional
from PIL import Image

logger = logging.getLogger("yolo_detector")

# Global singleton YOLO model instance
_model_instance = None

def get_yolo_model():
    """
    Lazy singleton loader for the YOLO model.
    Loads 'yolov8n.pt' once upon initial call.
    """
    global _model_instance
    if _model_instance is None:
        try:
            logger.info("Loading YOLOv8 model (yolov8n.pt)...")
            from ultralytics import YOLO
            _model_instance = YOLO("yolov8n.pt")
            logger.info("YOLOv8 model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            _model_instance = None
    return _model_instance

def detect_objects_in_image(image_bytes: bytes, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
    """
    Performs real object detection on raw image bytes using YOLO.

    Returns a list of detection objects:
    [
      {
        "id": "...",
        "object_type": "person",
        "class_id": 0,
        "confidence": 0.91,
        "bbox": { "x1": 120, "y1": 80, "x2": 420, "y2": 500 }
      }
    ]
    """
    if not image_bytes:
        logger.warning("Empty image bytes provided to YOLO detector.")
        return []

    model = get_yolo_model()
    if model is None:
        logger.error("YOLO model instance unavailable.")
        return []

    try:
        # Load image from bytes using PIL
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to decode image bytes with PIL: {e}")
        return []

    try:
        # Run YOLO inference
        results = model(pil_image, conf=conf_threshold, verbose=False)
        
        detections: List[Dict[str, Any]] = []
        if not results or len(results) == 0:
            return detections

        result = results[0]
        boxes = result.boxes

        if boxes is None or len(boxes) == 0:
            return detections

        # Extract class names map
        names = result.names if hasattr(result, "names") else {}

        for box in boxes:
            # Coordinates in pixels: [x1, y1, x2, y2]
            xyxy = box.xyxy[0].tolist()
            conf = float(box.conf[0].item())
            cls_id = int(box.cls[0].item())
            class_name = names.get(cls_id, f"Class_{cls_id}")

            x1, y1, x2, y2 = xyxy

            detections.append({
                "id": str(uuid.uuid4()),
                "object_type": str(class_name),
                "class_id": cls_id,
                "confidence": round(conf, 4),
                "bbox": {
                    "x1": round(x1, 1),
                    "y1": round(y1, 1),
                    "x2": round(x2, 1),
                    "y2": round(y2, 1)
                }
            })

        logger.info(f"YOLO detected {len(detections)} objects in image.")
        return detections

    except Exception as e:
        logger.error(f"YOLO inference error: {e}")
        return []
