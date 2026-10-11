export const CH = ['About you', 'Your experience', 'Lifestyle & wishes', 'Stay connected']
export const DET = ['Freshness of produce', 'Taste', 'Packaging & presentation', 'Delivery & timing', 'Value for money']
export const RL = ['', 'Not what we hoped', 'Could be better', 'It was good', 'Really enjoyed it', 'Absolutely perfect']
export const L = 'ABCDEFGHIJKLMNOP'
export const ROM = ['I', 'II', 'III', 'IV']
export const pad = (n) => String(n).padStart(2, '0')

/* req = required, bonus = optional bonus question, last = submits the form */
export const S = [
  { k: 'name', ch: 0, t: 'What is your full name?', type: 'text', req: 1, ph: 'Your full name' },
  { k: 'phone', ch: 0, t: 'What is your WhatsApp / phone number?', type: 'tel', req: 1, ph: '080 0000 0000' },
  { k: 'email', ch: 0, t: 'What is your email address?', type: 'email', ph: 'you@email.com' },
  { k: 'birthday', ch: 0, t: 'When is your birthday?', sub: 'So we can send you something special on your day.', type: 'date', req: 1 },
  { k: 'contact', ch: 0, t: 'How would you prefer us to contact you?', type: 'radio', req: 1, o: ['WhatsApp', 'SMS', 'Email', 'Phone call'] },
  { k: 'found', ch: 1, t: 'How did you first discover Frootshive?', type: 'radio', req: 1, o: ['TikTok', 'Instagram', 'WhatsApp', 'Friend / Family', 'Someone gifted me a Frootshive order', 'Event', 'Google / Search', 'Other'] },
  { k: 'bought', ch: 1, t: 'What have you purchased from Frootshive?', sub: 'Select all that apply.', type: 'check', req: 1, o: ['Fruit baskets', 'Fruit cups', 'Fruit bowls', 'Fruit salads', 'Vegetable salads', 'Fruit packs', 'Hampers / Gifts', 'Other'] },
  { k: 'frequency', ch: 1, bonus: 1, t: 'How often do you order from Frootshive?', type: 'radio', o: ['This is my first time', 'Occasionally', 'Monthly', 'Weekly', 'Several times a week'] },
  { k: 'rating', ch: 1, t: 'How would you rate your overall Frootshive experience?', type: 'rate', req: 1 },
  { k: 'details', ch: 1, bonus: 1, t: "Let's look at the details.", sub: 'Tap to rate each one. 1 is poor, 5 is excellent.', type: 'multirate' },
  { k: 'nps', ch: 1, bonus: 1, t: 'How likely are you to recommend Frootshive to a friend or colleague?', type: 'nps' },
  { k: 'feedback', ch: 1, t: 'What did you love about your experience, and what could we improve?', type: 'area', ph: 'Share your thoughts, the good and the not-so-good…' },
  { k: 'dietary', ch: 2, bonus: 1, t: 'Do you follow any dietary or lifestyle preferences?', sub: 'Helps us plan healthier options for you. Select all that apply.', type: 'check', o: ['Plant-based / vegan', 'Vegetarian', 'Low sugar', 'Diabetic-friendly', 'Gluten-free', 'Weight management', 'Active / fitness lifestyle', 'Pregnancy / nursing', 'Food allergies', 'No particular preference', 'Other'] },
  { k: 'future', ch: 2, t: 'What would you most love to see Frootshive offer in the future?', sub: 'Select all that apply.', type: 'check', o: ['Fresh juices', 'Smoothies', 'More fruit bowls', 'Healthy snacks', 'Healthy breakfast', 'Fruit subscriptions', 'Office / workplace packages', 'Event catering', 'More gifting options', 'Other'] },
  { k: 'area', ch: 2, bonus: 1, t: 'Which area do you usually order to?', sub: 'Helps us plan delivery and future pick-up points.', type: 'text', ph: 'Your area or neighbourhood' },
  { k: 'testimonial', ch: 3, bonus: 1, t: 'May we share your kind words on our page?', type: 'radio', o: ['Yes, you may share my feedback', 'Yes, but please keep my name private', 'Please keep my feedback private'] },
  { k: 'updates', ch: 3, last: 1, t: 'Would you like to receive occasional updates, special offers and birthday surprises from Frootshive?', type: 'radio', req: 1, o: ["Yes, I'd love that!", 'No, thank you'] },
]

/* floating fruit backdrop: [symbol, position, size, rotation, delay, extra class] */
export const BACKDROP = [
  ['berry', { left: -26, top: '9%' }, 92, -18, 0],
  ['orange', { right: -38, top: '19%' }, 118, 14, 1.2],
  ['kiwi', { left: -44, top: '42%' }, 106, -8, 2.1],
  ['cherry', { right: -12, top: '56%' }, 84, 16, 0.6],
  ['lemon', { left: -26, top: '76%' }, 90, -12, 1.8],
  ['melon', { right: -34, bottom: '3%' }, 118, -10, 2.7],
  ['pine', { right: '24%', top: -26 }, 100, 10, 3.2],
  ['berry', { right: '12%', bottom: -22 }, 92, 24, 0.9, 'd'],
  ['orange', { left: '46%', top: '3%' }, 72, -20, 1.4, 'd'],
  ['kiwi', { right: '5%', top: '46%' }, 84, 12, 2.4, 'd'],
  ['lemon', { left: '41%', bottom: '5%' }, 76, 20, 3, 'd'],
  ['cherry', { left: '38%', top: '44%' }, 70, -10, 1, 'd'],
]
