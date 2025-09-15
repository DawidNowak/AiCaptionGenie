/**
 * Test-Driven Development: Project Setup Validation
 * This test MUST fail initially and pass after implementing T001
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

describe('T001: Next.js 14 Project Setup', () => {
    const projectRoot = path.resolve(__dirname, '..', '..');

    test('should have package.json with Next.js 14 and TypeScript configuration', () => {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        expect(existsSync(packageJsonPath)).toBe(true);

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

        // Verify Next.js 14
        expect(packageJson.dependencies?.next).toMatch(/^14\./);

        // Verify TypeScript dependencies (moved to dependencies for Vercel build)
        expect(packageJson.dependencies?.typescript).toBeDefined();
        expect(packageJson.dependencies?.['@types/node']).toBeDefined();
        expect(packageJson.dependencies?.['@types/react']).toBeDefined();
        expect(packageJson.dependencies?.['@types/react-dom']).toBeDefined();
    });

    test('should have Tailwind CSS configured', () => {
        const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

        // Verify Tailwind CSS dependencies (moved to dependencies for Vercel build)
        expect(packageJson.dependencies?.tailwindcss).toBeDefined();
        expect(packageJson.dependencies?.postcss).toBeDefined();
        expect(packageJson.dependencies?.autoprefixer).toBeDefined();

        // Verify Tailwind config exists
        const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.ts');
        expect(existsSync(tailwindConfigPath)).toBe(true);
    });

    test('should have essential AI Caption Genie dependencies', () => {
        const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

        // Verify OpenAI SDK
        expect(packageJson.dependencies?.openai).toBeDefined();

        // Verify Stripe SDK
        expect(packageJson.dependencies?.stripe).toBeDefined();

        // Verify Zod for validation
        expect(packageJson.dependencies?.zod).toBeDefined();
    });

    test('should have TypeScript strict mode enabled', () => {
        const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
        expect(existsSync(tsconfigPath)).toBe(true);

        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
        expect(tsconfig.compilerOptions?.strict).toBe(true);
    });

    test('should have Next.js App Router structure', () => {
        const appDirPath = path.join(projectRoot, 'src', 'app');
        expect(existsSync(appDirPath)).toBe(true);

        const layoutPath = path.join(appDirPath, 'layout.tsx');
        expect(existsSync(layoutPath)).toBe(true);

        const pagePath = path.join(appDirPath, 'page.tsx');
        expect(existsSync(pagePath)).toBe(true);
    });

    test('should have working dev server (npm run dev)', () => {
        const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

        // Verify dev script exists
        expect(packageJson.scripts?.dev).toBeDefined();
        expect(packageJson.scripts?.dev).toContain('next dev');

        // Verify build script for validation
        expect(packageJson.scripts?.build).toBeDefined();
        expect(packageJson.scripts?.build).toContain('next build');
    });
});
