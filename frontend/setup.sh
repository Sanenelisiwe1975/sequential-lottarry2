#!/bin/bash

# Lottery DApp Setup Script
# This script automates the setup process for the lottery DApp

echo "🎰 Sequential Lottery DApp - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your WalletConnect Project ID"
    echo "   Get one at: https://cloud.walletconnect.com"
else
    echo "ℹ️  .env.local already exists"
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your WalletConnect Project ID"
echo "2. Update src/constants/index.ts with your contract address"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "📚 Read QUICKSTART.md for detailed instructions"
echo "=========================================="
