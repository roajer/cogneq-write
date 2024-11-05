import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

admin.initializeApp();

export const scrapeAmazonBooks = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { keyword } = data;
  if (!keyword) {
    throw new functions.https.HttpsError('invalid-argument', 'Keyword is required');
  }

  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to Amazon search results
    await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(keyword)}+book&i=stripbooks`);
    await page.waitForSelector('.s-result-item');

    const content = await page.content();
    const $ = cheerio.load(content);

    const books = [];

    $('.s-result-item[data-component-type="s-search-result"]').each((i, element) => {
      if (i < 10) { // Limit to first 10 results
        const title = $(element).find('h2 span').text().trim();
        const author = $(element).find('.a-row .a-size-base').first().text().trim();
        const price = $(element).find('.a-price .a-offscreen').first().text().trim();
        const rating = $(element).find('.a-icon-star-small .a-icon-alt').first().text().trim();
        const reviewCount = $(element).find('.a-size-base.s-underline-text').first().text().trim();
        
        if (title) {
          books.push({
            title,
            author,
            price,
            rating,
            reviewCount,
            timestamp: Date.now()
          });
        }
      }
    });

    await browser.close();

    // Store results in Firestore
    const db = admin.firestore();
    await db.collection('scrapeResults').add({
      userId: context.auth.uid,
      keyword,
      books,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { books };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to scrape Amazon');
  }
});

export const generateChapterContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { chapterTitle, outline, genre, targetAudience } = data;
  if (!chapterTitle || !outline || !genre || !targetAudience) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Here you would integrate with your preferred LLM API
    // For now, we'll return a placeholder response
    const content = `Generated content for chapter: ${chapterTitle}`;
    
    return { content };
  } catch (error) {
    console.error('Content generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate content');
  }
});