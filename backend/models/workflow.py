import json
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.models.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True, default="")
    graph_json = Column(Text, nullable=False, default="{\"nodes\":[],\"edges\":[]}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    runs = relationship("Run", back_populates="workflow", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "graph_json": json.loads(self.graph_json) if self.graph_json else {"nodes": [], "edges": []},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class Run(Base):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True)
    workflow_id = Column(String(36), ForeignKey("workflows.id"), nullable=True)
    status = Column(String(50), nullable=False, default="idle")  # idle, running, completed, failed, paused
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    outputs_json = Column(Text, nullable=True, default="{}")
    logs_json = Column(Text, nullable=True, default="[]")

    workflow = relationship("Workflow", back_populates="runs")

    def to_dict(self):
        return {
            "id": self.id,
            "workflow_id": self.workflow_id,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "outputs": json.loads(self.outputs_json) if self.outputs_json else {},
            "logs": json.loads(self.logs_json) if self.logs_json else [],
        }
