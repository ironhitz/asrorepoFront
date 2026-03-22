# 🔐 Security Policy

This document describes the security practices and policies for the ASRO Frontend project.

---

## Table of Contents

1. [Security Principles](#security-principles)
2. [Reporting Vulnerabilities](#reporting-vulnerabilities)
3. [Supported Versions](#supported-versions)
4. [Security Best Practices](#security-best-practices)
5. [Dependency Management](#dependency-management)
6. [Code Review Process](#code-review-process)
7. [Authentication & Authorization](#authentication--authorization)
8. [Data Protection](#data-protection)
9. [Incident Response](#incident-response)

---

## 🛡️ Security Principles

### Core Principles

1. **Principle of Least Privilege**
   - Users only have access to necessary data/features
   - Tokens with minimal required scopes
   - Read-only access where possible

2. **Defense in Depth**
   - Multiple layers of security
   - Input validation + output encoding
   - Error boundaries catch issues

3. **Secure by Default**
   - Security features enabled by default
   - Opt-out rather than opt-in
   - Clear security documentation

4. **Transparency**
   - Security practices documented
   - Vulnerabilities disclosed responsibly
   - Users informed of risks

---

## 🚨 Reporting Vulnerabilities

### ❌ DO NOT

- ❌ Post vulnerabilities publicly on GitHub Issues
- ❌ Post on social media or forums
- ❌ Disclose to anyone other than maintainers
- ❌ Attempt unauthorized access
- ❌ Modify or delete data (in testing)

### ✅ DO

1. **Email Report**
   ```
   security@asrorepo.com
   Subject: [SECURITY] Brief description
   Body: Detailed report with reproduction steps
   ```

2. **Include**
   - Vulnerability description
   - Affected component/version
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)
   - Your contact information

3. **Examples**

   **Good Report:**
   ```
   Subject: [SECURITY] XSS Vulnerability in ScoreCard Component
   
   Description:
   The ScoreCard component doesn't properly escape user input,
   allowing arbitrary JavaScript execution.
   
   Steps to Reproduce:
   1. Create a ScoreCard with title: <img src=x onerror="alert('xss')">
   2. Observe alert dialog in browser
   
   Impact: High - Unauthorized script execution
   Affected Version: v1.0.0
   ```

### Response Timeline

| Time | Action |
|------|--------|
| 24 hours | Acknowledgment of receipt |
| 48 hours | Initial assessment |
| 5 days | Status update |
| 30 days | Fix or workaround |

###  Coordinated Disclosure

1. Report vulnerability privately
2. Maintainers assess and develop fix
3. Fix tested and code reviewed
4. Public disclosure coordinated
5. Release published with fix
6. Credit given to reporter (optional)

---

## 🔄 Supported Versions

Only the following versions receive security updates:

| Version | Release Date | End of Support | Status |
|---------|--------------|-----------------|--------|
| 2.x | TBD | TBD | Future |
| 1.1.x | Now | 6 months | Current |
| 1.0.x | Past | Ended | Legacy |

**Updates are provided for**
- Security patches
- Critical bug fixes
- Breaking changes (major version only)

**No updates for**
- Minor bugs
- Feature requests
- Unsupported versions

---

## 🔒 Security Best Practices

### 1. Token Management

**✅ DO**
```typescript
// Store token in environment variable
const token = import.meta.env.VITE_GITLAB_TOKEN;

// Use read-only token
// Scopes: api, read_repository

// Rotate tokens regularly
// Use token expiration dates
```

**❌ DON'T**
```typescript
// Don't hardcode tokens
const token = "glpat-xxxxx";

// Don't store in localStorage
localStorage.setItem('token', token);

// Don't log tokens
console.log('Token:', token);

// Don't use admin tokens
```

### 2. Input Validation

**✅ DO**
```typescript
function validateProjectId(id: string | number): boolean {
  // Check type
  if (typeof id !== 'string' && typeof id !== 'number') {
    return false;
  }
  
  // Check format
  const numId = parseInt(String(id), 10);
  return Number.isInteger(numId) && numId > 0;
}

// Sanitize strings
function sanitizeInput(input: string): string {
  return input
    .replace(/[\<\>]/g, '')  // Remove tags
    .trim()                  // Remove whitespace
    .substring(0, 255);      // Limit length
}
```

**❌ DON'T**
```typescript
// Don't trust user input
const data = JSON.parse(userInput);

// Don't use eval()
eval(userInput);

// Don't disable security
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 3. Output Encoding

**✅ DO**
```typescript
// React automatically escapes by default
<div>{userInput}</div>  // Safe - escaped automatically

// For attributes
<img alt={userInput} />  // Safe
```

**❌ DON'T**
```typescript
// Don't bypass escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Don't use innerHTML
element.innerHTML = userInput;
```

### 4. Error Handling

**✅ DO**
```typescript
// Catch errors gracefully
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  // Log locally, don't expose to user
  console.error('[Internal] Fetch failed:', error);
  setError('Failed to load data. Please try again.');
}
```

**❌ DON'T**
```typescript
// Don't expose stack traces
catch (error) {
  setError(error.stack);  // Exposes internal details
}

// Don't ignore errors
await fetchData();  // May crash silently
```

### 5. HTTPS & TLS

**✅ DO**
```typescript
// Use HTTPS URLs
const apiUrl = 'https://gitlab.com/api/v4';

// Verify certificates
// Don't disable SSL verification
```

**❌ DON'T**
```typescript
// Don't use HTTP for sensitive data
const apiUrl = 'http://gitlab.com/api/v4';

// Don't disable verification in production
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

### 6. CORS & CSP

**✅ DO**
```typescript
// Define CORS headers
headers: {
  'Content-Security-Policy': "default-src 'self'"
}

// Use safe headers
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}
```

---

## 📦 Dependency Management

### Avoiding Vulnerabilities

1. **Keep Dependencies Updated**
   ```bash
   npm outdated                 # Check outdated
   npm update                   # Update safely
   npm audit --fix              # Fix vulnerabilities
   ```

2. **Review Dependencies Before Adding**
   - Check npm downloads/week
   - Review GitHub issues
   - Check security records
   - Verify maintainer activity

3. **Audit Regularly**
   ```bash
   npm audit                    # Regular audits
   npm audit --production       # Prod only
   ```

4. **Avoid Insecure Patterns**
   - Don't use `eval()` or `new Function()`
   - Don't disable security warnings
   - Don't use packages with known vulnerabilities
   - Don't use packages without security updates

### Dependency Pinning

```json
{
  "dependencies": {
    "react": "19.0.0",         // Exact version
    "vite": "^6.0.0",         // Allows patches only
    "tailwindcss": "~4.1.0"   // Allows minor updates
  }
}
```

---

## 🔍 Code Review Process

All changes must be reviewed for security:

1. **Pre-Review Checklist**
   - Code compiles without warnings
   - No hardcoded secrets
   - Input validation implemented
   - Error handling present
   - No dangerous functions used

2. **Review Focus**
   - Security implications
   - Data handling
   - Dependencies used
   - Performance impact
   - Testing coverage

3. **Automated Checks**
   - TypeScript type checking
   - ESLint rules
   - Vulnerability scanning
   - Dependency audit

---

## 🔐 Authentication & Authorization

### Token-Based Auth

```typescript
// Use secure tokens
const token = import.meta.env.VITE_GITLAB_TOKEN;

// Include in requests
headers: {
  'PRIVATE-TOKEN': token,
  'Content-Type': 'application/json'
}

// Rotate regularly (e.g., monthly)
// Use token expiration
// Minimize token scope
```

### Rate Limiting

```typescript
// Implement rate limiting
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000  // 15 minutes
});

app.use(rateLimiter);
```

---

## 📊 Data Protection

### Personal Data

```typescript
// Minimize collection
// - Only collect necessary data
// - Delete when no longer needed
// - Anonymize when possible

// Encrypt sensitive data
// - Use HTTPS for transit
// - Encrypt at rest
// - Use secure algorithms (AES-256, TLS 1.2+)

// Secure backups
// - Encrypt backups
// - Test recovery process
// - Restrict access
```

### Data Retention

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| API Token | User controlled | Security |
| Dashboard data | 30 days | Performance |
| Analytics | 90 days | Insights |
| Logs | 7 days | Debugging |

---

## 🚨 Incident Response

### Detection

1. **Security Alert Received**
   - From security scanner
   - From user report
   - From automation

2. **Initial Assessment**
   - Verify vulnerability
   - Determine scope
   - Assess impact

### Response Steps

1. **Immediate (0-1 hour)**
   - Acknowledge report
   - Begin investigation
   - Gather information

2. **Short-term (1-24 hours)**
   - Develop fix/patch
   - Test thoroughly
   - Prepare release

3. **Medium-term (1-7 days)**
   - Release update
   - Communicate details
   - Update documentation

4. **Long-term (1+ weeks)**
   - Post-incident review
   - Implement improvements
   - Update security practices

### Communication

- **To Users**: Clear, honest communication
- **To Maintainers**: Regular updates
- **To Security Community**: Coordinated disclosure

---

## 🏥 Incident Response Contacts

📧 **Security Team**: security@asrorepo.com  
📧 **Legal**: legal@asrorepo.com  
📧 **Maintainers**: dev@asrorepo.com

---

## 📋 Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Tokens not hardcoded
- [ ] Input validated and sanitized
- [ ] Error messages don't leak details
- [ ] Dependencies up-to-date
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] No dangerous functions used
- [ ] Rate limiting implemented
- [ ] Logging doesn't expose secrets
- [ ] Error boundaries in place
- [ ] Data encrypted in transit
- [ ] Audit logging enabled
- [ ] Security documentation updated

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated:** March 22, 2026  
**Reviewed:** March 22, 2026  
**Next Review:** Every 6 months or after incident
