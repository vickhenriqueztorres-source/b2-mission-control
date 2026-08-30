import React from 'react';
import * as DocumentaryComponents from '../documentary';

/**
 * 📦 SceneRegistry: Dicionário Dinâmico de Componentes de Cena
 * Mapeia os nomes declarados no timelineContract para os componentes
 * reais do Remotion sem necessidade de JSX manual por episódio.
 */
export const SCENE_COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Mídia Dinâmica e B-Roll
  DynamicDocumentaryMedia: DocumentaryComponents.DynamicDocumentaryMedia,
  CinematicKeyframeDossier: DocumentaryComponents.CinematicKeyframeDossier,
  KenBurnsCinematicFrame: DocumentaryComponents.KenBurnsCinematicFrame,

  // HUDs e Dossiês Técnicos Industriais
  FlowMeterPulserSchematicHUD: DocumentaryComponents.FlowMeterPulserSchematicHUD,
  TechnicalCutawaySchematic: DocumentaryComponents.TechnicalCutawaySchematic,
  FlowDiscrepancyHUD: DocumentaryComponents.FlowDiscrepancyHUD,
  Iso20022PacketInspector: DocumentaryComponents.Iso20022PacketInspector,
  OnScreenResearchLapse: DocumentaryComponents.OnScreenResearchLapse,
  LaserRevealWipe: DocumentaryComponents.LaserRevealWipe,
  InfraredPlateScanner3D: DocumentaryComponents.InfraredPlateScanner3D,
  LaserScanDossier: DocumentaryComponents.LaserScanDossier,
  IndustrialXRayHUD: DocumentaryComponents.IndustrialXRayHUD,
  AtomicStopwatch: DocumentaryComponents.AtomicStopwatch,
  KineticEditorialCallout: DocumentaryComponents.KineticEditorialCallout,
  KineticNumberCounter: DocumentaryComponents.KineticNumberCounter,

  // 3D e Modelos Físicos
  SubmarineCableCrossSection3D: DocumentaryComponents.SubmarineCableCrossSection3D,
  AtlanticBathymetryMap: DocumentaryComponents.AtlanticBathymetryMap,
  ErbiumOpticalAmplifier: DocumentaryComponents.ErbiumOpticalAmplifier,
  BgpFailoverInspector: DocumentaryComponents.BgpFailoverInspector,
  InductionLoopCrossSection3D: DocumentaryComponents.InductionLoopCrossSection3D,
  VelocityPhysicsCalculationHUD: DocumentaryComponents.VelocityPhysicsCalculationHUD,
  AsphaltThermalDeformation3D: DocumentaryComponents.AsphaltThermalDeformation3D,
  ParallaxRackFocus: DocumentaryComponents.ParallaxRackFocus,
  CyberMapTrace: DocumentaryComponents.CyberMapTrace,
  SmartphoneBankingMockup: DocumentaryComponents.SmartphoneBankingMockup,
  VlfSubmarineAntennaTrace: DocumentaryComponents.VlfSubmarineAntennaTrace,
  DocumentaryTextTyper: DocumentaryComponents.DocumentaryTextTyper
};

export function resolveSceneComponent(componentName: string): React.ComponentType<any> {
  const comp = SCENE_COMPONENT_REGISTRY[componentName];
  if (comp) {
    return comp;
  }

  // Fallback seguro para Mídia Documental Dinâmica
  return DocumentaryComponents.DynamicDocumentaryMedia;
}
