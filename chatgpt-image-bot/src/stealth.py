"""
Módulo de Blindagem e Anti-Detecção de Alta Segurança (Stealth Level 10).
Remove todas as assinaturas de automação para permitir login normal no Google/OpenAI sem bloqueios.
"""

from playwright.sync_api import BrowserContext, Page
from playwright_stealth import Stealth

# Script JavaScript avançado de evasão profunda
ADVANCED_STEALTH_JS = """
// 1. Elimina navigator.webdriver
(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        configurable: true
    });
})();

// 2. Emula objeto window.chrome completo e realista
(() => {
    if (!window.chrome) {
        window.chrome = {};
    }
    window.chrome.app = {
        isInstalled: false,
        InstallState: { DISABLED: 'DISABLED', INSTALLED: 'INSTALLED', NOT_INSTALLED: 'NOT_INSTALLED' },
        RunningState: { CANNOT_RUN: 'CANNOT_RUN', READY_TO_RUN: 'READY_TO_RUN', RUNNING: 'RUNNING' },
        getDetails: function() {},
        getIsInstalled: function() {},
        installState: function() {},
        runningState: function() {}
    };
    window.chrome.csi = function() {
        return {
            onloadT: Date.now(),
            startE: Date.now() - 100,
            pageT: 100,
            tran: 15
        };
    };
    window.chrome.loadTimes = function() {
        return {
            commitLoadTime: Date.now() / 1000,
            connectionInfo: 'h2',
            finishDocumentLoadTime: Date.now() / 1000,
            finishLoadTime: Date.now() / 1000,
            firstPaintAfterLoadTime: 0,
            firstPaintTime: Date.now() / 1000,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'h2',
            requestTime: (Date.now() - 200) / 1000,
            startLoadTime: (Date.now() - 300) / 1000,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: true,
            wasNpnNegotiated: true
        };
    };
    window.chrome.runtime = {
        OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
        OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
        PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
        RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' },
        connect: function() {},
        sendMessage: function() {}
    };
})();

// 3. Emula plugins e mimeTypes oficiais do Chrome desktop
(() => {
    function makePlugin(name, filename, description) {
        return {
            name: name,
            filename: filename,
            description: description,
            length: 1,
            item: function(i) { return this[i]; },
            namedItem: function(n) { return this[n]; },
            0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: null
            }
        };
    }

    const pdfViewer = makePlugin('PDF Viewer', 'internal-pdf-viewer', 'Portable Document Format');
    const chromePdfViewer = makePlugin('Chrome PDF Viewer', 'internal-pdf-viewer', 'Portable Document Format');
    const chromiumPdfViewer = makePlugin('Chromium PDF Viewer', 'internal-pdf-viewer', 'Portable Document Format');

    const fakePlugins = [pdfViewer, chromePdfViewer, chromiumPdfViewer];
    fakePlugins.item = function(i) { return this[i]; };
    fakePlugins.namedItem = function(n) { return this[n]; };

    Object.defineProperty(navigator, 'plugins', {
        get: () => fakePlugins,
        configurable: true
    });
})();

// 4. Emula idiomas e plataforma brasileira / internacional
(() => {
    Object.defineProperty(navigator, 'languages', {
        get: () => ['pt-BR', 'pt', 'en-US', 'en'],
        configurable: true
    });
    Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
        configurable: true
    });
    Object.defineProperty(navigator, 'vendor', {
        get: () => 'Google Inc.',
        configurable: true
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
        configurable: true
    });
    Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
        configurable: true
    });
})();

// 5. Normaliza a API de permissões (Notification prompt normal)
(() => {
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => {
        if (parameters && parameters.name === 'notifications') {
            return Promise.resolve({
                state: Notification.permission,
                name: 'notifications',
                onchange: null,
                addEventListener: function() {},
                removeEventListener: function() {},
                dispatchEvent: function() { return true; }
            });
        }
        return originalQuery ? originalQuery(parameters) : Promise.resolve({ state: 'prompt' });
    };
})();

// 6. Mascara WebGL para placa de vídeo real em vez de emulador
(() => {
    const getParameterProxyHandler = {
        apply: function(target, ctx, args) {
            const param = args[0];
            // UNMASKED_VENDOR_WEBGL
            if (param === 37445) {
                return 'Google Inc. (NVIDIA)';
            }
            // UNMASKED_RENDERER_WEBGL
            if (param === 37446) {
                return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
            }
            return Reflect.apply(target, ctx, args);
        }
    };

    const addWebGLProxy = (proto) => {
        if (proto && proto.getParameter) {
            proto.getParameter = new Proxy(proto.getParameter, getParameterProxyHandler);
        }
    };

    addWebGLProxy(window.WebGLRenderingContext ? window.WebGLRenderingContext.prototype : null);
    addWebGLProxy(window.WebGL2RenderingContext ? window.WebGL2RenderingContext.prototype : null);
})();
"""


def apply_full_stealth(context: BrowserContext, page: Page) -> None:
    """
    Aplica blindagem de segurança e anti-detecção completa:
    1. Injeção antecipada em todas as páginas e iframes via context.add_init_script.
    2. Aplicação do playwright-stealth.
    3. Mascaramento de propriedades sensíveis.
    """
    # 1. Injeta script no contexto para execução antes de qualquer script da página
    context.add_init_script(ADVANCED_STEALTH_JS)

    # 2. Injeta diretamente na página atual
    try:
        page.add_init_script(ADVANCED_STEALTH_JS)
    except Exception:
        pass

    # 3. Aplica biblioteca playwright-stealth
    try:
        Stealth().apply_stealth_sync(page)
    except Exception as e:
        print(f"⚠️ Aviso ao aplicar playwright-stealth: {e}")
