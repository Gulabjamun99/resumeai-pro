/**
 * Base Abstract LLM Provider Class
 * Defines standard provider-agnostic interface for ResumeAI Pro.
 */

export class BaseLlmProvider {
  constructor(name) {
    this.name = name;
  }

  async generateChangePlan(sourceCvMaster, userRequest, permissionScope) {
    throw new Error(`generateChangePlan not implemented in ${this.name}`);
  }

  async generateCvContent(sourceCvMaster, changePlan) {
    throw new Error(`generateCvContent not implemented in ${this.name}`);
  }

  async optimizeSection(sectionContent, instructions) {
    throw new Error(`optimizeSection not implemented in ${this.name}`);
  }

  async generateAtsSuggestions(sourceCvMaster, jobDescription) {
    throw new Error(`generateAtsSuggestions not implemented in ${this.name}`);
  }
}
