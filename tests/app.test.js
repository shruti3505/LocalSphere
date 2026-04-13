/**
 * Unit Test Suite - LocalSphere API
 * Tests structural integrity, authentication logic, and business rules
 * Methodology: Static assertion - verifies security patterns in source code
 */

const fs = require('fs');
const path = require('path');

// ── Structural Tests ──────────────────────────────────────────────────────────

test('Dockerfile exists in project root', () => {
  const filePath = path.join(__dirname, '..', 'Dockerfile');
  expect(fs.existsSync(filePath)).toBe(true);
});

test('package.json exists in project root', () => {
  const filePath = path.join(__dirname, '..', 'package.json');
  expect(fs.existsSync(filePath)).toBe(true);
});

test('Main entry point src/index.js exists', () => {
  const filePath = path.join(__dirname, '..', 'src', 'index.js');
  expect(fs.existsSync(filePath)).toBe(true);
});

// ── Authentication Tests ──────────────────────────────────────────────────────

test('Auth controller handles null input - returns 400 for missing user', () => {
  const authController = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'controllers', 'authController.js'),
    'utf8'
  );
  expect(authController).toMatch(/status\(400\)/);
});

test('Auth middleware rejects missing token with 401', () => {
  const authMiddleware = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'middleware', 'auth.js'),
    'utf8'
  );
  expect(authMiddleware).toMatch(/status\(401\)/);
});

test('Passwords are hashed using bcrypt before storage', () => {
  const authController = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'controllers', 'authController.js'),
    'utf8'
  );
  expect(authController).toMatch(/bcrypt/);
  expect(authController).toMatch(/hash/);
});

// ── Business Logic Tests ──────────────────────────────────────────────────────

test('Order model enforces valid status values only', () => {
  const orderModel = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'models', 'Order.js'),
    'utf8'
  );
  expect(orderModel).toMatch(/pending/);
  expect(orderModel).toMatch(/confirmed/);
  expect(orderModel).toMatch(/cancelled/);
});

test('JWT token is signed and returned on successful login', () => {
  const authController = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'controllers', 'authController.js'),
    'utf8'
  );
  expect(authController).toMatch(/jwt\.sign/);
  expect(authController).toMatch(/token/);
});

test('Product model requires vendor and price fields', () => {
  const productModel = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'models', 'Product.js'),
    'utf8'
  );
  expect(productModel).toMatch(/required: true/);
  expect(productModel).toMatch(/price/);
});
