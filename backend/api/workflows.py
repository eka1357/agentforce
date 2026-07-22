import uuid
import json
from flask import Blueprint, request, jsonify
from backend.models.database import SessionLocal
from backend.models.workflow import Workflow

workflows_bp = Blueprint("workflows", __name__, url_prefix="/api/workflows")

@workflows_bp.route("", methods=["GET"])
def get_workflows():
    db = SessionLocal()
    try:
        workflows = db.query(Workflow).order_by(Workflow.updated_at.desc()).all()
        return jsonify([w.to_dict() for w in workflows]), 200
    finally:
        db.close()

@workflows_bp.route("/<workflow_id>", methods=["GET"])
def get_workflow(workflow_id):
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        return jsonify(workflow.to_dict()), 200
    finally:
        db.close()

@workflows_bp.route("", methods=["POST"])
def create_workflow():
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        workflow_id = data.get("id") or str(uuid.uuid4())
        name = data.get("name", "Untitled Workflow")
        description = data.get("description", "")
        graph_json = data.get("graph_json") or {"nodes": [], "edges": []}

        if isinstance(graph_json, dict):
            graph_json_str = json.dumps(graph_json)
        else:
            graph_json_str = str(graph_json)

        workflow = Workflow(
            id=workflow_id,
            name=name,
            description=description,
            graph_json=graph_json_str
        )
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return jsonify(workflow.to_dict()), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@workflows_bp.route("/<workflow_id>", methods=["PUT"])
def update_workflow(workflow_id):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            # Create if not exists
            name = data.get("name", "Untitled Workflow")
            description = data.get("description", "")
            graph_json = data.get("graph_json") or {"nodes": [], "edges": []}
            workflow = Workflow(
                id=workflow_id,
                name=name,
                description=description,
                graph_json=json.dumps(graph_json) if isinstance(graph_json, dict) else str(graph_json)
            )
            db.add(workflow)
        else:
            if "name" in data:
                workflow.name = data["name"]
            if "description" in data:
                workflow.description = data["description"]
            if "graph_json" in data:
                graph_json = data["graph_json"]
                workflow.graph_json = json.dumps(graph_json) if isinstance(graph_json, dict) else str(graph_json)

        db.commit()
        db.refresh(workflow)
        return jsonify(workflow.to_dict()), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@workflows_bp.route("/<workflow_id>", methods=["DELETE"])
def delete_workflow(workflow_id):
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        db.delete(workflow)
        db.commit()
        return jsonify({"message": "Workflow deleted successfully"}), 200
    finally:
        db.close()
