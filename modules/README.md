# Accountant Module System

## Overview
The Accountant Module System provides a robust, scalable architecture for building modular financial management applications.

## Configuration Files

### module.json (System Configuration)
- **Location**: `./modules/module.json`
- **Purpose**: Global module system configuration
- **Scope**: Application-wide settings

### Individual Module Configuration
Each module has two configuration files:
- `module.json` - Module identity and properties
- `config.json` - Module settings and features

## Key Features

### Auto-Discovery
Modules are automatically discovered and registered based on the directory structure.

### Dependency Management
Strict dependency resolution with version compatibility checking.

### Environment-Specific Configurations
Different settings for development, staging, and production environments.

### Performance Optimizations
Caching, lazy loading, and tree shaking for optimal performance.

## Usage

### Basic Setup
```javascript
import { moduleRegistry } from './modules/core';

// The system automatically discovers and initializes modules