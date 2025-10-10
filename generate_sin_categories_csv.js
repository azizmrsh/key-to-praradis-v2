const fs = require('fs');
const path = require('path');

// Import the self assessment data
const { selfAssessmentQuestions, categoryInfo } = require('./client/src/data/selfAssessmentData.ts');

// Function to generate CSV for sin categories and subcategories
function generateSinCategoriesCSV() {
  const csvData = [];
  
  // Add CSV headers
  csvData.push('Main_Category_Key,Main_Category_Title,Main_Category_Description,Subcategory_Key,Subcategory_Name,Question_Count');
  
  // Group questions by main category and subcategory
  const categoryStructure = {};
  
  // Initialize structure for each main category
  Object.keys(categoryInfo).forEach(categoryKey => {
    categoryStructure[categoryKey] = {
      title: categoryInfo[categoryKey].title,
      description: categoryInfo[categoryKey].description,
      subcategories: {}
    };
  });
  
  // Process all questions to collect subcategories
  selfAssessmentQuestions.forEach(question => {
    const mainCategory = question.category;
    const subcategory = question.section;
    
    if (!categoryStructure[mainCategory].subcategories[subcategory]) {
      categoryStructure[mainCategory].subcategories[subcategory] = {
        questions: []
      };
    }
    
    categoryStructure[mainCategory].subcategories[subcategory].questions.push(question.id);
  });
  
  // Generate CSV rows
  Object.keys(categoryStructure).forEach(categoryKey => {
    const category = categoryStructure[categoryKey];
    
    Object.keys(category.subcategories).forEach(subcategoryName => {
      const subcategory = category.subcategories[subcategoryName];
      const subcategoryKey = `${categoryKey}_${subcategoryName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
      
      csvData.push([
        categoryKey,
        `"${category.title}"`,
        `"${category.description}"`,
        subcategoryKey,
        `"${subcategoryName}"`,
        subcategory.questions.length
      ].join(','));
    });
  });
  
  return csvData.join('\n');
}

// Generate the CSV
const csvContent = generateSinCategoriesCSV();

// Write to file
fs.writeFileSync('sin_categories_structure.csv', csvContent);

console.log('CSV file generated successfully: sin_categories_structure.csv');
console.log('Preview:');
console.log(csvContent.split('\n').slice(0, 10).join('\n'));