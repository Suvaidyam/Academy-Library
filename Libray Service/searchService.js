import { SearchService } from '../models/searchData.js';

/**
 * Search Service Implementation
 * Handles search operations and data management
 */
class LibrarySearchService {
  constructor() {
    this.searchService = new SearchService();
    this.initializeSampleData();
  }
  
  // Initialize with sample data
  initializeSampleData() {
    // This would typically come from an API or database
    // For this demo, we'll create some sample data
    
    // Create file type mappings
    this.fileTypeMappings = {
      'doc': ['doc', 'docx', 'txt'],
      'pdf': ['pdf'],
      'video': ['mp4', 'mov', 'avi', 'wmv'],
      'presentation': ['ppt', 'pptx', 'keynote'],
      'activity': ['activity', 'exercise', 'quiz']
    };
    
    // Import sample data
    import('../data/sampleData.js')
      .then(module => {
        const sampleData = module.default;
        this.loadSampleData(sampleData);
      })
      .catch(error => {
        console.error('Failed to load sample data:', error);
        // Fall back to minimal data if import fails
        this.loadMinimalData();
      });
  }
  
  // Load minimal fallback data
  loadMinimalData() {
    // Implement a minimal set of data in case the import fails
  }
  
  // Load sample data into the search service
  loadSampleData(data) {
    // Implementation to load sample data into the search service
  }
  
  // Search for resources by term
  search(term, typeFilter = 'all') {
    return this.searchService.searchByTermAndType(term, typeFilter);
  }
  
  // Get all courses for dropdown
  getCourses() {
    return this.searchService.getCourses();
  }
  
  // Get modules for a specific course
  getModules(courseId) {
    return this.searchService.getCourseModules(courseId);
  }
  
  // Get topics for a specific module
  getTopics(moduleId) {
    return this.searchService.getModuleTopics(moduleId);
  }
  
  // Get chapters for a specific topic
  getChapters(topicId) {
    return this.searchService.getTopicChapters(topicId);
  }
  
  // Get file type from extension
  getFileTypeFromExtension(extension) {
    for (const [type, extensions] of Object.entries(this.fileTypeMappings)) {
      if (extensions.includes(extension.toLowerCase())) {
        return type;
      }
    }
    return 'unknown';
  }
  
  // Get icon for a file type
  getIconForFileType(type) {
    const icons = {
      'doc': '📄',
      'pdf': '📑',
      'video': '🎬',
      'presentation': '📊',
      'activity': '✏️',
      'unknown': '📁'
    };
    
    return icons[type] || icons.unknown;
  }
}

// Export a singleton instance
const searchService = new LibrarySearchService();
export default searchService;