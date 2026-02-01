import yaml
from pathlib import Path

_config_path = Path(__file__).parent / "spaces.yaml"

with open(_config_path) as f:
    _config = yaml.safe_load(f)

all_spaces = _config["spaces"]
