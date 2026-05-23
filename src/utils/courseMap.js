export const COURSE_MAP = {
  'All courses': null,
  Starter: ['Starter', 'Side'],
  'Main course': [
    'Beef',
    'Chicken',
    'Lamb',
    'Pork',
    'Seafood',
    'Goat',
    'Pasta',
    'Miscellaneous',
    'Vegan',
    'Vegetarian',
  ],
  Dessert: ['Dessert', 'Breakfast'],
  'Side dish': ['Side'],
  Breakfast: ['Breakfast'],
};

export function getCourseLabel(strCategory) {
  for (const [course, categories] of Object.entries(COURSE_MAP)) {
    if (course === 'All courses') continue;
    if (categories.includes(strCategory)) return course;
  }
  return strCategory;
}
