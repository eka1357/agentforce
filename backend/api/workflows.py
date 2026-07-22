import uuid
import json
import asyncio
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.models.database import SessionLocal
from backend.models.workflow import Workflow, Run
from backend.orchestrator.executor import GraphExecutor, active_executors

@workflows_bp.route("/runs/history", methods=["GET"])
def get_run_history():
    db = SessionLocal()
    try:
        runs = db.query(Run).order_by(Run.started_at.desc()).limit(50).all()
        return jsonify([r.to_dict() for r in runs]), 200
    finally:
        db.close()

@workflows_bp.route("/runs/<run_id>", methods=["GET"])
def get_run_details(run_id):
    db = SessionLocal()
    try:
        run = db.query(Run).filter(Run.id == run_id).first()
        if not run:
            return jsonify({"error": "Run not found"}), 404
        return jsonify(run.to_dict()), 200
    finally:
        db.close()

@workflows_bp.route("/runs/<run_id>/resume", methods=["POST"])
def resume_human_node(run_id):
    data = request.get_json() or {}
    node_id = data.get("node_id")
    action = data.get("action", "approve")
    feedback = data.get("feedback", "")

    if not node_id:
        return jsonify({"error": "node_id is required"}), 400

    executor = active_executors.get(run_id)
    if not executor:
        return jsonify({"error": "Active executor for run_id not found"}), 444

    success = executor.resume_human_node(node_id, action, feedback)
    if not success:
        return jsonify({"error": "Node not in paused state or invalid node_id"}), 400

    return jsonify({"status": "resumed", "run_id": run_id, "node_id": node_id, "action": action}), 200

@workflows_bp.route("/<workflow_id>/run", methods=["POST"])
def run_workflow(workflow_id):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            # If unsaved in DB, use graph_json passed in body
            graph_json = data.get("graph_json") or {"nodes": [], "edges": []}
        else:
            graph_json = json.loads(workflow.graph_json) if workflow.graph_json else {"nodes": [], "edges": []}

        run_id = str(uuid.uuid4())
        run_record = Run(
            id=run_id,
            workflow_id=workflow_id if workflow else None,
            status="running"
        )
        db.add(run_record)
        db.commit()

        run_logs = []

        # Event callback to stream over WebSocket
        async def event_callback(event_type: str, payload: dict):
            run_logs.append({"type": event_type, "payload": payload, "time": datetime.utcnow().isoformat()})
            stream_manager.broadcast(run_id, event_type, payload)

        executor = GraphExecutor(graph_json, event_callback, run_id=run_id)

        def run_executor_bg():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(executor.execute())
            finally:
                db_bg = SessionLocal()
                r = db_bg.query(Run).filter(Run.id == run_id).first()
                if r:
                    failed = any(s == "error" for s in executor.node_states.values())
                    paused = any(s == "paused" for s in executor.node_states.values())
                    r.status = "failed" if failed else ("paused" if paused else "completed")
                    r.finished_at = datetime.utcnow()
                    r.outputs_json = json.dumps(executor.node_outputs)
                    r.logs_json = json.dumps(run_logs)
                    db_bg.commit()
                db_bg.close()
                if run_id in active_executors:
                    del active_executors[run_id]
                loop.close()

        import threading
        thread = threading.Thread(target=run_executor_bg, daemon=True)
        thread.start()

        return jsonify({
            "run_id": run_id,
            "status": "running",
            "message": "Workflow execution started"
        }), 202

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
from backend.orchestrator.stream import stream_manager

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

        graph_json_str = json.dumps(graph_json) if isinstance(graph_json, dict) else str(graph_json)

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

@workflows_bp.route("/<workflow_id>/run", methods=["POST"])
def run_workflow(workflow_id):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            # If unsaved in DB, use graph_json passed in body
            graph_json = data.get("graph_json") or {"nodes": [], "edges": []}
        else:
            graph_json = json.loads(workflow.graph_json) if workflow.graph_json else {"nodes": [], "edges": []}

        run_id = str(uuid.uuid4())
        run_record = Run(
            id=run_id,
            workflow_id=workflow_id if workflow else "temp",
            status="running"
        )
        db.add(run_record)
        db.commit()

        # Event callback to stream over WebSocket
        async def event_callback(event_type: str, payload: dict):
            stream_manager.broadcast(run_id, event_type, payload)

        executor = GraphExecutor(graph_json, event_callback)

        def run_executor_bg():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(executor.execute())
            finally:
                db_bg = SessionLocal()
                r = db_bg.query(Run).filter(Run.id == run_id).first()
                if r:
                    failed = any(s == "error" for s in executor.node_states.values())
                    r.status = "failed" if failed else "completed"
                    r.finished_at = datetime.utcnow()
                    db_bg.commit()
                db_bg.close()
                loop.close()

        import threading
        thread = threading.Thread(target=run_executor_bg, daemon=True)
        thread.start()

        return jsonify({
            "run_id": run_id,
            "status": "running",
            "message": "Workflow execution started"
        }), 202

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
