import { BaseLlmProvider } from '../llmProvider.js';

export class GeminiProvider extends BaseLlmProvider {
  constructor(apiKey) {
    super('gemini');
    this.apiKey = apiKey;
  }

  async generateChangePlan(sourceCvMaster, userRequest, permissionScope) {
    return {
      scope: permissionScope?.scope || "ADD_ONLY",
      target_sections: permissionScope?.target_sections || ["experience"],
      locked_sections: ["summary", "existing_bullets", "education", "certifications", "skills", "contact"],
      requested_additions: [userRequest]
    };
  }

  async generateCvContent(sourceCvMaster, changePlan) {
    return {
      success: true,
      provider: this.name,
      changePlan
    };
  }

  async optimizeSection(sectionContent, instructions) {
    return sectionContent;
  }

  async generateAtsSuggestions(sourceCvMaster, jobDescription) {
    return [
      "Include key technical keywords matching target role",
      "Quantify metrics where explicitly present in source data",
      "Ensure bullet points start with strong action verbs"
    ];
  }
}
