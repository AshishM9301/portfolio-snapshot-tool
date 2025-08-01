# Image Snapshot Feature

## Overview
The Image Snapshot feature allows users to generate AI-powered portfolio snapshots directly from uploaded images, bypassing the need for URL-based web scraping.

## Features

### Image Input Methods
- **Drag & Drop**: Users can drag images directly onto the upload area
- **Clipboard Paste**: Users can paste images from their clipboard (Ctrl+V)
- **File Upload**: Traditional file picker for selecting images
- **Multiple Images**: Support for up to 3 images per batch

### Privacy-First Design
- **No Image Storage**: Images are processed in memory and never stored permanently
- **Minimal Metadata**: Only essential job metadata is stored in the database
- **Temporary Processing**: Image data is only held in memory during processing

### Style Customization
- **Text Input**: Users can specify style preferences via text input
- **AI Analysis**: Style preferences are processed by AI to generate appropriate designs
- **Flexible Options**: Support for aspect ratios, design styles, quality settings

### Job Management
- **Real-time Status**: Live updates on job processing status
- **Error Handling**: Comprehensive error reporting and recovery
- **Download Results**: Direct download of generated portfolio snapshots

## Technical Implementation

### Database Schema
```sql
-- Extended Job model with image support
model Job {
    id        String    @id
    url       String?   // Optional for image jobs
    status    JobStatus
    resultUrl String?
    error     String?
    jobType   JobType   @default(url)  // 'url' or 'image'
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}
```

### API Endpoints
- `POST /api/batch-image-snapshots` - Process image-based snapshot generation
- `GET /api/job-status/[jobId]` - Check job status (shared with URL jobs)

### Worker Processing
- **Dual Processing**: Single worker handles both URL and image jobs
- **Image Analysis**: AI analyzes uploaded images to generate portfolio content
- **HTML Generation**: Creates professional portfolio layouts from image content
- **PNG Export**: Converts generated HTML to high-quality PNG images

## Usage

### For Users
1. Navigate to `/image-test`
2. Upload images via drag & drop, paste, or file picker
3. Optionally add style preferences
4. Click "Generate AI Snapshots"
5. Monitor job progress and download results

### For Developers
1. **Component**: `ImageSnapshotTester` in `src/app/_components/`
2. **API**: `src/app/api/batch-image-snapshots/route.ts`
3. **Worker**: Enhanced `ai-snapshot-worker.ts` with image processing
4. **Types**: Extended in `src/types/Job.ts`

## Privacy & Security

### Data Handling
- Images are never stored in the database
- Image data is only held in memory during processing
- No user preferences or metadata are permanently stored
- All processing is done server-side with immediate cleanup

### Validation
- File type validation (JPEG, PNG, WebP only)
- File size limits (10MB per image)
- Maximum 3 images per batch
- Input sanitization and error handling

## Integration

### Existing System Compatibility
- **Backward Compatible**: URL-based jobs continue to work unchanged
- **Shared Infrastructure**: Uses existing job management and status tracking
- **Unified Worker**: Single worker processes both job types
- **Consistent UI**: Same job status display and download functionality

### Future Enhancements
- Advanced image analysis and content extraction
- Multiple portfolio template options
- Batch processing optimizations
- Real-time collaboration features

## Testing

### Manual Testing
1. Visit `/image-test` page
2. Test all image input methods
3. Verify job status updates
4. Test download functionality
5. Verify error handling

### Automated Testing
- Unit tests for image validation
- Integration tests for API endpoints
- Worker processing tests
- UI component tests

## Performance Considerations

### Memory Management
- Images processed in memory only
- Immediate cleanup after processing
- Efficient base64 handling
- Optimized image compression

### Scalability
- Concurrent job processing (up to 3 jobs)
- Queue-based processing with BullMQ
- Database connection pooling
- Redis for job queue management 