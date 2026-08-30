# 🔍 AUDITORIA DE TIPOGRAFIA & HIERARQUIA DE HUDs

> **Data da Auditoria:** 2026-08-30  
> **Direção:** Dossiê do Sistema 3.0 // O Outro Lado  
> **Módulo Canônico:** `remotion/cinema/typography.ts`

---

## 1. Tokens de Tipografia Oficiais (`remotion/cinema/typography.ts`)

| Token | Família / Preset | Aplicação Obrigatória |
|---|---|---|
| `DOSSIER_MAIN_TITLE` | `Bebas Neue` / `Druk Wide` (28px Black) | Título principal de dossiê industrial |
| `SECTION_HEADER` | `Inter` / `Helvetica Neue` (20px Bold) | Subtítulo e capítulos documentais |
| `TELEMETRY_HEADER` | `JetBrains Mono` / `Fira Code` (13px Bold `#00F0FF`) | Identificador de nó e coordenadas GPS |
| `TELEMETRY_VALUE` | `JetBrains Mono` (11px Regular `#8A8D9F`) | Leituras de pulso, telemetria contínua |
| `CRITICAL_ALERT` | `JetBrains Mono` (13px Bold `#FF5500`) | Alertas de violação, anomalia, status crítico |

---

## 2. Diagnóstico dos Componentes Existentes em `remotion/documentary/`

| Componente | Estado Atual | Plano de Migração Futura |
|---|---|---|
| `Iso20022PacketInspector` | Fontes inline monospace locais | Migrar para `CINEMATIC_TYPOGRAPHY.FONTS.TELEMETRY` |
| `FlowMeterPulserSchematicHUD` | Fontes inline monospace com `#00F0FF` | Consistente; adotar `TELEMETRY_HEADER` |
| `FlowDiscrepancyHUD` | Destaques pontuais em `#FF5500` | 100% aderente à regra de 2 camadas |
| `KineticEditorialCallout` | Variantes manuais de `position` | Padronizado via `TimelineCalloutSchema` |
| `AtomicStopwatch` | Monospace canônico no topo central | 100% conforme safe-zone (Top Center) |
| `InfraredPlateScanner3D` | Textos em caixa alta com retículas | Conforme paleta Denis Villeneuve |

---

## 3. Diretriz de Preservação
Conforme **Restrição Global 1**, os componentes existentes em `remotion/documentary/` não foram modificados artesanalmente para assegurar reprodução byte-idêntica dos episódios legados. Novos componentes ou refatores futuros devem importar exclusivamente de `remotion/cinema/typography.ts`.
