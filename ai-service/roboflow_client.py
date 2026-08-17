import os
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Predefined class name normalizations
CLASS_NAME_MAP = {
    "Fire_Extinguisher": "fire-extinguisher",
    "Fire_Exit": "fire-exit-sign",
    "Fire_Blanket": "fire-blanket",
    "White_Domes": "smoke-detector",
    "Alarm_Activator": "alarm-activator",
    "camera": "camera"
}

# Category mappings for safety risk assessment
CATEGORY_MAP = {
    "fire-extinguisher": "fire-safety",
    "fire-blanket": "fire-safety",
    "fire-exit-sign": "fire-safety",
    "fire-suppression-signage": "fire-safety",
    "alarm-activator": "fire-safety",
    "sounders": "fire-safety",
    "flashing-light-orbs": "fire-safety",
    "smoke-detector": "fire-safety",
    "camera": "security",
    "electrical-hazard": "electrical-safety",
    "exposed-wire": "electrical-safety",
    "loose-cable": "electrical-safety",
    "open-electrical-door": "electrical-safety",
    "blocked-exit": "building-safety",
    "broken-glass": "building-safety",
    "debris-on-floor": "building-safety",
    "open-trench": "building-safety",
    "trip-hazard": "building-safety",
    "uneven-surface": "building-safety",
    "wet-floor": "building-safety"
}

_client_instance = None

def get_roboflow_client():
    """
    Returns a module-level singleton instance of InferenceHTTPClient.
    Creates the instance only when ROBOFLOW_API_KEY is configured.
    """
    global _client_instance
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key or not api_key.strip():
        return None

    if _client_instance is None:
        try:
            from inference_sdk import InferenceHTTPClient
            api_url = os.getenv("ROBOFLOW_API_URL", "https://serverless.roboflow.com")
            _client_instance = InferenceHTTPClient(
                api_url=api_url,
                api_key=api_key.strip()
            )
        except Exception as e:
            logger.error(f"Failed to initialize InferenceHTTPClient: {type(e).__name__}")
            return None

    return _client_instance

def normalize_class_name(class_name: str) -> str:
    """
    Normalize class names to lowercase kebab-case.
    Applies explicit overrides where required and replaces spaces/underscores with hyphens.
    """
    if not class_name:
        return "unknown"
    
    name_str = str(class_name).strip()
    if name_str in CLASS_NAME_MAP:
        return CLASS_NAME_MAP[name_str]
    
    return name_str.lower().replace("_", "-").replace(" ", "-")

def get_risk_category(normalized_class: str) -> str:
    """
    Maps normalized class names to standard safety risk categories.
    """
    return CATEGORY_MAP.get(normalized_class, "general-safety")

def extract_predictions_from_raw(raw_data: Any) -> List[Dict[str, Any]]:
    """
    Safely traverses Roboflow workflow output structures to extract prediction items.
    """
    extracted = []
    if not raw_data:
        return extracted

    if isinstance(raw_data, list):
        for item in raw_data:
            extracted.extend(extract_predictions_from_raw(item))
    elif isinstance(raw_data, dict):
        # Check if current dict is a prediction item
        if any(k in raw_data for k in ("class", "class_name", "label", "predictions")):
            if "predictions" in raw_data and isinstance(raw_data["predictions"], (list, dict)):
                extracted.extend(extract_predictions_from_raw(raw_data["predictions"]))
            else:
                extracted.append(raw_data)
        else:
            # Recursively check dictionary values (e.g. output nodes like {"output": [...]})
            for val in raw_data.values():
                if isinstance(val, (dict, list)):
                    extracted.extend(extract_predictions_from_raw(val))
                    
    return extracted

from PIL import Image

def get_image_dimensions(image_path: str) -> tuple:
    try:
        with Image.open(image_path) as img:
            return float(img.width), float(img.height)
    except Exception:
        return 640.0, 480.0

