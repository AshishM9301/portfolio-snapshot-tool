// Test SVG generation functionality
const fs = require('fs')
const path = require('path')

// Mock the template data
const mockTemplate = {
    id: 'professional-16-9',
    name: 'Professional Landscape',
    style: 'professional',
    aspectRatio: '16:9',
    description: 'Clean, corporate-style layout perfect for business presentations',
    colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1f2937'
    }
}

// Mock analysis data
const mockAnalysis = {
    keyFeatures: ['Responsive Design', 'Modern UI', 'Fast Performance', 'SEO Optimized'],
    category: 'Business Services',
    targetAudience: 'Businesses and Enterprises',
    technologyIndicators: ['React', 'Node.js']
}

// Function to generate SVG (simplified version of the actual function)
function generateTestSVG(template, title, description, content) {
    const width = 1200
    const height = 675

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${template.colors.background}"/>
    
    <!-- Gradient overlay -->
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${template.colors.primary};stop-opacity:0.15" />
            <stop offset="50%" style="stop-color:${template.colors.secondary};stop-opacity:0.08" />
            <stop offset="100%" style="stop-color:${template.colors.accent};stop-opacity:0.05" />
        </linearGradient>
    </defs>
    
    <!-- Gradient background -->
    <rect width="100%" height="100%" fill="url(#grad)"/>
    
    <!-- Main content area -->
    <rect x="${width * 0.1}" y="${height * 0.15}" width="${width * 0.8}" height="${height * 0.7}" 
          fill="white" opacity="0.95" rx="20"/>
    
    <!-- Title -->
    <text x="50%" y="${height * 0.35}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="48" font-family="Arial, sans-serif" font-weight="bold">
        ${title}
    </text>
    
    <!-- Description -->
    <text x="50%" y="${height * 0.5}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="24" font-family="Arial, sans-serif">
        ${description}
    </text>
    
    <!-- Content items -->
    ${content.map((item, index) => `
        <text x="50%" y="${height * (0.6 + index * 0.08)}" text-anchor="middle" 
              fill="${template.colors.accent}" font-size="18" font-family="Arial, sans-serif">
            ${item}
        </text>
    `).join('')}
    
    <!-- Style badge -->
    <rect x="20" y="20" width="120" height="30" rx="15" fill="${template.colors.primary}" opacity="0.9"/>
    <text x="80" y="40" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif" font-weight="bold">
        ${template.style}
    </text>
    
    <!-- Aspect ratio badge -->
    <rect x="160" y="20" width="80" height="30" rx="15" fill="${template.colors.accent}" opacity="0.9"/>
    <text x="200" y="40" text-anchor="middle" fill="white" font-size="12" font-family="Arial, sans-serif" font-weight="bold">
        ${template.aspectRatio}
    </text>
</svg>`

    return svgContent
}

// Test the SVG generation
function testSVGGeneration() {
    console.log('🧪 Testing SVG Generation...\n')

    try {
        const title = 'Example Website'
        const description = 'A professional business website with modern design'
        const content = mockAnalysis.keyFeatures.slice(0, 3)

        console.log('1. Generating SVG content...')
        const svgContent = generateTestSVG(mockTemplate, title, description, content)
        console.log('✅ SVG content generated successfully')

        console.log('\n2. Converting to base64...')
        const base64 = Buffer.from(svgContent).toString('base64')
        const dataUrl = `data:image/svg+xml;base64,${base64}`
        console.log('✅ Base64 conversion successful')

        console.log('\n3. Saving test file...')
        const testDir = path.join(__dirname, 'test-output')
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir)
        }

        const svgPath = path.join(testDir, 'test-snapshot.svg')
        fs.writeFileSync(svgPath, svgContent)
        console.log('✅ SVG file saved to:', svgPath)

        console.log('\n4. Creating HTML test file...')
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>SVG Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-image { border: 1px solid #ccc; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>SVG Generation Test</h1>
    
    <h2>Direct SVG:</h2>
    <div class="test-image">
        ${svgContent}
    </div>
    
    <h2>Data URL Image:</h2>
    <div class="test-image">
        <img src="${dataUrl}" alt="Test Snapshot" style="max-width: 100%; height: auto;" />
    </div>
    
    <h2>Data URL:</h2>
    <textarea style="width: 100%; height: 100px; font-size: 12px;">${dataUrl}</textarea>
</body>
</html>`

        const htmlPath = path.join(testDir, 'test-snapshot.html')
        fs.writeFileSync(htmlPath, htmlContent)
        console.log('✅ HTML test file saved to:', htmlPath)

        console.log('\n🎉 SVG generation test completed successfully!')
        console.log('\n📁 Test files created:')
        console.log('   - SVG file:', svgPath)
        console.log('   - HTML test:', htmlPath)
        console.log('\n💡 Open the HTML file in a browser to verify the SVG renders correctly.')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
        process.exit(1)
    }
}

// Run the test
testSVGGeneration() 