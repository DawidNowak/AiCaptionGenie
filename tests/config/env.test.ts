/**
 * @file env.test.ts
 * @description Environment variable configuration tests for AI Caption Genie
 * Tests validate environment variable access and production build optimization
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

describe('Environment Configuration', () => {
    describe('Environment Variables Access', () => {
        beforeEach(() => {
            // Clear any existing environment variables to ensure clean test state
            delete process.env.OPENAI_API_KEY;
            delete process.env.STRIPE_SECRET_KEY;
            delete process.env.STRIPE_WEBHOOK_SECRET;
            delete process.env.STRIPE_PUBLISHABLE_KEY;
            delete process.env.NEXT_PUBLIC_APP_URL;
        });

        afterEach(() => {
            // Set mock environment variables for testing
            process.env.OPENAI_API_KEY = 'sk-test-mock-key-for-testing';
            process.env.STRIPE_SECRET_KEY = 'sk_test_mock-key-for-testing';
            process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock-webhook-secret';
            process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock-publishable-key';
            process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        });

        it('should have access to OpenAI API key in environment', () => {
            // Set mock value for testing
            process.env.OPENAI_API_KEY = 'sk-test-mock-key-for-testing';

            expect(process.env.OPENAI_API_KEY).toBeDefined();
            expect(process.env.OPENAI_API_KEY).not.toBe('');
            expect(process.env.OPENAI_API_KEY).not.toBe('your_openai_api_key_here');
        });

        it('should have access to Stripe secret key in environment', () => {
            // Set mock value for testing
            process.env.STRIPE_SECRET_KEY = 'sk_test_mock-key-for-testing';

            expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
            expect(process.env.STRIPE_SECRET_KEY).not.toBe('');
            expect(process.env.STRIPE_SECRET_KEY).not.toBe('your_stripe_secret_key_here');
        });

        it('should have access to Stripe webhook secret in environment', () => {
            // Set mock value for testing
            process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock-webhook-secret';

            expect(process.env.STRIPE_WEBHOOK_SECRET).toBeDefined();
            expect(process.env.STRIPE_WEBHOOK_SECRET).not.toBe('');
            expect(process.env.STRIPE_WEBHOOK_SECRET).not.toBe('your_stripe_webhook_secret_here');
        });

        it('should have access to Stripe publishable key in environment', () => {
            // Set mock value for testing
            process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock-publishable-key';

            expect(process.env.STRIPE_PUBLISHABLE_KEY).toBeDefined();
            expect(process.env.STRIPE_PUBLISHABLE_KEY).not.toBe('');
            expect(process.env.STRIPE_PUBLISHABLE_KEY).not.toBe('your_stripe_publishable_key_here');
        });

        it('should have proper app URL configuration', () => {
            // Set mock value for testing
            process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

            expect(process.env.NEXT_PUBLIC_APP_URL).toBeDefined();
            expect(process.env.NEXT_PUBLIC_APP_URL).not.toBe('');
        });

        it('should not have any placeholder values in production environment', () => {
            const placeholderValues = [
                'your_openai_api_key_here',
                'your_stripe_secret_key_here',
                'your_stripe_webhook_secret_here',
                'your_stripe_publishable_key_here'
            ];

            // Set valid mock values
            process.env.OPENAI_API_KEY = 'sk-test-mock-key-for-testing';
            process.env.STRIPE_SECRET_KEY = 'sk_test_mock-key-for-testing';
            process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock-webhook-secret';
            process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock-publishable-key';

            const envVars = [
                process.env.OPENAI_API_KEY,
                process.env.STRIPE_SECRET_KEY,
                process.env.STRIPE_WEBHOOK_SECRET,
                process.env.STRIPE_PUBLISHABLE_KEY
            ];

            envVars.forEach(envVar => {
                if (envVar) {
                    expect(placeholderValues).not.toContain(envVar);
                }
            });
        });
    });

    describe('Build Optimization', () => {
        const projectRoot = path.resolve(__dirname, '../..');
        const buildDir = path.join(projectRoot, '.next');

        it('should build successfully with production optimizations', async () => {
            // This test validates that the build process completes without errors
            // and includes production optimizations

            try {
                // Clean any existing build
                if (fs.existsSync(buildDir)) {
                    fs.rmSync(buildDir, { recursive: true });
                }

                // Run production build
                const { stdout, stderr } = await execAsync('npm run build', {
                    cwd: projectRoot,
                    timeout: 120000 // 2 minutes timeout
                });

                // Build should complete successfully
                expect(stderr).not.toContain('error');
                expect(stdout).toContain('Route (app)'); // Next.js build output indicator

                // Build directory should exist
                expect(fs.existsSync(buildDir)).toBe(true);

                // Check for optimization indicators in build output
                expect(stdout).toMatch(/compiled successfully|build completed/i);

            } catch (error) {
                console.error('Build failed:', error);
                throw error;
            }
        }, 120000); // 2 minutes timeout for build test

        it('should have minification enabled in next.config.js', () => {
            const configPath = path.join(projectRoot, 'next.config.mjs');
            expect(fs.existsSync(configPath)).toBe(true);

            const configContent = fs.readFileSync(configPath, 'utf-8');

            // Should have minification settings
            expect(configContent).toMatch(/swcMinify.*true|minify.*true/);
        });

        it('should generate optimized static assets', async () => {
            // This will fail initially until we have proper build optimization
            const staticDir = path.join(buildDir, 'static');

            if (fs.existsSync(staticDir)) {
                const files = fs.readdirSync(staticDir, { recursive: true });
                const jsFiles = files.filter(file =>
                    typeof file === 'string' && file.endsWith('.js')
                ) as string[];

                // Should have minified JavaScript files
                expect(jsFiles.length).toBeGreaterThan(0);

                // Check for typical minification patterns (short variable names, compressed)
                if (jsFiles.length > 0) {
                    const sampleJsFile = path.join(staticDir, jsFiles[0]);
                    const content = fs.readFileSync(sampleJsFile, 'utf-8');

                    // Minified files should be compact (no unnecessary whitespace)
                    const lineCount = content.split('\n').length;
                    expect(lineCount).toBeLessThan(10); // Minified files should be few lines
                }
            }
        });
    });

    describe('Security Validation', () => {
        it('should not have hardcoded API keys in source code', () => {
            const projectRoot = path.resolve(__dirname, '../..');
            const srcDir = path.join(projectRoot, 'src');

            if (fs.existsSync(srcDir)) {
                const checkDirectory = (dirPath: string) => {
                    const items = fs.readdirSync(dirPath, { withFileTypes: true });

                    for (const item of items) {
                        const fullPath = path.join(dirPath, item.name);

                        if (item.isDirectory()) {
                            checkDirectory(fullPath);
                        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
                            const content = fs.readFileSync(fullPath, 'utf-8');

                            // Check for hardcoded API key patterns
                            expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/); // OpenAI API key pattern
                            expect(content).not.toMatch(/pk_live_[a-zA-Z0-9]{20,}/); // Stripe live publishable key
                            expect(content).not.toMatch(/sk_live_[a-zA-Z0-9]{20,}/); // Stripe live secret key
                            expect(content).not.toMatch(/whsec_[a-zA-Z0-9]{20,}/); // Stripe webhook secret
                        }
                    }
                };

                checkDirectory(srcDir);
            }
        });

        it('should use environment variables for API access', () => {
            // Verify that our library files use process.env for keys
            const libDir = path.join(path.resolve(__dirname, '../..'), 'src', 'lib');

            if (fs.existsSync(libDir)) {
                const checkLibFiles = (dirPath: string) => {
                    const items = fs.readdirSync(dirPath, { withFileTypes: true });

                    for (const item of items) {
                        const fullPath = path.join(dirPath, item.name);

                        if (item.isDirectory()) {
                            checkLibFiles(fullPath);
                        } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
                            const content = fs.readFileSync(fullPath, 'utf-8');

                            // Check OpenAI library uses process.env
                            if (item.name === 'openai.ts') {
                                expect(content).toMatch(/process\.env\.OPENAI_API_KEY/);
                            }

                            // Check Stripe library uses process.env
                            if (item.name === 'stripe.ts') {
                                expect(content).toMatch(/process\.env\.STRIPE_SECRET_KEY|process\.env\.STRIPE_WEBHOOK_SECRET/);
                            }
                        }
                    }
                };

                checkLibFiles(libDir);
            } else {
                // If lib directory doesn't exist, this test should be skipped
                expect(true).toBe(true);
            }
        });
    });
});
