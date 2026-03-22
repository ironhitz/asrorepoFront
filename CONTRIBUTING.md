# 🎯 Contributing Guide

Welcome to ASRO! We're excited to have you contribute. This guide explains how to get involved.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Contributing Process](#contributing-process)
4. [Coding Standards](#coding-standards)
5. [Pull Request Process](#pull-request-process)
6. [Commit Messages](#commit-messages)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Reporting Issues](#reporting-issues)
10. [Recognition](#recognition)

---

## 🤝 Code of Conduct

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inspiring community.

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Go to https://github.com/ironhitz/asrorepo-frontend
# Click "Fork" button
# Clone your fork
git clone https://github.com/YOUR_USERNAME/asrorepo-frontend.git
cd asrorepo-frontend
```

### 2. Create a Branch

```bash
# Create a branch for your feature/fix
git checkout -b feature/your-feature-name

# Branch naming conventions:
# feature/add-new-dashboard     # New feature
# fix/security-vulnerability    # Bug fix
# docs/update-readme            # Documentation
# refactor/improve-performance  # Refactoring
# test/add-unit-tests          # Testing
```

### 3. Set Up Development Environment

```bash
npm install
npm run cli setup
npm run dev
```

---

## 📝 Contributing Process

### Step 1: Make Your Changes

```bash
# Edit files
# Follow coding standards (see below)
# Test your changes locally
npm run dev
npm run build
npm run lint
```

### Step 2: Commit Your Changes

```bash
# Stage changes
git add .

# Commit with meaningful message (see Commit Messages section)
git commit -m "feat: add new compliance dashboard"

# Push to your fork
git push origin feature/your-feature-name
```

### Step 3: Create a Pull Request

1. Go to https://github.com/ironhitz/asrorepo-frontend
2. Click "New Pull Request"
3. Select your branch as the source
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No breaking changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings generated
```

### Step 4: Review & Feedback

- Team members will review your PR
- Address requested changes
- Rebuild and test after changes
- Once approved, PR will be merged

---

## 💻 Coding Standards

### TypeScript

```typescript
// ✅ GOOD: Clear, type-safe code
export function calculateSecurityScore(metrics: Metric[]): number {
  if (!Array.isArray(metrics) || metrics.length === 0) {
    return 0;
  }
  const total = metrics.reduce((sum, m) => sum + m.score, 0);
  return Math.round(total / metrics.length);
}

// ❌ BAD: Unclear, no types
function calcScore(m) {
  let t = 0;
  for (let i = 0; i < m.length; i++) {
    t += m[i].score;
  }
  return t / m.length;
}
```

### React Components

```typescript
// ✅ GOOD: Functional component with clear props
interface CardProps {
  title: string;
  score: number;
  color?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Card({ title, score, color = 'primary', onClick }: CardProps) {
  return (
    <div className={`card card-${color}`} onClick={onClick}>
      <h3>{title}</h3>
      <p>{score}%</p>
    </div>
  );
}

// ❌ BAD: Unclear props, missing types
export function Card(props) {
  return (
    <div className="card" onClick={props.click}>
      <h3>{props.t}</h3>
      <p>{props.s}%</p>
    </div>
  );
}
```

### Naming Conventions

- **Functions**: camelCase, descriptive `calculateSecurityScore()`
- **Components**: PascalCase `SecurityCard`
- **Constants**: UPPER_SNAKE_CASE `MAX_RETRIES`
- **Variables**: camelCase, descriptive `userEmail`
- **Files**: kebab-case for utilities `metric-calculations.ts`
- **Components**: PascalCase for directories `components/SecurityDashboard/`

### File Organization

```
src/
├── components/
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── ui/
│       ├── ScoreCard.tsx
│       └── index.ts  # Export all UI components
├── pages/
│   ├── SecurityDashboard.tsx
│   └── Compliance.tsx
├── services/
│   ├── gitlabDataService.ts
│   └── index.ts
└── utils/
    ├── metricCalculations.ts
    └── index.ts
```

### Code Quality

**Linting & Formatting:**
```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run cli lint:fix

# Format code
npm prettier
```

**Comments & Documentation:**
```typescript
/**
 * Calculates the average security score across all metrics
 * 
 * @param metrics - Array of metric objects with score property
 * @returns Average score as a number (0-100)
 * @throws Error if metrics is invalid
 * 
 * @example
 * const score = calculateSecurityScore([
 *   { score: 85 },
 *   { score: 90 }
 * ]); // Returns 87.5
 */
export function calculateSecurityScore(metrics: Metric[]): number {
  // Implementation
}
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments and documentation added
- [ ] Tests pass: `npm run lint && npm run build`
- [ ] No new warnings introduced
- [ ] Updates made to README if needed

### Automated Checks

Your PR will automatically run:
- TypeScript type checking
- Linting (ESLint)
- Build verification
- Security scanning

All checks must pass before merging.

### Review Process

1. **Automated Checks** (run first)
2. **Code Review** (1+ maintainer)
3. **Discussion** (if needed)
4. **Approval** (all feedback addressed)
5. **Merge** (by maintainer)

### Merge Conflicts

If conflicts occur:
```bash
# Update your branch with main
git fetch origin
git rebase origin/main

# Resolve conflicts in your editor
# Then continue rebase
git rebase --continue
git push origin feature/your-feature-name --force
```

---

## 📝 Commit Messages

Follow the Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature (e.g., `feat(dashboard): add compliance page`)
- **fix**: Bug fix (e.g., `fix(security): correct score calculation`)
- **docs**: Documentation (e.g., `docs: update README`)
- **style**: Code style (e.g., `style: fix indentation`)
- **refactor**: Code refactoring (e.g., `refactor(hooks): simplify data fetching`)
- **perf**: Performance (e.g., `perf(render): optimize component re-rendering`)
- **test**: Tests (e.g., `test: add unit tests for calculator`)
- **chore**: Maintenance (e.g., `chore: update dependencies`)

### Examples

```
feat(dashboard): add real-time security score updates
- Implement WebSocket connection to backend
- Add auto-refresh every 30 seconds
- Display loading state during updates

Closes #123
```

```
fix(security): prevent XSS in user input
- Add sanitization to text inputs
- Escape HTML special characters
- Add security tests

Fixes #456
```

---

## 🧪 Testing

### Manual Testing

```bash
# Before pushing:
npm run dev          # Start dev server
npm run build        # Test production build
npm run lint         # Check for errors
npm run preview      # Preview production build
```

### Test Cases to Consider

- **Happy Path**: Feature works as intended
- **Error Cases**: Handle errors gracefully
- **Edge Cases**: Empty data, large data, invalid input
- **Security**: No XSS, CSRF, or injection vulnerabilities
- **Performance**: No significant slowdowns
- **Accessibility**: Keyboard navigation, screen readers

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- calculator.test.ts

# Watch mode (re-run on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## 📚 Documentation

### Update README

If your changes affect users, update README.md:
- New features: Add to Features section
- Breaking changes: Add to Known Issues
- API changes: Update API Integration section
- Installation changes: Update Prerequisites

### Code Comments

```typescript
// ✅ Good: Explains WHY, not WHAT
// We cache API responses for 5 minutes to reduce load
const CACHE_TTL = 5 * 60 * 1000;

// ❌ Bad: Obvious from code
// Set cache TTL
const CACHE_TTL = 5 * 60 * 1000;
```

### JSDoc Comments

```typescript
/**
 * Validates and transforms raw scan data
 * 
 * @param rawData - JSON string from API
 * @returns Transformed ScanData object
 * @throws SyntaxError if JSON is invalid
 * @throws ValidationError if data missing required fields
 */
export function processScanData(rawData: string): ScanData {
  // Implementation
}
```

---

## 🐛 Reporting Issues

### Bug Report Template

```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS 12.1]
- Browser: [e.g. Chrome 98]
- Node: [e.g. v18.0.0]
- npm: [e.g. 9.0.0]

## Screenshots
[if applicable]

## Error Logs
[Paste any error messages]
```

### Feature Request Template

```markdown
## Description
What problem does this solve?

## Proposed Solution
How would you implement this?

## Alternative Solutions
Any other approaches?

## Additional Context
Any other information?
```

### Submission

1. Go to [GitHub Issues](https://github.com/ironhitz/asrorepo-frontend/issues)
2. Click "New Issue"
3. Choose template (Bug or Feature)
4. Fill out all sections
5. Submit

---

## 🏆 Recognition

### Contributors

All contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- GitHub Contributors page
- Release notes (for substantial contributions)

### Levels

- 🥉 **Bronze**: 1-5 contributions
- 🥈 **Silver**: 6-20 contributions
- 🥇 **Gold**: 20+ contributions
- 💎 **Diamond**: Maintainer level

---

## 📞 Questions?

- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: dev@asrorepo.com
- 🐛 **Issues**: GitHub Issues

---

## 🙏 Thank You!

Thank you for contributing to ASRO. Your efforts make security better for everyone!

**Happy Contributing!** 🚀

---

**Last Updated:** March 22, 2026
