const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'engine-interactions.log');

/**
 * Logs engine interactions to a file
 * @param {Object} params
 * @param {string} params.moduleName - e.g., 'CategoryEngine', 'ProposalEngine'
 * @param {string} params.prompt - The prompt sent to the engine
 * @param {string} params.rawResponse - The raw string response from engine
 * @param {Object} [params.parsedOutput] - The parsed JSON object if successful
 * @param {boolean} params.success - Whether the interaction/parsing was successful
 * @param {string} [params.error] - Error message if failed
 */
const logEngineAction = ({ moduleName, prompt, rawResponse, parsedOutput, success, error }) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    moduleName,
    prompt,
    rawResponse,
    parsedOutput: parsedOutput || null,
    success,
    error: error || null
  };

  const logString = JSON.stringify(logEntry) + '\n';
  
  fs.appendFile(logFile, logString, (err) => {
    if (err) {
      console.error('Failed to write to system log file', err);
    }
  });
};

module.exports = { logEngineAction };
