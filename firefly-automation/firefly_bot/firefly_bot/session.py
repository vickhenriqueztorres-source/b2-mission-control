"""Verificação de sessão: detecta, pausa e nunca automatiza login."""

from __future__ import annotations

from patchright.async_api import TimeoutError as PatchrightTimeoutError

from .config import Config
from .selectors import SELECTORS, UnconfirmedSelectorError, locator_for
from .state_reader import StateReader


class SessionNotAuthenticatedError(RuntimeError):
    pass


class SessionManager:
    def __init__(
        self, page: object, state_reader: StateReader, config: Config | None = None
    ):
        self.page = page
        self.state_reader = state_reader
        self.config = config or Config()

    async def require_authenticated(self, job_id: int | None = None) -> None:
        url = self.page.url.lower()
        if any(token in url for token in ("/login", "/auth", "/signin")):
            raise SessionNotAuthenticatedError("sessão expirada ou tela de login detectada")
        if not SELECTORS["logged_in_marker"].confirmed:
            raise UnconfirmedSelectorError("logged_in_marker precisa ser confirmado manualmente")
        marker = locator_for(self.page, "logged_in_marker")
        try:
            await marker.wait_for(
                state="visible", timeout=self.config.selector_timeout_ms
            )
        except PatchrightTimeoutError as exc:
            raise SessionNotAuthenticatedError(
                "marcador de sessão autenticada não está visível"
            ) from exc
