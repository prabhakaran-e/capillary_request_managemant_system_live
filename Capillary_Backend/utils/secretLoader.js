const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const secretName = "PORequest_Secrets";
const region = "ap-south-1";

const client = new SecretsManagerClient({ region });

async function loadSecrets() {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );

    const secrets = response.SecretString
      ? JSON.parse(response.SecretString)
      : {};

    for (const [key, value] of Object.entries(secrets)) {

      process.env[key] = value;
    }

    console.log("✅ Secrets loaded into process.env");
  } catch (err) {
    console.error("❌ Failed to load secrets:", err);
    throw err;
  }
}

module.exports = { loadSecrets };
