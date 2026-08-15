import { BaseLlmProvider } from '../llmProvider.js';

export class GroqProvider extends BaseLlmProvider {
  constructor(apiKey) {
    super('groq');
    this.apiKey = apiKey;
  }

  async generateChangePlan(sourceCvMaster, userRequest, permissionScope) {
    return {
      scope: permissionScope?.scope || "ADD_ONLY",
      target_sections: permissionScope?.target_sections || ["experience"],
      requested_additions: [userRequest]
    };
  }

  async generateCvContent(sourceCvMaster, changePlan) {
    return { success: true, provider: this.name, changePlan };
  }

  async optimizeSection(sectionContent, instructions) {
    return sectionContent;
  }

  async generateAtsSuggestions(sourceCvMaster, jobDescription) {
    return ["Groq ATS suggestion optimization"];
  }
}
