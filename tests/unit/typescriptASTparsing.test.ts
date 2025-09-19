/**
 * TypeScript AST Parsing - Unit Tests
 * Testing the real TypeScript Compiler API integration
 */

import { TypeScriptAnalyzer } from '../../src/core/projectIntelligenceEngine.js';

describe('TypeScript AST Parsing - Real Implementation', () => {
  let analyzer: TypeScriptAnalyzer;

  beforeEach(() => {
    analyzer = new TypeScriptAnalyzer();
  });

  describe('Basic Parsing', () => {
    it('should parse simple TypeScript code successfully', async () => {
      const typeScriptCode = `
export function hello(name: string): string {
  return "Hello, " + name;
}
      `;

      const result = await analyzer.parse(typeScriptCode, '/test/simple.ts');

      expect(result.parseSuccess).toBe(true);
      expect(result.type).toBe('typescript-ast');
      expect(result.sourceFile).toBe('/test/simple.ts');
      expect(result.functions).toHaveLength(1);
      
      const func = result.functions[0];
      expect(func.name).toBe('hello');
      expect(func.isExported).toBe(true);
      expect(func.parameters).toHaveLength(1);
      expect(func.parameters[0].name).toBe('name');
      expect(func.parameters[0].type).toBe('string');
      expect(func.returnType).toBe('string');
    });

    it('should handle parsing errors gracefully', async () => {
      const malformedCode = `
function incomplete(param: string {
  return param.toUpperCase(
}
      `;

      const result = await analyzer.parse(malformedCode, '/test/broken.ts');

      // TypeScript compiler is forgiving, so it might still parse successfully
      // But we should still get a result
      expect(result).toBeDefined();
      expect(result.type).toBe('typescript-ast');
      expect(result.sourceFile).toBe('/test/broken.ts');
      
      // If it fails to parse, we should get error info
      if (!result.parseSuccess) {
        expect(result.error).toBeDefined();
        expect(result.functions).toEqual([]);
      }
    });

    it('should extract class information', async () => {
      const typeScriptCode = `
export class UserService {
  async getUser(id: string): Promise<User> {
    return await this.repository.findById(id);
  }
}
      `;

      const result = await analyzer.parse(typeScriptCode, '/test/service.ts');

      expect(result.parseSuccess).toBe(true);
      expect(result.classes).toHaveLength(1);
      
      const cls = result.classes[0];
      expect(cls.name).toBe('UserService');
      expect(cls.isExported).toBe(true);
      expect(cls.methods).toHaveLength(1);
      expect(cls.methods[0].name).toBe('getUser');
      expect(cls.methods[0].isAsync).toBe(true);
    });

    it('should extract import information', async () => {
      const typeScriptCode = `
import express from 'express';
import { UserService } from './services/UserService';
import * as path from 'path';
      `;

      const result = await analyzer.parse(typeScriptCode, '/test/imports.ts');

      expect(result.parseSuccess).toBe(true);
      expect(result.imports).toHaveLength(3);
      
      const expressImport = result.imports.find(i => i.modulePath === 'express');
      expect(expressImport).toBeDefined();
      expect(expressImport?.importType).toBe('default');
      expect(expressImport?.isExternal).toBe(true);
    });

    it('should detect patterns in code', async () => {
      const typeScriptCode = `
import express from 'express';

async function processData() {
  const result = await apiClient.fetch();
  return result;
}
      `;

      const result = await analyzer.parse(typeScriptCode, '/test/patterns.ts');

      expect(result.parseSuccess).toBe(true);
      expect(result.patterns).toContain('Express.js API');
      expect(result.patterns).toContain('Async/Await Pattern');
    });

    it('should calculate complexity', async () => {
      const typeScriptCode = `
function complexFunction(input: string): string {
  if (input.length === 0) {
    return '';
  }
  
  for (let i = 0; i < input.length; i++) {
    if (input[i] === 'x') {
      continue;
    }
  }
  
  return input.toUpperCase();
}
      `;

      const result = await analyzer.parse(typeScriptCode, '/test/complexity.ts');

      expect(result.parseSuccess).toBe(true);
      expect(result.complexity).toBeGreaterThan(0);
      expect(result.functions[0].complexity).toBeGreaterThan(1);
    });
  });
});