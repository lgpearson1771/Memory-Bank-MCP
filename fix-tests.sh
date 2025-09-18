#!/bin/bash
# Fix test files to use correct detailLevel values
cd /mnt/c/MCPs/Memory-Bank-MCP
sed -i "s/detailLevel: 'standard'/detailLevel: 'detailed'/g" tests/unit/memoryBankGenerator.test.ts
echo "Fixed memoryBankGenerator test"