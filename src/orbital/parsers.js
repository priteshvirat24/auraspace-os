/**
 * Telemetry Ingestion Pipeline
 * Parses incoming XML CDMs and validates TLEs using Modulo 10 checksum.
 */

/**
 * Validates a TLE string using the Modulo-10 checksum logic defined in PRD 5.2
 */
export function validateTLEChecksum(line) {
  if (!line || line.length !== 69) {
    return false;
  }
  
  let sum = 0;
  // Calculate sum of characters from index 0 to 67
  for (let i = 0; i < 68; i++) {
    const char = line[i];
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    } else if (char === '-') {
      sum += 1;
    }
    // all other non-digits ignored
  }
  
  const expectedCheckSum = parseInt(line[68], 10);
  const calculatedCheckSum = sum % 10;
  
  return calculatedCheckSum === expectedCheckSum;
}

/**
 * Parses CCSDS CDM XML format and extracts core TCA parameters.
 */
export function parseCCSDS_CDM(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  // Basic validation
  const root = xmlDoc.getElementsByTagName("cdm")[0];
  if (!root) throw new Error("Invalid CDM format: missing <cdm> root");
  
  const version = root.getAttribute("version") || root.getAttribute("id");
  
  const tcaNode = xmlDoc.getElementsByTagName("TCA")[0];
  const tcaStr = tcaNode ? tcaNode.textContent : null;
  const tcaDate = tcaStr ? new Date(tcaStr) : null;
  
  const missDistNode = xmlDoc.getElementsByTagName("MISS_DISTANCE")[0];
  const missDistance = missDistNode ? parseFloat(missDistNode.textContent) : null;
  
  // Minimal extraction for Hackathon usage
  return {
    version: version || "1.0",
    tca: tcaDate,
    missDistance: missDistance
  };
}
