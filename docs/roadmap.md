# Development Roadmap

## Current Status

### ✅ **Completed - Core Infrastructure**
- **Monorepo Architecture**: Turborepo + pnpm workspaces
- **Feature-Sliced Design**: Full FSD folder structure implemented
- **Design System**: Vuetify 3 + MD3 blueprint, 20+ wrapper components
- **Domain Architecture**: Entity-centric composables, TanStack Query integration
- **Form System**: Zod validation, dirty tracking, error handling
- **Permissions**: Route guards, UI-level checks, 100+ security keys

### ✅ **Completed - Contract System (Backend-Aligned)**
- **Data Models**: Contract/Sale/SaleItem structure matching backend
- **Enums**: NeedType, SaleStatus, PaymentMethod (with ACH), ContractPersonRole
- **People Relationships**: Primary buyer/beneficiary with role-based system
- **UI Components**: All contract forms updated to use new types
- **Data Persistence**: Date signed, buyer/beneficiary names properly saved/displayed
- **Location Integration**: Backend-aligned location fields (coordinates, accounting)

### ✅ **Completed - Effect TS Integration**
- **@facts/effect Package**: Core infrastructure with typed errors
- **Official Effect Patterns**: Using `Effect.tryPromise` directly
- **TanStack Query Bridge**: `runEffectQuery`, `runEffectMutation`, `handleError` utilities
- **BaseApi Factory**: Promise → Effect transformation layer
- **Contract & Location APIs**: Full Effect TS integration

### ✅ **Completed - JSON Server Setup**
- **@facts/mock-api Package**: JSON Server with BFF-style endpoints
- **Centralized URL Management**: `shared/api/urls.ts` for all endpoints
- **HTTP Client**: Axios with tenant/auth header support
- **Data Source Switching**: Environment-based mock/JSON Server/BFF selection
- **Entity API Integration**: Contract and Location APIs support all modes

### ✅ **Completed - Documentation**
- **Architecture Docs**: FSD, project structure, domain patterns
- **API Integration**: BFF patterns, response handling, legacy patterns
- **Data Models**: Backend/frontend field mapping
- **Effect TS Strategy**: Typed error handling approach
- **Development Guide**: Setup, commands, conventions
- **Roadmap**: Development phases and success metrics

---

## Phase 0: API Development Foundation ✅ COMPLETED

### 🎯 **Status**: JSON Server Implementation Complete

### **Completed**:
1. **JSON Server Package** (`@facts/mock-api`) - Local HTTP-based development
2. **Centralized URLs** (`shared/api/urls.ts`) - Type-safe endpoint definitions
3. **HTTP Client Factory** (`shared/api/http/client.ts`) - Axios with tenant/auth headers
4. **Data Source Abstraction** - Environment-based switching (mock/JSON Server/BFF)
5. **Entity Integration** - Contract and Location APIs support all modes

### **Benefits Delivered**:
- ✅ HTTP data flow testing without backend dependency
- ✅ BFF-aligned endpoint structure for smooth migration
- ✅ Environment variable configuration (`.env.example`, `.env.json-server`, `.env.bff`)
- ✅ Concurrent dev scripts (`pnpm dev:all`) for full-stack development

### **Development Modes**:
```bash
# Full stack: Web app + JSON Server (Turborepo runs all dev scripts)
pnpm dev

# Web app only (uses in-memory mocks by default)
pnpm dev:web

# BFF mode (production, requires backend)
# Set VITE_API_TYPE=bff in .env.local
pnpm dev:web
```

### **Future Enhancements** (Deferred):
- **SignalR Real-Time Updates** (High Priority) - Post-BFF integration
- **Feature Flags Service** (Medium Priority) - For gradual rollouts
- **Event Bus** (Low Priority) - If Pinia state management becomes insufficient
- **Enhanced Location Context** (Medium Priority) - As features require it

### 🎯 **Status**: Foundation Established

### **Completed**:
1. **@facts/effect package** - Core infrastructure ready
2. **Tagged error types** - Type-safe error handling
3. **TanStack Query bridge** - Seamless integration
4. **Contract entity integration** - Proof of concept complete

### **Benefits Delivered**:
- ✅ Type-safe error handling (compile-time safety)
- ✅ Better developer experience (IntelliSense, refactoring)
- ✅ User-friendly error messages (technical → human readable)
- ✅ Future-proof architecture (complex workflows ready)

### **Recommendation**: Continue with Effect TS

**For Facts Alpha's scale and complexity, Effect TS overhead is justified by:**
- Enterprise-grade error handling
- Long-term maintainability
- Complex business logic support
- Team scaling benefits

---

## Phase 2: Architectural Patterns

### 🎯 **Goal**: Implement enterprise-grade patterns for scalability

### **Railway Oriented Programming**
- Chain operations that can fail
- Contract validation workflows
- Data transformation pipelines

### **Command Pattern**
- Undo/redo functionality in contract editing
- Action queuing and batch operations
- Audit trail capabilities

### **Saga Pattern**
- Complex contract workflows (finalize + payment processing)
- Distributed transaction coordination
- Rollback capabilities

### **Circuit Breaker Pattern**
- API resilience and fault tolerance
- Graceful degradation
- Service health monitoring

