/**
 * Version information for Memory Bank Generator MCP Server
 */

export const VERSION = '1.0.0';

export const GENERATOR_VERSION = '1.0.0';

export const MEMORY_BANK_VERSION = '1.0.0';

export const MCP_VERSION = '2024-11-05';

export const SUPPORTED_MCP_VERSIONS = ['2024-11-05', '2024-10-07'];

export const BUILD_INFO = {
  version: VERSION,
  buildDate: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
};

export function getVersionInfo(): {
  version: string;
  generatorVersion: string;
  memoryBankVersion: string;
  mcpVersion: string;
  supportedMcpVersions: string[];
  buildInfo: typeof BUILD_INFO;
} {
  return {
    version: VERSION,
    generatorVersion: GENERATOR_VERSION,
    memoryBankVersion: MEMORY_BANK_VERSION,
    mcpVersion: MCP_VERSION,
    supportedMcpVersions: SUPPORTED_MCP_VERSIONS,
    buildInfo: BUILD_INFO,
  };
}