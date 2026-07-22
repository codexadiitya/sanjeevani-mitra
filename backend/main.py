"""Main entrypoint for Sanjeevani Mitra backend application."""
try:
    from server import app
except ImportError:
    from .server import app

__all__ = ["app"]
