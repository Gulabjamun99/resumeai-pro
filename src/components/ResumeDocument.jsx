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

/**
 * RESUME DOCUMENT RENDERER (14-TEMPLATE ATS & SOURCE REPLICA ENGINE)
 * Declaratively delegates rendering to the active template while consuming
 * the identical, unmutated candidate data object.
 */
export default function ResumeDocument({ 
  resume, 
  id = "resume-document", 
  templateId = "source-template", 
  isEditable = false, 
  onUpdateResume 
}) {
  if (!resume) return null;

  switch (templateId) {
    case 'source-template':
      return <SourceTemplate resume={resume} id={id} />;
    case 'tech-developer':
      return <TechDeveloperTemplate resume={resume} id={id} />;
    case 'creative-startup':
      return <CreativeStartupTemplate resume={resume} id={id} />;
    case 'academic-medical':
      return <AcademicMedicalTemplate resume={resume} id={id} />;
    case 'slate-elite':
      return <SlateEliteTemplate resume={resume} id={id} />;
    case 'nordic-sharp':
      return <NordicSharpTemplate resume={resume} id={id} />;
    case 'indigo-pro':
      return <IndigoProTemplate resume={resume} id={id} />;
    case 'compact-one-page':
      return <CompactOnePageTemplate resume={resume} id={id} />;
    case 'executive-charter':
      return <ExecutiveCharterTemplate resume={resume} id={id} />;
    case 'hybrid-portfolio':
      return <HybridPortfolioTemplate resume={resume} id={id} />;
    case 'modern-chronological':
      return <ModernChronologicalTemplate resume={resume} id={id} />;
    case 'single-column':
      return <SingleColumnTemplate resume={resume} id={id} />;
    case 'modern-minimal':
      return <ModernMinimalTemplate resume={resume} id={id} />;
    case 'dual-column':
      return <DualColumnTemplate resume={resume} id={id} />;
    default:
      return <SourceTemplate resume={resume} id={id} />;
  }
}

