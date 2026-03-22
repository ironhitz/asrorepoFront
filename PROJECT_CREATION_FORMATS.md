# Project Creation - Multiple Input Format Support

## Overview

The ASRO frontend now supports adding GitLab projects using multiple input formats for convenience:

- **Numeric Project ID** - Direct GitLab project ID
- **HTTPS URL** - Standard GitLab HTTPS repository link
- **SSH URL** - Git SSH clone URL
- **Web URL** - GitLab web interface URL with paths

## Supported Formats

### 1. Project ID
```
79598942
```
Direct numeric GitLab project ID. Fastest if you already know the ID.

### 2. HTTPS URL
```
https://gitlab.com/group/project
https://gitlab.com/git-lab-AI-hackathon/asrorepo
https://gitlab.com/group/project/-/tree/main  (with branch)
```
Standard HTTPS clone URLs or web URLs.

### 3. SSH URL
```
git@gitlab.com:group/project.git
git@gitlab.com:git-lab-AI-hackathon/asrorepo.git
```
SSH clone URLs, useful if you have SSH keys configured.

### 4. Web URL
```
https://gitlab.com/group/project/-/tree/main
https://gitlab.com/group/project/-/blob/main/README.md
```
Any GitLab web interface URL - the parser extracts group/project.

## How It Works

### Input Parsing

The `gitlabProjectParser.ts` utility parses the input to extract:

- **projectId** - Used to fetch project data from GitLab API
- **namespace** - Group/organization name
- **name** - Project name
- **format** - How it was provided (for reference)

### Validation

Real-time validation shows:
- ✅ Green checkmark for valid input with project description
- ❌ Red error for invalid formats with helpful hints

### Automatic Resolution

The frontend automatically:
1. Parses the input to extract project identifier
2. Resolves to numeric project ID if needed
3. Fetches full project details from GitLab
4. Adds to dashboard

## API Integration

```typescript
// Parse various formats
const parsed = parseGitLabProjectLink(input);
// Returns: { projectId, namespace, name, format }

// Validate format
if (isValidGitLabProjectLink(input)) {
  // Proceed with submission
}

// Get user-friendly description
const description = describeGitLabProject(parsed);
```

## For Developers

### Adding Project via Parser

```typescript
import { 
  parseGitLabProjectLink, 
  isValidGitLabProjectLink,
  describeGitLabProject 
} from '../utils/gitlabProjectParser';

// Parse input
const parsed = parseGitLabProjectLink(userInput);

if (parsed) {
  // Use parsed.projectId for API calls
  const response = await fetch(`/api/gitlab/project?projectId=${parsed.projectId}`);
}
```

### Supported Use Cases

1. **Copy from "git clone" command**
   ```bash
   git clone https://gitlab.com/group/project.git
   # Paste the URL directly without .git
   ```

2. **Copy from "git@" SSH link**
   ```bash
   git@gitlab.com:group/project.git
   # Works as-is
   ```

3. **Copy from browser URL**
   ```
   https://gitlab.com/group/project/-/tree/main
   # Parser extracts project from any GitLab URL
   ```

4. **Use Project ID directly**
   ```
   79598942
   # Fastest if you know the numeric ID
   ```

## Examples in UI

The modal shows helpful examples with copy buttons:
- **Project ID**: 79598942 (with Copy button)
- **HTTPS**: https://gitlab.com/group/project (with Copy button)
- **SSH**: git@gitlab.com:group/project.git (with Copy button)

Clicking any example populates the input field.

## Error Handling

Invalid formats show clear error messages:
```
Invalid GitLab project link. Please provide:
• Project ID (e.g., 79598942)
• HTTPS URL (e.g., https://gitlab.com/group/project)
• SSH URL (e.g., git@gitlab.com:group/project.git)
```

## Related Files

- **Parser**: `src/utils/gitlabProjectParser.ts`
- **Component**: `src/components/Projects.tsx` (uses parser)
- **Types**: Uses existing GitLab project interfaces

## Features

✅ Multiple input formats  
✅ Real-time validation  
✅ Copy-paste friendly  
✅ Helpful error messages  
✅ Format detection  
✅ User-friendly descriptions  
✅ Example suggestions  

---

**Status**: ✅ Implemented  
**Version**: 1.0  
**Last Updated**: March 2026
