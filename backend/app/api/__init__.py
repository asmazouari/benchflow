from .routes_collaborateurs import router as router_collaborateurs
from .routes_initiatives import router as router_initiatives
from .routes_auth import router as router_auth
from .routes_ai import router as router_ai

__all__ = ["router_collaborateurs", "router_initiatives", "router_auth", "router_ai"]
