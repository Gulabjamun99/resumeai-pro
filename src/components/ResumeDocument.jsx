import React from 'react';
import DualColumnTemplate from './templates/DualColumnTemplate';
import SingleColumnTemplate from './templates/SingleColumnTemplate';
import ModernMinimalTemplate from './templates/ModernMinimalTemplate';
import SourceTemplate from './templates/SourceTemplate';

/**
 * RESUME DOCUMENT RENDERER (P1.2 MULTI-TEMPLATE & SOURCE PRESERVATION ENGINE)
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
    case 'single-column':
      return <SingleColumnTemplate resume={resume} id={id} />;
    case 'modern-minimal':
      return <ModernMinimalTemplate resume={resume} id={id} />;
    case 'dual-column':
    default:
      return <DualColumnTemplate resume={resume} id={id} />;
  }
}
