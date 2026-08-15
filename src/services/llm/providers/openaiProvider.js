import { BaseLlmProvider } from '../llmProvider.js';

export class OpenAiProvider extends BaseLlmProvider {
  constructor(apiKey) {
    super('openai');
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
    return ["OpenAI ATS suggestion optimization"];
  }
}
