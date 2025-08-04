#!/usr/bin/env node

/**
 * Ultra-optimized production server launcher
 * Configures Node.js for maximum performance
 */

// Set optimal Node.js flags for production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Enable performance optimizations
const nodeFlags = [
    '--max-old-space-size=4096',    // 4GB heap size
    '--max-semi-space-size=256',    // Larger semi-space for faster GC
    '--max-executable-size=2048',   // Increase executable space
    '--optimize-for-size',          // Optimize for memory efficiency
    '--gc-interval=100',           // More frequent minor GC
    '--expose-gc',                 // Enable manual GC triggers
    '--use-largepages=on',         // Use large memory pages if available
    '--experimental-vm-modules',    // VM performance improvements
    '--no-deprecation',            // Reduce noise in logs
    '--no-warnings',               // Reduce noise in logs
    '--trace-uncaught',            // Better error debugging
    '--unhandled-rejections=warn'  // Handle promise rejections
];

// Apply flags if not already running with them
if (!process.execArgv.some(arg => arg.includes('max-old-space-size'))) {
    const { spawn } = require('child_process');
    const args = [...nodeFlags, __filename, ...process.argv.slice(2)];
    
    console.log('🚀 Starting optimized Casino Microservice...');
    console.log('🔧 Node.js flags:', nodeFlags.join(' '));
    
    const child = spawn(process.execPath, args, {
        stdio: 'inherit',
        env: {
            ...process.env,
            // Performance environment variables
            UV_THREADPOOL_SIZE: '128',        // Increase thread pool
            NODE_OPTIONS: nodeFlags.join(' '),
            ENABLE_AUTO_GC: 'true',
            LOG_LEVEL: 'info',                // Reduce logging overhead
            MEMORY_MONITOR_INTERVAL: '8000',  // 8 second monitoring
            MAX_CONNECTIONS_PER_PROVIDER: '5000',
            MAX_SUBSCRIPTIONS_PER_CLIENT: '200',
            HEARTBEAT_INTERVAL: '15000'
        }
    });
    
    child.on('exit', (code, signal) => {
        console.log(`Server exited with code ${code} and signal ${signal}`);
        process.exit(code);
    });
    
    // Handle graceful shutdown
    ['SIGTERM', 'SIGINT'].forEach(signal => {
        process.on(signal, () => {
            console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
            child.kill(signal);
        });
    });
    
    return;
}

// Performance monitoring setup
const startTime = Date.now();

// Monitor startup performance
console.log('⚡ Optimized Node.js runtime initialized');
console.log('💾 Memory limit:', process.memoryUsage());
console.log('🔧 V8 flags active:', process.execArgv.join(' '));

// Set process title for easier monitoring
process.title = 'casino-microservice-optimized';

// Increase default maxListeners to prevent warnings
require('events').EventEmitter.defaultMaxListeners = 50;

// Pre-load and cache frequently used modules
const moduleCache = {
    express: require('express'),
    ws: require('ws'),
    cors: require('cors'),
    https: require('https'),
    crypto: require('crypto')
};

console.log('📦 Core modules pre-loaded');

// Set optimal uncaught exception handling
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    // Graceful shutdown on critical errors
    setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Performance monitoring
setInterval(() => {
    const memUsage = process.memoryUsage();
    const uptime = Date.now() - startTime;
    
    if (global.gc) {
        // Manual GC trigger based on heap usage
        const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
        if (heapRatio > 0.8) {
            console.log('🧹 Triggering manual GC (heap usage:', Math.round(heapRatio * 100) + '%)');
            global.gc();
        }
    }
}, 30000); // Check every 30 seconds

console.log('🎯 Starting main server with optimizations...');

// Start the main server
require('./server.js');

// Log optimization summary
setTimeout(() => {
    const memUsage = process.memoryUsage();
    console.log('✅ Optimization Summary:');
    console.log('   📊 Heap Size:', Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB');
    console.log('   🔄 GC Available:', !!global.gc);
    console.log('   ⚡ Thread Pool Size:', process.env.UV_THREADPOOL_SIZE);
    console.log('   🚀 Server fully optimized and running!');
}, 2000);