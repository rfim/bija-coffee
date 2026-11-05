/* Bija shop layer, shared by the website pages.
   Products, basket (localStorage 'bija.shop.cart'), orders ('bija.shop.orders'), header, basket drawer, footer and product cards.
   Prices include VAT. The checkout is a demo: no payment is taken and nothing leaves this browser. */
(() => {
  // the Bija wordmark as on the shop front at St James's Market (traced from a photo of the fascia), same as the app header
  const WORDMARK = '<svg class="wordmark" viewBox="0 0 170.5 100" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M7.5 99.1C7.5 99.1 6.9 99.0 6.2 99.0C4.7 98.8 4.1 98.6 4.0 98.1C3.9 97.4 3.8 97.1 3.7 96.1C3.7 95.6 3.6 94.7 3.6 94.2C3.6 93.8 3.5 90.5 3.5 87.1C3.4 83.6 3.4 80.4 3.4 80.1C3.3 79.4 3.2 77.5 3.1 73.6C3.0 72.4 3.0 71.2 2.9 71.1C2.9 70.9 2.8 69.7 2.8 68.5C2.8 67.3 2.7 65.6 2.7 64.9C2.7 64.2 2.6 62.2 2.5 60.6C2.5 57.7 2.4 55.9 2.3 55.3C2.2 54.9 2.1 52.2 2.0 47.2C2.0 44.7 1.9 42.1 1.9 41.4C1.9 40.7 1.8 38.4 1.8 36.3C1.7 34.2 1.6 31.7 1.6 30.7C1.6 29.7 1.5 27.4 1.5 25.6C1.4 21.3 1.3 17.3 1.2 16.2C1.2 15.8 1.1 13.4 1.1 11.0C1.0 8.5 1.0 6.4 0.9 6.2C0.9 6.0 0.8 5.0 0.8 3.9C0.7 0.8 0.9 0.7 4.6 0.8C5.9 0.9 7.5 1.0 8.1 1.0C8.8 1.1 10.6 1.1 12.2 1.1C13.8 1.2 15.2 1.2 15.3 1.2C15.4 1.3 17.0 1.3 18.9 1.4C20.8 1.4 22.9 1.4 23.5 1.5C24.1 1.5 26.2 1.6 28.2 1.6C30.1 1.6 31.8 1.7 31.8 1.7C31.9 1.8 32.9 1.8 34.0 1.9C36.5 2.0 38.7 2.2 40.2 2.4C40.9 2.5 41.7 2.6 42.0 2.7C43.1 2.8 45.0 3.2 45.7 3.5C46.0 3.7 46.4 3.8 46.5 3.8C47.5 3.8 51.0 5.6 53.9 7.4C54.7 8.0 55.5 8.5 55.7 8.6C56.3 8.9 58.6 11.1 59.5 12.2C61.2 14.4 61.5 15.0 62.3 16.5C64.8 21.7 65.4 27.6 63.9 33.6C63.4 35.8 63.3 36.1 62.1 37.8C60.0 40.9 57.7 43.1 54.2 45.4C50.6 47.7 50.5 49.2 53.7 50.0C54.3 50.2 55.5 50.7 56.3 51.1C57.1 51.5 58.0 51.9 58.3 51.9C59.2 52.2 62.1 54.3 63.6 55.7C66.6 58.8 68.9 63.0 69.4 66.4C69.5 66.8 69.7 67.6 69.9 68.3C70.6 70.9 70.3 78.0 69.4 80.1C69.2 80.4 68.9 81.4 68.6 82.1C67.6 85.2 66.5 86.9 64.0 89.6C61.6 92.0 61.4 92.3 60.4 92.8C60.0 93.1 59.3 93.5 59.0 93.8C57.8 94.6 55.5 95.7 52.9 96.6C48.5 98.1 48.3 98.1 42.7 98.2C39.2 98.2 37.7 98.3 36.9 98.4C36.4 98.5 33.2 98.6 24.0 98.7C17.2 98.7 15.2 98.8 13.6 99.0C12.8 99.0 7.6 99.2 7.5 99.1ZM90.8 98.8C90.7 98.8 90.1 98.7 89.4 98.6C87.8 98.4 87.6 98.4 86.6 98.2C85.5 97.9 81.1 95.7 80.6 95.2C80.3 94.9 79.8 94.6 79.3 94.4C78.7 94.1 78.3 93.8 77.9 93.3C77.0 92.1 77.2 91.6 79.2 89.5C81.0 87.7 82.4 86.7 83.0 86.7C83.6 86.7 83.9 87.0 85.3 89.0C86.5 90.8 87.5 91.8 88.7 92.6C88.9 92.7 89.3 93.0 89.6 93.2C90.6 94.0 92.8 94.6 95.2 94.7C96.9 94.8 96.9 94.8 97.8 94.4C98.9 93.8 100.4 92.4 100.8 91.4C101.4 90.1 101.7 87.4 101.4 85.5C101.3 85.3 101.3 83.9 101.2 82.3C101.1 79.1 101.0 76.3 101.0 74.6C100.8 71.5 100.6 52.5 100.6 43.4C100.6 37.4 100.6 36.8 100.8 36.2C101.1 35.4 101.8 34.8 103.4 34.1C105.4 33.2 106.3 32.8 108.1 31.9C110.3 30.9 110.5 30.8 110.8 31.2C111.2 31.5 111.2 32.1 111.3 37.1C111.4 39.5 111.4 41.6 111.5 41.8C111.6 42.2 111.6 45.1 111.7 49.5C111.8 51.7 111.8 53.6 111.8 53.8C111.9 54.0 111.9 55.7 112.0 57.5C112.0 59.4 112.1 62.9 112.2 65.3C112.3 72.8 112.2 77.5 111.7 79.9C111.5 80.6 111.3 81.8 111.2 82.6C110.8 85.4 109.1 89.9 107.7 92.0C105.3 95.5 101.6 97.7 96.4 98.4C96.1 98.5 95.3 98.6 94.6 98.7C93.5 98.9 90.9 99.0 90.8 98.8ZM135.3 97.5C133.8 97.4 133.1 97.3 132.5 97.1C131.9 96.9 127.6 94.8 127.1 94.4C126.6 94.0 125.7 92.8 125.1 91.8C124.8 91.3 124.4 90.7 124.2 90.3C123.6 89.5 123.3 88.9 123.2 88.3C123.1 88.0 122.8 87.3 122.6 86.8C121.8 85.2 121.6 84.1 121.7 81.2C121.7 78.7 121.9 77.4 122.6 75.7C122.7 75.3 123.0 74.4 123.2 73.7C123.6 72.1 124.4 70.3 125.3 69.1C125.7 68.6 126.2 67.9 126.4 67.6C129.4 63.2 136.3 58.3 143.0 55.7C143.9 55.3 145.0 54.9 145.4 54.7C145.8 54.5 147.4 53.9 148.8 53.4C152.1 52.3 152.9 51.9 153.7 51.2C154.7 50.2 154.9 49.6 154.8 47.1C154.8 45.9 154.7 44.8 154.7 44.7C154.6 44.3 154.5 43.4 154.4 42.1C154.4 41.6 154.3 41.0 154.3 40.9C154.2 40.7 154.1 40.2 154.1 39.8C153.9 38.8 153.6 37.4 153.3 36.7C153.2 36.4 153.1 35.8 153.1 35.4C152.9 33.5 152.8 33.3 152.2 32.7C152.1 32.6 151.7 32.0 151.2 31.5C149.3 29.3 148.7 28.9 146.8 28.7C146.1 28.6 145.5 28.5 145.4 28.5C144.9 28.1 142.3 28.5 140.8 29.2C137.1 30.7 134.2 35.1 133.0 41.0C132.8 42.4 132.5 42.7 130.7 42.9C128.8 43.1 124.6 42.9 124.2 42.7C123.4 42.2 123.8 40.3 125.3 37.2C126.7 34.1 127.8 32.7 130.2 30.4C132.5 28.2 133.6 27.6 136.8 26.6C141.3 25.1 142.1 24.9 144.5 24.9C147.0 24.9 148.8 25.0 150.0 25.3C150.5 25.4 151.6 25.6 152.5 25.8C155.0 26.3 157.2 27.2 158.0 28.0C158.2 28.1 158.7 28.5 159.3 28.9C161.2 30.3 162.3 31.6 163.3 33.9C163.7 34.9 164.7 39.0 164.8 40.0C164.8 40.6 164.9 41.3 164.9 41.6C165.0 42.0 165.0 42.8 165.2 48.2C165.2 49.4 165.3 50.5 165.3 50.7C165.4 50.8 165.4 52.4 165.5 54.1C165.6 59.8 165.7 64.4 165.8 65.7C166.1 68.1 166.1 71.3 166.2 80.4C166.3 83.8 166.3 86.6 166.4 86.6C166.4 86.7 166.5 87.2 166.5 87.8C166.7 89.9 167.3 91.3 168.5 93.0C169.6 94.5 169.8 94.9 169.4 95.2C169.2 95.3 168.9 95.4 168.8 95.4C168.6 95.4 166.9 95.4 165.0 95.5C161.0 95.5 161.1 95.5 159.5 94.1C157.8 92.5 157.0 91.4 156.6 89.3C156.3 87.8 156.2 87.7 155.7 87.5C154.7 87.1 154.4 87.3 151.7 90.4C149.5 92.8 147.2 94.5 144.0 96.1C141.4 97.4 138.8 97.8 135.3 97.5ZM34.3 92.8C34.9 92.7 35.7 92.6 36.1 92.6C38.9 92.6 41.7 92.0 45.2 90.7C48.6 89.4 49.8 88.7 52.0 86.5C55.1 83.4 56.5 80.3 56.5 76.9C56.5 75.4 56.3 72.8 56.3 72.7C56.2 72.7 56.2 72.2 56.1 71.7C56.1 71.2 56.0 70.6 56.0 70.3C56.0 70.0 55.9 69.5 55.9 69.0C55.8 67.9 55.6 67.2 55.2 66.4C55.0 66.0 54.8 65.4 54.7 65.0C54.6 64.7 54.4 64.2 54.3 64.0C54.2 63.8 54.0 63.4 53.9 63.1C53.5 62.0 52.5 60.2 51.9 59.4C51.5 58.9 51.0 58.3 50.9 58.0C49.9 56.3 46.8 54.0 44.4 53.2C43.9 53.1 43.1 52.7 42.5 52.4C41.4 51.8 40.5 51.6 38.7 51.4C38.4 51.3 38.1 51.3 38.0 51.2C37.8 51.2 37.3 51.1 36.4 50.9C35.6 50.8 29.6 50.8 28.2 50.9C27.6 51.0 26.0 50.9 24.8 50.9C17.6 50.4 17.0 50.6 16.3 52.4C16.0 53.2 16.0 53.3 16.0 58.3C16.1 61.1 16.1 63.6 16.1 63.7C16.2 64.1 16.3 67.3 16.4 72.0C16.4 74.2 16.5 76.0 16.5 76.0C16.6 76.1 16.7 79.8 16.8 84.5C16.8 86.4 16.9 88.1 16.9 88.3C17.0 88.4 17.0 89.3 17.0 90.1C17.1 91.8 17.4 92.7 18.0 93.0C18.5 93.3 32.8 93.1 34.3 92.8ZM144.3 90.2C145.9 89.9 146.9 89.6 148.0 88.9C148.5 88.6 148.9 88.4 149.0 88.4C149.1 88.4 149.9 87.8 151.0 86.9C151.5 86.4 152.3 85.8 152.6 85.6C154.0 84.5 154.8 83.7 155.2 82.7C155.7 81.7 155.7 81.7 155.7 77.8C155.7 75.7 155.6 73.6 155.6 73.2C155.6 72.7 155.5 70.7 155.5 68.7C155.4 64.7 155.3 63.0 155.2 62.5C155.2 62.3 155.1 60.9 155.1 59.4C155.1 56.4 155.0 56.3 154.2 55.8C153.8 55.5 153.7 55.5 153.0 55.6C151.4 55.9 146.4 58.6 143.0 60.9C139.2 63.6 137.8 64.8 136.6 66.6C136.2 67.2 135.6 68.1 135.3 68.5C133.1 71.3 132.4 74.4 132.7 78.7C132.9 80.9 133.3 82.0 135.1 85.5C135.4 86.1 136.6 87.7 137.0 88.0C138.1 89.0 140.0 90.1 140.6 90.2C142.4 90.4 142.9 90.4 144.3 90.2ZM79.4 74.6C79.1 74.3 79.1 74.1 79.1 73.0C79.1 72.3 79.0 71.5 79.0 71.4C79.0 71.2 78.9 69.0 78.9 66.5C78.8 64.0 78.8 61.7 78.7 61.3C78.7 60.9 78.6 55.7 78.6 49.8C78.6 43.9 78.5 38.9 78.5 38.8C78.2 37.8 79.1 36.8 81.1 36.0C82.2 35.6 84.3 34.5 86.4 33.5C88.3 32.5 88.8 32.4 89.0 32.8C89.1 32.9 89.2 34.4 89.2 36.1C89.3 37.8 89.3 39.5 89.4 39.8C89.4 40.3 89.6 44.3 89.7 47.4C89.7 48.2 89.7 49.7 89.8 50.7C89.8 51.7 89.9 53.6 89.9 54.9C90.0 56.2 90.0 57.9 90.1 58.7C90.3 63.9 90.3 69.2 90.1 69.8C89.9 70.4 88.9 71.2 88.5 71.2C88.4 71.2 87.7 71.5 86.9 71.9C85.0 72.8 84.3 73.1 84.2 73.1C84.2 73.1 83.6 73.4 82.9 73.7C81.6 74.3 80.1 74.8 79.8 74.8C79.7 74.8 79.5 74.7 79.4 74.6ZM30.9 45.9C31.6 45.9 32.9 45.9 33.7 46.0C36.3 46.0 39.4 45.4 42.3 44.3C45.4 43.0 47.0 41.8 48.8 39.3C50.0 37.6 51.2 34.6 51.4 32.7C51.5 30.8 51.4 25.3 51.2 24.1C51.2 24.0 51.1 23.7 51.1 23.3C51.0 22.4 50.6 21.1 50.5 20.9C50.4 20.8 50.1 20.0 49.7 19.1C48.7 16.6 48.6 16.5 47.6 15.2C46.3 13.3 46.0 13.1 45.2 12.6C44.7 12.3 44.3 12.1 44.2 12.0C42.9 10.9 41.1 9.7 40.4 9.4C40.1 9.3 39.8 9.1 39.7 9.1C39.3 8.7 36.6 7.9 35.1 7.7C34.3 7.6 33.3 7.5 32.9 7.4C32.5 7.3 31.7 7.2 31.0 7.1C30.3 7.1 29.6 7.0 29.3 6.9C29.1 6.9 27.5 6.8 25.8 6.8C24.0 6.8 22.5 6.7 22.4 6.7C21.8 6.6 20.4 6.5 18.7 6.4C16.2 6.3 15.7 6.5 15.1 7.4C14.4 8.5 14.3 9.1 14.5 12.9C14.5 14.0 14.6 15.9 14.7 17.2C14.7 18.4 14.8 20.0 14.8 20.7C14.8 21.4 14.9 24.4 14.9 27.4C15.0 30.4 15.0 33.2 15.1 33.6C15.1 34.0 15.1 35.8 15.2 37.5C15.2 39.3 15.3 41.1 15.4 41.5C15.4 41.9 15.5 42.8 15.6 43.4C15.7 45.7 16.6 46.2 19.7 45.8C20.7 45.7 21.9 45.7 22.5 45.8C23.2 45.8 24.3 45.9 25.0 45.9C25.7 45.9 26.4 46.0 26.4 46.0C26.4 46.1 27.2 46.1 28.0 46.0C28.9 46.0 30.1 45.9 30.9 45.9ZM104.1 18.8C102.7 18.5 102.2 18.2 101.5 17.5C99.5 15.5 98.9 13.9 99.1 11.5C99.1 10.4 99.9 7.9 100.4 7.1C102.7 3.2 106.9 3.0 109.4 6.6C109.6 6.9 109.9 7.3 110.1 7.5C111.1 8.4 111.6 11.6 111.2 13.8C110.7 16.1 109.8 17.4 107.8 18.4C106.4 19.1 105.4 19.2 104.1 18.8ZM81.5 18.1C79.4 17.4 77.9 16.2 77.7 15.2C77.6 15.0 77.5 14.7 77.5 14.6C76.6 13.0 76.5 10.9 77.1 9.0C78.6 4.7 80.5 3.0 83.4 3.5C85.1 3.8 87.2 5.4 87.8 6.8C87.9 7.0 88.2 7.5 88.4 7.9C89.1 8.9 89.2 9.4 89.2 11.2C89.2 14.4 88.9 15.1 87.3 16.7C85.3 18.6 83.9 19.0 81.5 18.1Z"/></svg>';
  // ---------- catalogue (tasting notes and origin facts match the app's bean data) ----------
  const P = [
    { id: 'house', name: 'Bija House Blend', type: 'blend', price: 12, size: '200 g', where: 'Indonesia', notes: ['Balanced', 'Chocolate', 'Caramel'], region: 'Indonesian blend', altitude: 'Various', process: 'Mixed', use: 'Our espresso at the bar', blurb: 'The coffee we pour every day at the bar: round, chocolatey and easy with milk.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'kawung' } },
    { id: 'mandheling', name: 'Sumatra Mandheling', type: 'origin', origin: 'mandheling', price: 12, size: '200 g', where: 'North Sumatra', notes: ['Dark chocolate', 'Earthy', 'Syrupy'], region: 'North Sumatra, named after the Mandailing people', altitude: '1,100–1,500 m', process: 'Wet-hulled (giling basah)', use: 'Espresso, milk drinks', blurb: 'Deep and syrupy, the classic Sumatran cup.', art: { bag: '#0b0b0b', ink: '#ffffff', pat: 'parang' } },
    { id: 'lintong', name: 'Sumatra Lintong', type: 'origin', origin: 'lintong', price: 12, size: '200 g', where: 'North Sumatra', notes: ['Herbal', 'Cocoa', 'Heavy body'], region: 'Lintong Nihuta, south-west of Lake Toba, North Sumatra', altitude: '1,200–1,500 m', process: 'Wet-hulled (giling basah)', use: 'Espresso, cafetière', blurb: 'Grown above Lake Toba: herbal, cocoa-rich and full-bodied with low acidity.', art: { bag: '#2a2a2a', ink: '#ffffff', pat: 'contour' } },
    { id: 'java', name: 'Old Brown Java', type: 'origin', origin: 'java', price: 12, size: '200 g', where: 'Java', notes: ['Woody', 'Spice', 'Very low acidity'], region: 'Java, aged after harvest', altitude: '1,000–1,600 m', process: 'Aged for years before roasting', use: 'Espresso, iced coffee', blurb: 'Aged before roasting for a mellow, woody cup with gentle spice.', art: { bag: '#d9d9d6', ink: '#0b0b0b', pat: 'toraja' } },
    { id: 'set', name: 'Discovery set', type: 'set', price: 33, size: '3 × 200 g', where: 'Sumatra and Java', notes: ['Mandheling', 'Lintong', 'Old Brown Java'], contains: ['mandheling', 'lintong', 'java'], blurb: 'Three single origins side by side: Sumatra Mandheling, Sumatra Lintong and Old Brown Java. A set of three 200 g bags.', art: { set: true } },
    { id: 'gift', name: 'Gift subscription', type: 'gift', price: 36, size: '3 × 200 g over 3 months', where: 'Indonesia', notes: ['3 bags', '1 a month', 'Delivery included'], blurb: 'Three bags over three months, one a month, prepaid with delivery included. We choose a different Indonesian coffee each month.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'kawung', ribbon: true } },
    { id: 'gayo', name: 'Aceh Gayo', type: 'origin', origin: 'gayo', soon: true, price: 12, size: '200 g', where: 'Aceh, Sumatra', notes: ['Spice', 'Cedar', 'Dark sugar'], region: 'Gayo highlands around Lake Laut Tawar, Aceh', altitude: '1,200–1,600 m', process: 'Wet-hulled or washed', use: 'Filter, espresso', blurb: 'From the Gayo highlands of Aceh. Coming soon.', art: { bag: '#0b0b0b', ink: '#ffffff', pat: 'dots' } },
    { id: 'kintamani', name: 'Bali Kintamani', type: 'origin', origin: 'kintamani', soon: true, price: 12, size: '200 g', where: 'Bali', notes: ['Citrus', 'Brown sugar', 'Bright'], region: 'Kintamani highlands near Mount Batur, Bali', altitude: '1,200–1,600 m', process: 'Washed or natural', use: 'Filter', blurb: 'Bright and citrusy, from the volcanic slopes of Mount Batur. Coming soon.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'grid' } },
  ];
  const GRINDS = ['Whole bean', 'Espresso', 'Moka pot', 'Filter', 'Cafetière', 'V60', 'AeroPress'];
  const PLANS = { once: 'One-off', '2w': 'Every 2 weeks', '3w': 'Every 3 weeks', '4w': 'Every 4 weeks' };
  const BREW = {
    'Whole bean': 'Grind just before you brew. Keep the bag sealed, away from light and heat, and enjoy within a month of opening.',
    Espresso: '18 g in, 36 to 40 g out in 25 to 30 seconds. Go finer if it runs fast, coarser if it chokes.',
    'Moka pot': 'Fill the basket level without tamping. Start with hot water in the base, medium heat, lid open; take it off as soon as it starts to gurgle.',
    Filter: '60 g of coffee per litre of water just off the boil. Rinse the paper first.',
    Cafetière: '30 g to 500 ml of water just off the boil. Stir, wait four minutes, skim the crust, plunge slowly.',
    V60: '15 g to 250 g of water at about 94°C. Bloom with 40 g for 45 seconds, then pour in slow circles. Aim for 2½ to 3 minutes in total.',
    AeroPress: '15 g to 200 g of water at 85 to 90°C. Stir, steep for 1½ to 2 minutes, press gently for about 30 seconds.',
  };
  const SUB_OFF = 0.1, POST = 3.95, FREE_AT = 30, PTS = 10;
  const r2 = (n) => Math.round(n * 100) / 100;
  const money = (n) => '£' + (+n || 0).toFixed(2);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  };
  const byId = (id) => P.find((p) => p.id === id);
  const canSub = (p) => p && p.type !== 'gift';
  const unit = (p, plan) => (plan && plan !== 'once' && canSub(p) ? r2(p.price * (1 - SUB_OFF)) : p.price);
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- basket ----------
  function cart() {
    const raw = store.get('bija.shop.cart', []);
    const out = [];
    (Array.isArray(raw) ? raw : []).forEach((i) => {
      const p = byId(i && i.id); if (!p || p.soon) return;
      const grind = GRINDS.includes(i.grind) ? i.grind : GRINDS[0];
      const plan = canSub(p) && PLANS[i.plan] ? i.plan : 'once';
      const qty = Math.max(1, Math.min(20, Math.floor(+i.qty || 1)));
      const same = out.find((o) => o.id === p.id && o.grind === grind && o.plan === plan);
      if (same) same.qty = Math.min(20, same.qty + qty); else out.push({ id: p.id, grind, qty, plan });
    });
    return out;
  }
  function saveCart(c) { store.set('bija.shop.cart', c); store.set('bija.shop.cart', cart()); paint(); }
  function add(id, o = {}) {
    const p = byId(id); if (!p || p.soon) return;
    const c = cart(); c.push({ id, grind: o.grind || GRINDS[0], qty: o.qty || 1, plan: o.plan || 'once' });
    saveCart(c);
    toast(`Added to your basket: ${p.name}${o.grind && o.grind !== GRINDS[0] ? ' (' + o.grind + ')' : ''}`);
    document.querySelectorAll('.cartbtn').forEach((b) => { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
  }
  function lines(c = cart()) {
    return c.map((i) => { const p = byId(i.id), u = unit(p, i.plan); return { ...i, name: p.name, unit: u, total: r2(u * i.qty), p }; });
  }
  // free delivery on £30+, on any order with a subscription, and on gift subscriptions (delivery included)
  function totals(method = 'post', ls = lines()) {
    const subtotal = r2(ls.reduce((a, l) => a + l.total, 0));
    const needsPost = ls.some((l) => l.p.type !== 'gift');
    const free = method === 'collect' || !needsPost || subtotal >= FREE_AT || ls.some((l) => l.plan !== 'once');
    const fee = ls.length && !free ? POST : 0;
    return { subtotal, fee, total: r2(subtotal + fee), pts: Math.round(subtotal * PTS), toFree: Math.max(0, r2(FREE_AT - subtotal)), hasSub: ls.some((l) => l.plan !== 'once') };
  }
  const count = () => cart().reduce((a, i) => a + i.qty, 0);

  // ---------- art: a black and white bag with a batik pattern and the Bija mark, no words ----------
  let uid = 0;
  const MARK = '<circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/>';
  const PATS = {
    kawung: (c) => `<pattern id="%" width="28" height="28" patternUnits="userSpaceOnUse"><g fill="${c}" fill-opacity=".22"><ellipse cx="14" cy="6.5" rx="3.6" ry="6"/><ellipse cx="14" cy="21.5" rx="3.6" ry="6"/><ellipse cx="6.5" cy="14" rx="6" ry="3.6"/><ellipse cx="21.5" cy="14" rx="6" ry="3.6"/></g></pattern>`,
    parang: (c) => `<pattern id="%" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path d="M-4 11 Q1.5 4 7 11 T18 11 T29 11" fill="none" stroke="${c}" stroke-opacity=".28" stroke-width="3"/></pattern>`,
    contour: (c) => `<pattern id="%" width="60" height="22" patternUnits="userSpaceOnUse"><path d="M0 16 Q15 4 30 12 T60 9" fill="none" stroke="${c}" stroke-opacity=".3" stroke-width="1.4"/></pattern>`,
    toraja: (c) => `<pattern id="%" width="24" height="24" patternUnits="userSpaceOnUse"><g fill="none" stroke="${c}" stroke-opacity=".28" stroke-width="2"><path d="M0 12 L6 6 L12 12 L18 6 L24 12"/><circle cx="12" cy="19" r="2.5"/></g></pattern>`,
    dots: (c) => `<pattern id="%" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="${c}" fill-opacity=".3"/><circle cx="11" cy="11" r="3" fill="${c}" fill-opacity=".18"/></pattern>`,
    grid: (c) => `<pattern id="%" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0V14" fill="none" stroke="${c}" stroke-opacity=".22" stroke-width="1"/></pattern>`,
  };
  function bagShape(a, x = 0, s = 1) {
    const id = 'bp' + ++uid, pat = PATS[a.pat](a.ink).replace('%', id);
    return `<g transform="translate(${x} 0) scale(${s})"><defs>${pat}</defs>
      <rect x="42" y="30" width="116" height="22" rx="3" fill="${a.bag}"/><path d="M48 34v14M58 34v14M68 34v14M78 34v14M88 34v14M98 34v14M108 34v14M118 34v14M128 34v14M138 34v14M148 34v14" stroke="${a.ink}" stroke-opacity=".18" stroke-width="2"/>
      <path d="M40 50 H160 L166 244 Q100 254 34 244 Z" fill="${a.bag}"/><path d="M40 50 H160 L166 244 Q100 254 34 244 Z" fill="url(#${id})"/>
      <path d="M40 50 H70 L64 246 Q48 246 34 244 Z" fill="#fff" fill-opacity=".06"/>
      <rect x="64" y="112" width="72" height="84" rx="4" fill="${a.bag}" stroke="${a.ink}" stroke-opacity=".5"/>
      <g transform="translate(78 132) scale(.44)" fill="none" stroke="${a.ink}" stroke-width="4">${MARK}</g>
      <circle cx="100" cy="76" r="6" fill="none" stroke="${a.ink}" stroke-opacity=".35" stroke-width="2"/>
      ${a.ribbon ? `<g fill="none" stroke="${a.ink}" stroke-width="7"><path d="M100 52 V246"/><path d="M38 150 H164"/></g><g fill="none" stroke="${a.ink}" stroke-width="5"><path d="M100 52 C70 20 62 54 100 52 C138 54 130 20 100 52 Z"/></g>` : ''}</g>`;
  }
  function bagArt(p) {
    if (p.art.set) {
      const arts = p.contains.map((id) => byId(id).art);
      return `<svg class="bag" viewBox="0 0 200 260" aria-hidden="true" focusable="false">${bagShape(arts[0], -18, .62).replace('<g ', '<g opacity=".95" ')}${bagShape(arts[2], 94, .62)}${bagShape(arts[1], 38, .7).replace('scale(.7)', 'scale(.7) translate(0 80)')}</svg>`;
    }
    return `<svg class="bag" viewBox="0 0 200 260" aria-hidden="true" focusable="false">${bagShape(p.art)}</svg>`;
  }
  // grey tiles: a touch darker behind the pale bags so they still stand out
  const bgFor = (p) => (p.art.set ? '#ecebe8' : (p.art.bag === '#0b0b0b' || p.art.bag === '#2a2a2a') ? '#f2f2f0' : '#dfdeda');
  const kind = (p) => ({ origin: `Single origin · ${p.where}`, blend: 'Blend · Indonesia', set: 'Set · 3 × 200 g', gift: 'Gift · 3 months' }[p.type]);

  function card(p, o = {}) {
    const plan = o.plan || 'once', link = `product.html?id=${p.id}`;
    const btn = p.soon ? `<button class="btn ghost" data-notify="${p.id}">Notify me</button>`
      : `<button class="btn" data-add="${p.id}" data-plan="${plan}" aria-label="Add ${esc(p.name)} to basket${plan !== 'once' ? ', ' + PLANS[plan].toLowerCase() : ''}">${plan !== 'once' ? 'Subscribe' : 'Add to basket'}</button>`;
    const price = plan !== 'once' && canSub(p) ? `${money(unit(p, plan))} <small>${esc(p.size)}</small>` : `${money(p.price)} <small>${esc(p.size)}</small>`;
    return `<article class="pcard ${p.soon ? 'soon' : ''}" data-type="${p.type}">
      <a class="pimg" href="${link}" style="--pbg:${bgFor(p)}" tabindex="-1" aria-hidden="true">${bagArt(p)}${p.soon ? '<span class="flag">Coming soon</span>' : p.type === 'set' ? '<span class="flag">Set · save £3</span>' : p.type === 'gift' ? '<span class="flag">Gift</span>' : ''}</a>
      <div class="pbody"><span class="ptag">${esc(kind(p))}</span><h3><a href="${link}">${esc(p.name)}</a></h3>
        <p class="pnotes">${p.notes.map(esc).join(' · ')}</p>
        <div class="prow"><span class="pprice">${price}</span><p class="psub">${p.soon ? 'Be first to know when it lands' : p.type === 'gift' ? 'Prepaid, delivery included' : plan !== 'once' ? `Save 10% · ${PLANS[plan].toLowerCase()} · free delivery` : `${money(unit(p, '2w'))} on subscription`}</p>${btn}</div></div>
    </article>`;
  }

  // ---------- chrome: announcement bar, header, drawer, footer ----------
  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    mark: `<svg viewBox="-2 -2 104 104" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5">${MARK}</g></svg>`,
  };
  const NAV = [['shop.html', 'Shop'], ['subscribe.html', 'Subscribe'], ['gifts.html', 'Gifts'], ['menu.html', 'Menu'], ['find.html', 'Find your kopi'], ['visit.html', 'Visit']];
  function announce() {
    return `<div class="announce" role="region" aria-label="Offers">
      <span class="msg">Free UK delivery on orders of £30 or more · <a href="delivery.html">Delivery &amp; returns</a></span>
      <span class="msg" aria-hidden="true" inert>Subscribe and save 10% on every bag · <a href="subscribe.html">Join the Beans Club</a></span>
      <span class="msg" aria-hidden="true" inert>10 points for every £1 in the café, the app and online · <a href="rewards.html">Rewards</a></span></div>`;
  }
  const cartBtn = () => `<button class="iconbtn cartbtn" data-cart aria-label="Basket">${ICON.bag}<span class="count" data-cart-count></span></button>`;
  function header() {
    const here = location.pathname.split('/').pop() + location.search;
    return `<header class="shead"><div class="wrap in">
      <span class="menuslot"><button class="iconbtn menubtn" aria-expanded="false" aria-controls="mainnav" aria-label="Menu">${ICON.menu}</button></span>
      <a class="brand" href="./" aria-label="Bija home">${ICON.mark}${WORDMARK}</a>
      <nav class="mainnav" id="mainnav" aria-label="Main">${NAV.map(([h, l]) => `<a href="${h}" ${here === h || (h === 'shop.html' && here === 'shop.html') || (here.startsWith('product.html') && h === 'shop.html') ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
      <div class="hact"><a class="hlink hidesm" href="help.html">Help</a><a class="btn sm ghost hidesm" href="app.html?view=app">Order ahead</a>${cartBtn()}</div>
    </div></header>`;
  }
  function footer() {
    return `<footer class="sfoot"><div class="wrap">
      <div class="cols">
        <div class="news" id="newsletter"><p class="fh">Get the good stuff first</p><p>New beans, events at St James's Market and members' offers. About twice a month.</p>
          <form data-news novalidate><label class="vh" for="news-email">Email address</label>
            <div class="row"><input class="inp" id="news-email" type="email" name="email" autocomplete="email" placeholder="Email address" required><button class="btn" type="submit">Sign up</button></div>
            <label class="check"><input type="checkbox" name="consent" required><span>Yes, email me news and offers from Bija. I can unsubscribe at any time. See our <a href="privacy.html">privacy notice</a>.</span></label>
            <p class="err" data-news-err role="alert"></p><p class="ok" data-news-ok role="status"></p></form></div>
        <nav aria-label="Shop"><p class="fh">Shop</p><a href="shop.html">All coffee</a><a href="subscribe.html">Subscriptions</a><a href="gifts.html">Gifts</a><a href="product.html?id=set">Discovery set</a><a href="product.html?id=gift">Gift subscription</a><a href="app.html?view=app#gifts">Gift cards</a><a href="offices.html">For offices</a></nav>
        <nav aria-label="Bija"><p class="fh">Bija</p><a href="visit.html">Visit us</a><a href="menu.html">Café menu</a><a href="events.html">What's on</a><a href="find.html">Find your kopi</a><a href="origins.html">Origins</a><a href="brew.html">Brew guides</a><a href="trace.html?b=house">Bean passport</a><a href="sustainability.html">Sustainability</a><a href="rewards.html">Rewards</a><a href="install.html">Get the app</a><a href="press.html">Press</a></nav>
        <!-- email address is a mock-up: to confirm with Bija -->
        <nav aria-label="Help"><p class="fh">Help</p><a href="help.html">Help centre</a><a href="contact.html">Contact us</a><a href="delivery.html">Delivery &amp; returns</a><a href="delivery.html#terms">Terms of sale</a><a href="allergens.html">Allergens</a><a href="mailto:info@bijalondon.co.uk">info@bijalondon.co.uk</a><a href="tel:+442046033086">+44 20 4603 3086</a></nav>
        <nav aria-label="Legal"><p class="fh">Legal</p><a href="privacy.html">Privacy notice</a><button type="button" class="bc-link" data-consent-open>Privacy choices</button><a href="privacy.html#cookies">Cookies</a><a href="accessibility.html">Accessibility</a><a href="https://www.instagram.com/bija.london/" rel="noopener" target="_blank">Instagram @bija.london</a></nav>
      </div>
      <div class="bigmark" aria-hidden="true">${ICON.mark}Bija</div>
      <div class="legalline"><span>© Bija Coffee Limited, registered in England and Wales, company number 15383542. 2a St James's Market, London SW1Y 4AH. Prices include VAT.</span><span>Concept rebuild by Firman Insan M, not an official Bija page.</span></div>
    </div></footer>`;
  }
  function drawer() {
    return `<div class="drawer" id="drawer" aria-hidden="true"><div class="scrim" data-close-cart></div>
      <div class="pan" role="dialog" aria-modal="true" aria-labelledby="drawer-h">
        <div class="dh"><h2 id="drawer-h">Your basket</h2><button class="iconbtn" data-close-cart aria-label="Close basket">${ICON.x}</button></div>
        <div data-drawer-body style="display:contents"></div>
      </div></div><div class="toast" id="shop-toast" role="status" aria-live="polite"></div>`;
  }
  function drawerBody() {
    const ls = lines(), t = totals('post', ls);
    if (!ls.length) return `<div class="dl"><div class="empty">${ICON.mark}<p>Your basket is empty.</p><a class="btn" href="shop.html">Shop coffee</a></div></div>`;
    const freeMsg = t.hasSub ? 'Free delivery: your basket has a subscription.' : t.toFree > 0 ? `You're <b>${money(t.toFree)}</b> away from free UK delivery.` : 'You have free UK delivery.';
    const pct = t.hasSub ? 100 : Math.min(100, (t.subtotal / FREE_AT) * 100);
    return `<div class="free" aria-live="polite">${freeMsg}<div class="bar" role="progressbar" aria-label="Progress to free delivery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${pct}%"></i></div></div>
      <div class="dl">${ls.map((l, i) => `<div class="line"><a class="thumb" href="product.html?id=${l.id}" style="--pbg:${bgFor(l.p)}" tabindex="-1" aria-hidden="true">${bagArt(l.p)}</a>
        <div><div class="lrow"><h3>${esc(l.name)}</h3><span class="pprice">${money(l.total)}</span></div>
          <div class="opts"><label class="vh" for="lg${i}">Grind for ${esc(l.name)}</label><select class="inp" id="lg${i}" data-line="${i}" data-k="grind">${GRINDS.map((g) => `<option ${g === l.grind ? 'selected' : ''}>${g}</option>`).join('')}</select>
          ${canSub(l.p) ? `<label class="vh" for="lp${i}">Plan for ${esc(l.name)}</label><select class="inp" id="lp${i}" data-line="${i}" data-k="plan">${Object.entries(PLANS).map(([k, v]) => `<option value="${k}" ${k === l.plan ? 'selected' : ''}>${k === 'once' ? 'One-off' : v + ' (−10%)'}</option>`).join('')}</select>` : '<span class="small" style="align-self:center">Prepaid, 3 months</span>'}</div>
          <div class="lrow"><div class="step" role="group" aria-label="Quantity of ${esc(l.name)}"><button data-line="${i}" data-d="-1" aria-label="One fewer">−</button><output>${l.qty}</output><button data-line="${i}" data-d="1" aria-label="One more">+</button></div><button class="rm" data-line="${i}" data-rm>Remove</button></div>
        </div></div>`).join('')}</div>
      <div class="df"><div class="sumrow"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        <div class="sumrow small"><span>Delivery</span><span>${t.fee ? money(t.fee) + ' (Royal Mail Tracked 48)' : 'Free'}</span></div>
        <p class="small" style="margin:0">Earn about ${t.pts.toLocaleString('en-GB')} points on your Bija Card. Free click &amp; collect at St James's Market.</p>
        <a class="btn block" href="checkout.html">Checkout · ${money(t.total)}</a></div>`;
  }

  let lastFocus = null;
  function openCart() {
    const d = document.getElementById('drawer'); if (!d) return;
    lastFocus = document.activeElement; paintDrawer();
    d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
    setTimeout(() => d.querySelector('.dh [data-close-cart]').focus(), reduce() ? 0 : 60);
  }
  function closeCart() {
    const d = document.getElementById('drawer'); if (!d || !d.classList.contains('open')) return;
    d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function paintDrawer() {
    const b = document.querySelector('[data-drawer-body]'); if (!b) return;
    const f = document.activeElement, fid = f && f.id, fl = f && f.dataset && f.dataset.line, fd = f && f.dataset && f.dataset.d;
    b.innerHTML = drawerBody();
    const back = fid ? document.getElementById(fid) : fl != null ? b.querySelector(`[data-line="${fl}"][data-d="${fd}"]`) : null;
    if (back) back.focus(); else if (document.getElementById('drawer').classList.contains('open') && !b.contains(document.activeElement)) document.querySelector('.dh [data-close-cart]').focus();
  }
  function paint() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach((c) => { c.textContent = n ? n : ''; c.dataset.n = n; });
    document.querySelectorAll('.cartbtn').forEach((b) => b.setAttribute('aria-label', n ? `Basket, ${n} item${n === 1 ? '' : 's'}` : 'Basket, empty'));
    if (document.getElementById('drawer')?.classList.contains('open')) paintDrawer();
    document.dispatchEvent(new CustomEvent('bija:cart'));
  }
  let tt;
  function toast(msg) { const t = document.getElementById('shop-toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

  const markCycle = (cls = '') => `<svg class="mk cycle ${cls}" viewBox="-1.5 -1.5 103 103" aria-hidden="true"><defs><pattern id="mkd${++uid}" width="2.4" height="2.4" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".75" fill="currentColor"/></pattern><clipPath id="mkc${uid}">${MARK}</clipPath></defs>
    <path class="l-sol" fill-rule="evenodd" d="M25 25a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M50 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M25 75a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M0 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z"/>
    <path class="l-dot" fill="url(#mkd${uid})" fill-rule="evenodd" d="M25 25a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M50 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M25 75a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M0 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z"/>
    <g class="l-out" fill="none" stroke="currentColor" stroke-width="1.3">${MARK}<g clip-path="url(#mkc${uid})"><circle cx="25" cy="0" r="25"/><circle cx="75" cy="0" r="25"/><circle cx="100" cy="25" r="25"/><circle cx="100" cy="75" r="25"/><circle cx="75" cy="100" r="25"/><circle cx="25" cy="100" r="25"/><circle cx="0" cy="75" r="25"/><circle cx="0" cy="25" r="25"/></g></g></svg>`;

  // ---------- wiring ----------
  function mount() {
    const top = document.getElementById('shop-top'); if (top) top.outerHTML = announce() + header();
    const ann = document.getElementById('shop-announce'); if (ann) ann.outerHTML = announce();
    document.querySelectorAll('[data-cart-slot]').forEach((s) => (s.outerHTML = cartBtn()));
    const foot = document.getElementById('shop-foot'); if (foot) foot.outerHTML = footer();
    document.body.insertAdjacentHTML('beforeend', drawer());
    document.querySelectorAll('[data-products]').forEach((el) => {
      const plan = el.dataset.plan || 'once';
      el.innerHTML = el.dataset.products.split(',').map((id) => byId(id.trim())).filter(Boolean).map((p) => card(p, { plan })).join('');
    });
    // a fan of three bag illustrations, used as designed art in heroes
    document.querySelectorAll('[data-fan]').forEach((el) => { el.innerHTML = el.dataset.fan.split(',').map((id) => byId(id.trim())).filter(Boolean).map((p) => `<div class="pimg" style="--pbg:${bgFor(p)}">${bagArt(p)}</div>`).join(''); });
    document.querySelectorAll('[data-mk]').forEach((el, i) => { el.innerHTML = markCycle(); el.firstChild.style.animationDelay = `${-i * 3}s`; });
    // reveal on scroll for shop pages (the home page has its own)
    if (!document.body.classList.contains('home') && 'IntersectionObserver' in window && !reduce()) {
      const els = document.querySelectorAll('.pgrid .pcard, .steps > div, .earn3 > div, .sec-h, .kband, .batik');
      els.forEach((el) => el.classList.add('srv'));
      const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    }
    // rotate the announcement messages
    const msgs = [...document.querySelectorAll('.announce .msg')];
    if (msgs.length > 1 && !reduce()) { let i = 0; setInterval(() => { if (document.hidden || msgs[i].contains(document.activeElement)) return; msgs[i].setAttribute('aria-hidden', 'true'); msgs[i].inert = true; i = (i + 1) % msgs.length; msgs[i].removeAttribute('aria-hidden'); msgs[i].inert = false; }, 5000); }
    else msgs.slice(1).forEach((m) => m.remove());
    paint();
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-cart]')) { e.preventDefault(); openCart(); return; }
    if (t.closest('[data-close-cart]')) { closeCart(); return; }
    const mb = t.closest('.menubtn');
    if (mb) { const n = document.getElementById('mainnav'), on = !n.classList.contains('open'); n.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); return; }
    const a = t.closest('[data-add]');
    if (a) { add(a.dataset.add, { plan: a.dataset.plan || 'once', grind: a.dataset.grind }); return; }
    const nt = t.closest('[data-notify]');
    if (nt) { const p = byId(nt.dataset.notify), em = document.getElementById('news-email'); toast(`Sign up below and we'll email you when ${p.name} lands.`); if (em) { em.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' }); setTimeout(() => em.focus({ preventScroll: true }), reduce() ? 0 : 500); } return; }
    const ln = t.closest('[data-line]');
    if (ln && (ln.dataset.d || ln.hasAttribute('data-rm'))) {
      const c = cart(), i = +ln.dataset.line; if (!c[i]) return;
      if (ln.hasAttribute('data-rm')) { const name = byId(c[i].id).name; c.splice(i, 1); saveCart(c); toast(`Removed ${name}`); return; }
      c[i].qty += +ln.dataset.d; if (c[i].qty < 1) c.splice(i, 1); saveCart(c);
    }
  });
  document.addEventListener('change', (e) => {
    const s = e.target.closest('select[data-line]'); if (!s) return;
    const c = cart(), i = +s.dataset.line; if (!c[i]) return; c[i][s.dataset.k] = s.value; saveCart(c);
    setTimeout(() => { const d = document.querySelector('[data-drawer-body]'); const again = d && d.querySelector(`select[data-k="${s.dataset.k}"]`); if (again && !d.contains(document.activeElement)) again.focus(); }, 0);
  });
  document.addEventListener('keydown', (e) => {
    const d = document.getElementById('drawer'); if (!d || !d.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeCart(); return; }
    if (e.key !== 'Tab') return;
    const f = [...d.querySelectorAll('a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-news]'); if (!f) return;
    e.preventDefault();
    const em = f.email.value.trim(), err = f.querySelector('[data-news-err]'), ok = f.querySelector('[data-news-ok]');
    ok.textContent = ''; f.email.removeAttribute('aria-invalid');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.textContent = 'Enter an email address like name@example.com.'; f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return; }
    if (!f.consent.checked) { err.textContent = 'Tick the box to say you want our emails.'; f.consent.focus(); return; }
    err.textContent = ''; f.reset();
    backend().then((B) => (B ? B.subscribeNewsletter(em, 'web-footer') : null)).then((r) => { ok.textContent = r && r.ok !== false ? "Thank you. You're on the list." : 'Thank you. This is a demo, so no email was stored or sent.'; }).catch(() => { ok.textContent = 'Thank you. This is a demo, so no email was stored or sent.'; });
  });
  addEventListener('storage', (e) => { if (e.key === 'bija.shop.cart') paint(); });

  let be = null;
  function backend() {
    if (be) return be;
    const live = location.protocol === 'https:' && !/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
    if (!live && new URLSearchParams(location.search).get('backend') !== 'supabase') return (be = Promise.resolve(null));
    be = new Promise((res) => { const sc = document.createElement('script'); sc.src = 'bija-supabase.js'; sc.async = true; sc.onload = () => res(window.BijaSupabase || null); sc.onerror = () => res(null); document.head.appendChild(sc); })
      .then((B) => (B ? B.connect().then(() => B) : null)).catch(() => null);
    return be;
  }
  window.BijaShop = { P, GRINDS, PLANS, BREW, SUB_OFF, POST, FREE_AT, PTS, byId, unit, canSub, cart, saveCart, add, lines, totals, count, card, bagArt, bgFor, kind, money, esc, store, toast, markCycle, openCart, closeCart, paint, backend };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
