import pytest
from backend.app import app
from backend.models.database import Base, engine

@pytest.fixture
def client():
  Base.metadata.create_all(bind=engine)
  app.config['TESTING'] = True
  with app.test_client() as client:
    yield client

def test_workflow_crud(client):
  # Create workflow
  payload = {
    "name": "Test Pipeline",
    "description": "Integration testing workflow",
    "graph_json": {"nodes": [], "edges": []}
  }
  res = client.post('/api/workflows', json=payload)
  assert res.status_code == 201
  wf = res.get_json()
  assert wf['name'] == "Test Pipeline"
  wf_id = wf['id']

  # Fetch workflow
  res_get = client.get(f'/api/workflows/{wf_id}')
  assert res_get.status_code == 200
  assert res_get.get_json()['id'] == wf_id

  # Delete workflow
  res_del = client.delete(f'/api/workflows/{wf_id}')
  assert res_del.status_code == 200
