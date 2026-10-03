export const starterExamples = [
	{
		id: "hello",
		title: "Hello OpenAMX",
		description: "A short report with values and narrative interpolation.",
		source: "# Hello OpenAMX\n\n```amx\nlet assetName = \"Transformer TX-001\"\nlet riskScore = 15\n```\n\nThe asset under review is {{ assetName }}.\n\nThe illustrative score is {{ riskScore }}.\n"
	},
	{
		id: "operations-note",
		title: "Operations note",
		description: "A compact second report starter with a computed summary.",
		source: "# Operations Note\n\n```amx\nlet openActions = 4\nlet reviewedActions = 3\nlet remainingActions = openActions - reviewedActions\n```\n\n{{ reviewedActions }} of {{ openActions }} listed actions are reviewed.\n\n{{ remainingActions }} action(s) remain for follow-up.\n"
	}
] as const;