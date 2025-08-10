#!/bin/bash

# ProCV Chat Server Deployment Script
# This script deploys the chat server to various cloud platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="procv-chat-server"
NODEJS_VERSION="18"
CURRENT_DIR=$(pwd)

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js ${NODEJS_VERSION} or later."
        exit 1
    fi

    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt "18" ]; then
        log_error "Node.js version 18 or later is required. Current version: $(node -v)"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi

    # Check if we're in the correct directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the chat-server directory."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --only=production
    log_success "Dependencies installed"
}

# Build application (if needed)
build_application() {
    log_info "Building application..."

    # Check if build script exists
    if npm run | grep -q "build"; then
        npm run build
        log_success "Application built successfully"
    else
        log_info "No build script found, skipping build step"
    fi
}

# Validate environment configuration
validate_environment() {
    log_info "Validating environment configuration..."

    local env_file=".env.production"
    if [ ! -f "$env_file" ]; then
        log_warning "$env_file not found. Using .env.example as template."
        cp .env.example $env_file
    fi

    # Check critical environment variables
    local required_vars=("NODE_ENV" "PORT" "JWT_SECRET")
    local missing_vars=()

    source $env_file

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_error "Please update $env_file with the required values"
        exit 1
    fi

    # Check if JWT_SECRET is still default
    if [ "$JWT_SECRET" = "your_production_jwt_secret_change_this_in_production" ]; then
        log_error "JWT_SECRET is still set to default value. Please set a secure random string."
        exit 1
    fi

    log_success "Environment validation passed"
}

# Test application
test_application() {
    log_info "Testing application..."

    # Check if test script exists
    if npm run | grep -q "test"; then
        npm test
        log_success "All tests passed"
    else
        log_info "No test script found, skipping tests"
    fi

    # Basic syntax check
    node -c src/server.js
    log_success "Application syntax check passed"
}

# Deploy to Railway
deploy_railway() {
    log_info "Deploying to Railway..."

    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI is not installed. Please install it first:"
        echo "npm install -g @railway/cli"
        exit 1
    fi

    # Login check
    if ! railway whoami &> /dev/null; then
        log_info "Please login to Railway first:"
        railway login
    fi

    # Initialize project if needed
    if [ ! -f "railway.toml" ]; then
        log_info "Initializing Railway project..."
        railway init
    fi

    # Add services if needed
    log_info "Setting up PostgreSQL database..."
    railway add postgresql || log_warning "PostgreSQL service already exists or failed to add"

    log_info "Setting up Redis cache..."
    railway add redis || log_warning "Redis service already exists or failed to add"

    # Set environment variables
    log_info "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set PORT=8080

    # Deploy
    log_info "Deploying application..."
    railway up --detach

    # Get the URL
    local app_url=$(railway domain)
    if [ $? -eq 0 ] && [ -n "$app_url" ]; then
        log_success "Deployment successful! Application URL: https://$app_url"
    else
        log_success "Deployment completed. Check Railway dashboard for application URL."
    fi
}

# Deploy to Heroku
deploy_heroku() {
    log_info "Deploying to Heroku..."

    if ! command -v heroku &> /dev/null; then
        log_error "Heroku CLI is not installed. Please install it first:"
        echo "https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi

    # Login check
    if ! heroku auth:whoami &> /dev/null; then
        log_info "Please login to Heroku first:"
        heroku login
    fi

    # Create app if needed
    local app_name="${PROJECT_NAME}-$(date +%s)"
    if [ -n "$HEROKU_APP_NAME" ]; then
        app_name="$HEROKU_APP_NAME"
    fi

    log_info "Creating Heroku app: $app_name"
    heroku create $app_name || log_info "App may already exist"

    # Add addons
    log_info "Adding PostgreSQL addon..."
    heroku addons:create heroku-postgresql:essential-0 --app $app_name || log_warning "PostgreSQL addon already exists"

    log_info "Adding Redis addon..."
    heroku addons:create heroku-redis:mini --app $app_name || log_warning "Redis addon already exists"

    # Set environment variables
    log_info "Setting environment variables..."
    heroku config:set NODE_ENV=production --app $app_name
    heroku config:set PORT=8080 --app $app_name

    # Deploy
    log_info "Deploying application..."
    git add .
    git commit -m "Deploy to Heroku - $(date)" || log_info "No changes to commit"
    git push heroku main || git push heroku master

    # Scale dyno
    heroku ps:scale web=1 --app $app_name

    # Get the URL
    local app_url=$(heroku info --app $app_name | grep "Web URL" | awk '{print $3}')
    log_success "Deployment successful! Application URL: $app_url"
}

