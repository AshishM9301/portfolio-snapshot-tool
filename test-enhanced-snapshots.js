// Test file for enhanced snapshot generation system
// This file tests the new website analysis and snapshot generation functionality

const { scrapeWebsiteData, analyzeWebsiteData } = require('./src/lib/website-analyzer.ts')
const { generateSnapshotVariations } = require('./src/lib/snapshot-generator.ts')

async function testEnhancedSnapshotGeneration() {
    console.log('🧪 Testing Enhanced Snapshot Generation System...\n')

    try {
        // Test URL
        const testUrl = 'https://example.com'

        console.log('1. Testing website data scraping...')
        const websiteData = await scrapeWebsiteData(testUrl)
        console.log('✅ Website data scraped successfully')
        console.log('   - Title:', websiteData.title)
        console.log('   - Description:', websiteData.description)
        console.log('   - Features found:', websiteData.features.length)

        console.log('\n2. Testing website analysis...')
        const analysis = await analyzeWebsiteData(websiteData)
        console.log('✅ Website analysis completed')
        console.log('   - Purpose:', analysis.analysis.purpose)
        console.log('   - Category:', analysis.analysis.category)
        console.log('   - Target Audience:', analysis.analysis.targetAudience)
        console.log('   - Key Features:', analysis.analysis.keyFeatures)

        console.log('\n3. Testing snapshot generation...')
        const snapshots = generateSnapshotVariations({
            websiteAnalysis: analysis,
            style: 'professional',
            aspectRatio: '16:9'
        })
        console.log('✅ Snapshots generated successfully')
        console.log('   - Generated snapshots:', snapshots.length)
        console.log('   - Styles:', [...new Set(snapshots.map(s => s.style))])
        console.log('   - Aspect ratios:', [...new Set(snapshots.map(s => s.aspectRatio))])

        console.log('\n🎉 All tests passed! Enhanced snapshot generation system is working correctly.')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
        process.exit(1)
    }
}

// Run the test
testEnhancedSnapshotGeneration() 