### **Unit of Work Pattern**
- Batch contract operations
- Transaction-like behavior
- Data consistency guarantees

---

## Phase 3: Feature Expansion

### 🎯 **Goal**: Complete core ERP functionality

### **Contract Enhancements**
- **Financing Module**: Interest calculation, payment schedules
- **Multi-Sale Support**: Handle contract amendments and adjustments
- **Item Catalog**: Product/service catalog with pricing
- **Tax Calculation**: Automated tax computation per jurisdiction
- **Document Generation**: Contract PDF generation and printing

### **Additional Modules**
- **Calendar System**: Appointment scheduling, availability
- **Contact Management**: Customer/prospect database
- **Accounting Integration**: GL account mapping, journal entries
- **Reporting Dashboard**: Analytics and business intelligence
- **Settings Management**: System configuration and preferences

### **Integration Features**
- **Authentication**: User management and login system (Required for BFF)
- **Multi-Tenant Support**: Organization isolation
- **API Gateway/BFF**: Unified backend communication
- **Real-time Updates (SignalR)**: Live data synchronization
  - *Deferred from legacy patterns - requires backend coordination*
  - *Pattern: Centralized connection, automatic reconnection, type-safe event handlers*
- **File Attachments**: Document management
- **Feature Flags**: Gradual rollout management
  - *Deferred from legacy patterns - for controlled feature deployment*
  - *Pattern: Centralized service, role-based flags, environment-aware*

---

## Phase 4: Production Readiness

### 🎯 **Goal**: Enterprise-grade reliability and performance

### **Quality Assurance**
- **Comprehensive Testing**: Unit, integration, E2E tests
- **Storybook Integration**: Component documentation and testing
- **Performance Monitoring**: Bundle analysis, runtime profiling
- **Security Audit**: Penetration testing, vulnerability assessment

### **DevOps & Deployment**
- **CI/CD Pipeline**: Automated testing and deployment
- **Containerization**: Docker setup for consistent environments
- **Monitoring**: Error tracking, performance metrics
- **Backup & Recovery**: Data protection strategies

### **Documentation**
- **API Documentation**: OpenAPI/Swagger specs
- **User Guides**: End-user documentation
- **Deployment Guide**: Infrastructure setup and maintenance
- **Contributing Guide**: Development workflow and standards

---

## Phase 5: Legacy Migration

### 🎯 **Goal**: Seamless transition from legacy FACTS app

### **Data Migration**
- **Database Schema**: Migrate legacy data structures
- **Data Transformation**: Clean and normalize legacy data
- **Validation**: Data integrity checks during migration
- **Rollback Strategy**: Safe migration with recovery options

### **Feature Parity**
- **Complete Feature Set**: All legacy functionality implemented
- **UI Consistency**: Familiar interface patterns
- **Performance**: Match or exceed legacy performance
- **Training**: User adoption and training materials

### **Go-Live Strategy**
- **Phased Rollout**: Gradual feature activation
- **Parallel Operation**: Run both systems during transition
- **User Feedback**: Iterative improvements based on real usage
- **Support Structure**: Help desk and technical support

---

## Success Metrics

### **Technical Excellence**
- ✅ TypeScript strict mode compliance
- ✅ 100% test coverage for critical paths
- ✅ <100ms response times for all operations
- ✅ Zero security vulnerabilities
- ✅ 99.9% uptime target

### **User Experience**
- ✅ Intuitive interface matching user expectations
- ✅ Feature parity with legacy system
- ✅ Mobile-responsive design
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Performance exceeding legacy system

### **Business Impact**
- ✅ Reduced operational errors by 50%
- ✅ Improved user productivity by 30%
- ✅ Lower maintenance costs vs legacy system
- ✅ Scalable architecture for future growth
- ✅ Modern tech stack for long-term viability

---

## Risk Mitigation

### **Technical Risks**
- **Legacy Data Complexity**: Comprehensive data mapping and validation
- **Performance Regression**: Continuous performance monitoring
- **Integration Challenges**: Incremental API development with fallbacks
- **Browser Compatibility**: Modern browser requirements with clear messaging

### **Business Risks**
- **User Adoption**: Extensive training and change management
- **Feature Gaps**: Prioritized feature development based on usage
- **Timeline Delays**: Agile development with regular deliverables
- **Cost Overruns**: Fixed-scope phases with clear deliverables

---

## Next Steps

**Current Status**: JSON Server implementation complete, ready for BFF integration when authentication is available.

**Immediate Priorities**:
1. **Authentication Setup** - Required for BFF connection
2. **Additional Entities** - Extend JSON Server and APIs to cover more backend models
3. **Feature Expansion** - Build out contract financing, multi-sale support, catalog
4. **Real-Time Features** - SignalR integration once BFF is connected

**BFF Migration Tasks** (When connecting to real backend):
- **Contract Save Pattern**: Update `ContractApi.create()` to send nested `ContractSessionSaveModel` payload (contract + sales + items + payments) in one request instead of separate calls. See [API Integration](./api-integration.md#save-contract-draft) for details.

**Decision Point**: Continue feature development with JSON Server while authentication is being developed.

**Timeline Estimate**: 6-12 months for full migration depending on scope and resources.