# Deploy to Render
deploy_render() {
    log_info "Deploying to Render..."
    log_info "For Render deployment:"
    echo "1. Connect your GitHub repository to Render"
    echo "2. Create a new Web Service"
    echo "3. Use these settings:"
    echo "   - Build Command: npm ci"
    echo "   - Start Command: npm start"
    echo "   - Node Version: $NODEJS_VERSION"
    echo "4. Add PostgreSQL and Redis databases"
    echo "5. Set environment variables from .env.production"
    log_info "Visit https://render.com for manual deployment"
}

# Health check
health_check() {
    local url=$1
    if [ -z "$url" ]; then
        log_error "URL is required for health check"
        return 1
    fi

    log_info "Performing health check on $url..."

    local max_retries=10
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if curl -f -s "$url/health" > /dev/null; then
            log_success "Health check passed!"
            return 0
        fi

        retry_count=$((retry_count + 1))
        log_info "Health check attempt $retry_count/$max_retries failed, retrying in 30 seconds..."
        sleep 30
    done

    log_error "Health check failed after $max_retries attempts"
    return 1
}

# Generate deployment report
generate_report() {
    local platform=$1
    local url=$2

    log_info "Generating deployment report..."

    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).txt"

    cat > $report_file << EOF
ProCV Chat Server Deployment Report
Generated: $(date)
Platform: $platform
Application URL: $url

Deployment Configuration:
- Node.js Version: $(node -v)
- npm Version: $(npm -v)
- Environment: production
- Features Enabled:
  - Real-time WebSocket communication
  - REST API for chat history
  - Rate limiting and security
  - Health monitoring
  - Graceful shutdown handling

Next Steps:
1. Update frontend NEXT_PUBLIC_CHAT_SERVER_URL to: $url
2. Test WebSocket connections
3. Monitor application logs
4. Set up custom domain (optional)
5. Configure SSL certificates (if not auto-managed)

Support:
- Health Check: $url/health
- Metrics: $url/metrics
- Documentation: See DEPLOYMENT.md

EOF

    log_success "Deployment report saved to: $report_file"
}

# Main deployment function
main() {
    echo "🚀 ProCV Chat Server Deployment Script"
    echo "========================================"

    # Parse command line arguments
    local platform=""
    local skip_tests=false
    local app_url=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --platform|-p)
                platform="$2"
                shift 2
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --url)
                app_url="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -p, --platform PLATFORM    Target platform (railway, heroku, render)"
                echo "  --skip-tests               Skip application tests"
                echo "  --url URL                  Application URL for health check"
                echo "  -h, --help                 Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0 --platform railway"
                echo "  $0 --platform heroku --skip-tests"
                echo "  $0 --url https://your-app.railway.app"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Pre-deployment steps
    check_prerequisites
    install_dependencies
    build_application
    validate_environment

    if [ "$skip_tests" = false ]; then
        test_application
    fi

    # Platform-specific deployment
    case $platform in
        railway)
            deploy_railway
            ;;
        heroku)
            deploy_heroku
            ;;
        render)
            deploy_render
            ;;
        "")
            log_info "No platform specified. Available options:"
            echo "  - railway: Deploy to Railway (recommended)"
            echo "  - heroku: Deploy to Heroku"
            echo "  - render: Deploy to Render (manual setup required)"
            echo ""
            echo "Example: $0 --platform railway"
            exit 0
            ;;
        *)
            log_error "Unsupported platform: $platform"
            exit 1
            ;;
    esac

    # Post-deployment steps
    if [ -n "$app_url" ]; then
        health_check "$app_url"
        generate_report "$platform" "$app_url"
    fi

    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your frontend NEXT_PUBLIC_CHAT_SERVER_URL environment variable"
    echo "2. Test the chat functionality"
    echo "3. Monitor application logs and metrics"
    echo ""
    echo "For troubleshooting, check the deployment logs and health endpoint."
}

# Run main function with all arguments
main "$@"
