"""Limpeza limitada a overlays não terminais, sempre após leitura de estado."""

from __future__ import annotations

import logging
import re

from patchright.async_api import Error as PatchrightError
from patchright.async_api import TimeoutError as PatchrightTimeoutError

from .human_input import HumanInput
from .logging_utils import event
from .selectors import SELECTORS, locator_for


async def _click_if_visible(locator: object, human_input: HumanInput, timeout: int) -> bool:
    if await locator.is_visible(timeout=timeout):
        await human_input.click(locator)
        return True
    return False


async def _dismiss_storage_warning(
    page: object, human_input: HumanInput, logger: logging.Logger, job_id: int
) -> bool:
    """Adobe pode bloquear a geração com um aviso não terminal de armazenamento."""
    try:
        title = page.get_by_text(
            re.compile(
                r"Espa[cç]o de armazenamento insuficiente|insufficient storage space",
                re.IGNORECASE,
            )
        )
        if not await title.is_visible(timeout=500):
            return False

        try:
            dont_show_again = page.get_by_text(
                re.compile(
                    r"N[aã]o mostrar esta mensagem novamente|do not show this message again",
                    re.IGNORECASE,
                )
            )
            await _click_if_visible(dont_show_again, human_input, 500)
        except (PatchrightTimeoutError, PatchrightError):
            pass

        continue_button = page.get_by_role(
            "button", name=re.compile(r"Continuar|Continue", re.IGNORECASE)
        )
        if await _click_if_visible(continue_button, human_input, 1500):
            event(logger, logging.INFO, "storage_warning_dismissed", job_id=job_id)
            if hasattr(page, "wait_for_timeout"):
                await page.wait_for_timeout(750)
            return True

        fallback = page.get_by_text(re.compile(r"Continuar|Continue", re.IGNORECASE))
        if await _click_if_visible(fallback, human_input, 1500):
            event(logger, logging.INFO, "storage_warning_dismissed", job_id=job_id)
            if hasattr(page, "wait_for_timeout"):
                await page.wait_for_timeout(750)
            return True
    except (PatchrightTimeoutError, PatchrightError) as exc:
        event(
            logger,
            logging.WARNING,
            "storage_warning_dismiss_failed",
            job_id=job_id,
            error=type(exc).__name__,
        )
    return False


async def dismiss_overlays(
    page: object, human_input: HumanInput, logger: logging.Logger, job_id: int
) -> None:
    """Overlay ausente é normal; erros são logados sem mascarar o fluxo principal."""
    if await _dismiss_storage_warning(page, human_input, logger, job_id):
        return

    if not SELECTORS["overlay_close_buttons"].confirmed:
        return
    try:
        locator = locator_for(page, "overlay_close_buttons")
        if await locator.is_visible(timeout=500):
            await human_input.click(locator)
            event(logger, logging.INFO, "overlay_dismissed", job_id=job_id)
    except (PatchrightTimeoutError, PatchrightError) as exc:
        event(
            logger,
            logging.WARNING,
            "overlay_dismiss_failed",
            job_id=job_id,
            error=type(exc).__name__,
        )