def normalize_roboflow_result(raw_result: Any, filename: str, image_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Normalizes raw Roboflow workflow outputs into a stable response schema with percentage bounding boxes.
    """
    raw_predictions = extract_predictions_from_raw(raw_result)
    detections = []
    classes_found_set = set()
    risk_categories_set = set()
    highest_conf = 0.0
    img_w, img_h = get_image_dimensions(image_path) if image_path else (640.0, 480.0)

    for pred in raw_predictions:
        if not isinstance(pred, dict):
            continue
            
        raw_cls = pred.get("class") or pred.get("class_name") or pred.get("label") or "unknown"
        norm_cls = normalize_class_name(str(raw_cls))
        
        conf_val = pred.get("confidence") or pred.get("confidence_score") or pred.get("score") or pred.get("probability") or 0.0
        try:
            conf = float(conf_val)
        except (ValueError, TypeError):
            conf = 0.0
            
        if conf > highest_conf:
            highest_conf = conf

        # Safely convert Roboflow coordinates to top-left percentages
        raw_w = float(pred.get("width") or (float(pred.get("x_max", 0)) - float(pred.get("x_min", 0))) or 100.0)
        raw_h = float(pred.get("height") or (float(pred.get("y_max", 0)) - float(pred.get("y_min", 0))) or 100.0)

        if "x_min" in pred:
            x_min = float(pred.get("x_min", 0))
            y_min = float(pred.get("y_min", 0))
        else:
            x_center = float(pred.get("x", raw_w / 2.0))
            y_center = float(pred.get("y", raw_h / 2.0))
            x_min = x_center - (raw_w / 2.0)
            y_min = y_center - (raw_h / 2.0)

        left_pct = max(0.0, min(95.0, (x_min / img_w) * 100.0)) if img_w > 0 else 10.0
        top_pct = max(0.0, min(95.0, (y_min / img_h) * 100.0)) if img_h > 0 else 10.0
        width_pct = max(2.0, min(100.0, (raw_w / img_w) * 100.0)) if img_w > 0 else 30.0
        height_pct = max(2.0, min(100.0, (raw_h / img_h) * 100.0)) if img_h > 0 else 25.0

        risk_cat = get_risk_category(norm_cls)
        classes_found_set.add(norm_cls)
        risk_categories_set.add(risk_cat)

        detections.append({
            "class": norm_cls,
            "confidence": round(conf, 2),
            "bbox": {
                "x": round(left_pct, 1),
                "y": round(top_pct, 1),
                "width": round(width_pct, 1),
                "height": round(height_pct, 1)
            }
        })

    is_debug = os.getenv("ROBOFLOW_DEBUG", "false").lower() in ("true", "1")

    return {
        "success": True,
        "filename": filename,
        "model": "roboflow-rf-detr-medium",
        "detections": detections,
        "summary": {
            "total_detections": len(detections),
            "classes_found": sorted(list(classes_found_set)),
            "highest_confidence": round(highest_conf, 2),
            "risk_categories": sorted(list(risk_categories_set))
        },
        "raw_result": raw_result if is_debug else None
    }

def run_roboflow_workflow(image_path: str, filename: str = "uploaded.jpg") -> Dict[str, Any]:
    """
    Executes Roboflow hosted Workflow inference on an image file path.
    """
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key or not api_key.strip():
        return {
            "success": False,
            "error_code": "ROBOFLOW_NOT_CONFIGURED",
            "message": "Roboflow inference is not configured on this server."
        }

    if not os.path.exists(image_path):
        return {
            "success": False,
            "error_code": "FILE_NOT_FOUND",
            "message": "Image file does not exist."
        }

    client = get_roboflow_client()
    if not client:
        return {
            "success": False,
            "error_code": "ROBOFLOW_NOT_CONFIGURED",
            "message": "Roboflow inference client could not be initialized."
        }

    workspace = os.getenv("ROBOFLOW_WORKSPACE", "civicissue-irb9x")
    workflow_id = os.getenv("ROBOFLOW_WORKFLOW_ID", "uni2-vuni2-l8vuj-1-rfdetr-medium-t1-logic")

    try:
        raw_result = client.run_workflow(
            workspace_name=workspace,
            workflow_id=workflow_id,
            images={"image": image_path},
            use_cache=False
        )
        return normalize_roboflow_result(raw_result, filename)
    except Exception as e:
        logger.error(f"Roboflow workflow execution failed: {type(e).__name__}")
        return {
            "success": False,
            "error_code": "ROBOFLOW_ERROR",
            "message": "Workflow inference execution failed."
        }
