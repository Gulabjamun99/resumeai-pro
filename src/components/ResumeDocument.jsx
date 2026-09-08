import React from 'react';
import SourceTemplate from './templates/SourceTemplate';
import DualColumnTemplate from './templates/DualColumnTemplate';
import SingleColumnTemplate from './templates/SingleColumnTemplate';
import ModernMinimalTemplate from './templates/ModernMinimalTemplate';
import TechDeveloperTemplate from './templates/TechDeveloperTemplate';
import CreativeStartupTemplate from './templates/CreativeStartupTemplate';
import AcademicMedicalTemplate from './templates/AcademicMedicalTemplate';
import SlateEliteTemplate from './templates/SlateEliteTemplate';
import NordicSharpTemplate from './templates/NordicSharpTemplate';
import IndigoProTemplate from './templates/IndigoProTemplate';
import CompactOnePageTemplate from './templates/CompactOnePageTemplate';
import ExecutiveCharterTemplate from './templates/ExecutiveCharterTemplate';
import HybridPortfolioTemplate from './templates/HybridPortfolioTemplate';
import ModernChronologicalTemplate from './templates/ModernChronologicalTemplate';

import DesignerTwoColumnTemplate from './templates/DesignerTwoColumnTemplate';

/**
 * RESUME DOCUMENT RENDERER (36-TEMPLATE ATS & SOURCE REPLICA ROUTER)
 * Declaratively delegates rendering to the active template while consuming
 * the identical, unmutated candidate data object with dynamic theme support.
 */
export default function ResumeDocument({ 
  resume, 
  id = "resume-document", 
  templateId = "source-template", 
  isEditable = false, 
  onUpdateResume,
  theme = null
}) {
  if (!resume) return null;

  switch (templateId) {
    // 0. Designer Dual-Column & Modern Designed Series
    case 'designer-dual':
    case 'designer-sidebar-pro':
    case 'modern-sidebar-pro':
    case 'creative-designer':
    case 'aurora-executive':
      return <DesignerTwoColumnTemplate resume={resume} id={id} theme={theme} />;

    // 1. Exact Source Replica
    case 'source-template':
      return <SourceTemplate resume={resume} id={id} theme={theme} />;

    // 2. Tech, AI & Developer Series
    case 'tech-developer':
    case 'terminal-dev':
    case 'cloud-architect':
    case 'stellar-ai':
    case 'quantum-code':
      return <TechDeveloperTemplate resume={resume} id={id} theme={theme} />;

    case 'hybrid-portfolio':
    case 'product-lead':
      return <HybridPortfolioTemplate resume={resume} id={id} theme={theme} />;

    // 3. Creative & Growth Series
    case 'creative-startup':
    case 'growth-marketer':
    case 'aurora-modern':
      return <CreativeStartupTemplate resume={resume} id={id} theme={theme} />;

    // 4. Academic, Medical & Research Series
    case 'academic-medical':
    case 'phd-fellowship':
      return <AcademicMedicalTemplate resume={resume} id={id} theme={theme} />;

    // 5. Executive & Leadership Series
    case 'slate-elite':
    case 'fortune-csuite':
      return <SlateEliteTemplate resume={resume} id={id} theme={theme} />;

    case 'executive-charter':
    case 'pinnacle-global':
      return <ExecutiveCharterTemplate resume={resume} id={id} theme={theme} />;

    case 'single-column':
    case 'wall-street-quant':
    case 'legal-counsel':
    case 'monolith-pro':
      return <SingleColumnTemplate resume={resume} id={id} theme={theme} />;

    // 6. Modern Minimalist Series
    case 'nordic-sharp':
    case 'zenith-light':
      return <NordicSharpTemplate resume={resume} id={id} theme={theme} />;

    case 'modern-minimal':
    case 'metro-clean':
      return <ModernMinimalTemplate resume={resume} id={id} theme={theme} />;

    case 'compact-one-page':
    case 'apex-compact':
      return <CompactOnePageTemplate resume={resume} id={id} theme={theme} />;

    // 7. Dual-Column & Sidebar Series
    case 'indigo-pro':
    case 'amethyst-split':
    case 'horizon-blue':
      return <IndigoProTemplate resume={resume} id={id} theme={theme} />;

    case 'dual-column':
    case 'emerald-compact':
      // If user is explicitly customizing theme, DesignerTwoColumnTemplate gives superior dynamic rendering
      return theme ? <DesignerTwoColumnTemplate resume={resume} id={id} theme={theme} /> : <DualColumnTemplate resume={resume} id={id} />;

    // 8. Chronological & Consulting Series
    case 'modern-chronological':
    case 'mckinsey-consultant':
    case 'vanguard-slate':
    case 'signature-prime':
      return <ModernChronologicalTemplate resume={resume} id={id} theme={theme} />;

    default:
      return <SourceTemplate resume={resume} id={id} theme={theme} />;
  }
}
