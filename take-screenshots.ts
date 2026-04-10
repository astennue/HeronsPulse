import puppeteer from 'puppeteer';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const screenshotsDir = join(process.cwd(), 'screenshots-new');
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

// Demo credentials
const STUDENT_EMAIL = 'reinernuevas.acads@gmail.com';
const STUDENT_PASSWORD = '@CSFDSARein03082026';
const FACULTY_EMAIL = 'faculty.demo@umak.edu.ph';
const FACULTY_PASSWORD = 'Faculty@HeronPulse2026';
const ADMIN_EMAIL = 'superadmin@heronpulse.demo';
const ADMIN_PASSWORD = 'Admin@HeronPulse2026';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page: any, name: string) {
  const path = join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`✓ Saved: ${name}.png`);
}

async function login(page: any, email: string, password: string) {
  console.log(`  Logging in as ${email}...`);
  
  // Go to login page
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await delay(2000);
  
  // Wait for form to be visible
  await page.waitForSelector('input[type="email"]', { visible: true, timeout: 10000 });
  
  // Clear and fill form
  await page.evaluate(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  });
  
  await page.type('input[type="email"]', email, { delay: 50 });
  await page.type('input[type="password"]', password, { delay: 50 });
  
  await delay(500);
  
  // Click login button
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
  ]);
  
  await delay(3000);
  
  // Check if we're on dashboard
  const url = page.url();
  console.log(`  Current URL: ${url}`);
  
  if (!url.includes('/dashboard') && !url.includes('/boards')) {
    // Maybe redirected to landing page, wait more
    await delay(3000);
    const newUrl = page.url();
    console.log(`  New URL: ${newUrl}`);
    
    if (newUrl === `${BASE_URL}/` || newUrl === BASE_URL) {
      // Still on landing page - might be a session issue
      console.log('  Still on landing, navigating to dashboard...');
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await delay(2000);
    }
  }
}

async function main() {
  console.log('Starting screenshot capture...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  
  try {
    // ===== LANDING PAGE =====
    console.log('📸 Landing Page...');
    const landingPage = await browser.newPage();
    await landingPage.setViewport({ width: 1280, height: 800 });
    await landingPage.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(landingPage, '00-landing-page');
    await landingPage.close();
    
    // ===== STUDENT SCREENSHOTS =====
    console.log('\n📸 STUDENT screenshots...');
    const studentPage = await browser.newPage();
    await studentPage.setViewport({ width: 1280, height: 800 });
    
    // Login as student
    await login(studentPage, STUDENT_EMAIL, STUDENT_PASSWORD);
    await takeScreenshot(studentPage, '01-student-dashboard');
    
    // Boards page
    console.log('  Navigating to boards...');
    await studentPage.goto(`${BASE_URL}/boards`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '02-student-boards');
    
    // Projects page
    console.log('  Navigating to projects...');
    await studentPage.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '03-student-projects');
    
    // Analytics page
    console.log('  Navigating to analytics...');
    await studentPage.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '04-student-analytics');
    
    // Messages page
    console.log('  Navigating to messages...');
    await studentPage.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '05-student-messages');
    
    // Leaderboard page
    console.log('  Navigating to leaderboard...');
    await studentPage.goto(`${BASE_URL}/leaderboard`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '06-student-leaderboard');
    
    // Calendar page
    console.log('  Navigating to calendar...');
    await studentPage.goto(`${BASE_URL}/calendar`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '07-student-calendar');
    
    // Settings page
    console.log('  Navigating to settings...');
    await studentPage.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(studentPage, '08-student-settings');
    
    await studentPage.close();
    
    // ===== FACULTY SCREENSHOTS =====
    console.log('\n📸 FACULTY screenshots...');
    const facultyPage = await browser.newPage();
    await facultyPage.setViewport({ width: 1280, height: 800 });
    
    // Login as faculty
    await login(facultyPage, FACULTY_EMAIL, FACULTY_PASSWORD);
    await takeScreenshot(facultyPage, '09-faculty-dashboard');
    
    // Faculty Board page
    console.log('  Navigating to faculty board...');
    await facultyPage.goto(`${BASE_URL}/facility`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(facultyPage, '10-faculty-board');
    
    // Boards page
    console.log('  Navigating to boards...');
    await facultyPage.goto(`${BASE_URL}/boards`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(facultyPage, '11-faculty-boards');
    
    await facultyPage.close();
    
    // ===== SUPER ADMIN SCREENSHOTS =====
    console.log('\n📸 SUPER ADMIN screenshots...');
    const adminPage = await browser.newPage();
    await adminPage.setViewport({ width: 1280, height: 800 });
    
    // Login as super admin
    await login(adminPage, ADMIN_EMAIL, ADMIN_PASSWORD);
    await takeScreenshot(adminPage, '12-admin-dashboard');
    
    // Admin Panel page
    console.log('  Navigating to admin panel...');
    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(adminPage, '13-admin-panel');
    
    // Boards page (shows all tasks)
    console.log('  Navigating to boards...');
    await adminPage.goto(`${BASE_URL}/boards`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(adminPage, '14-admin-boards');
    
    // Faculty Board page
    console.log('  Navigating to facility...');
    await adminPage.goto(`${BASE_URL}/facility`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(adminPage, '15-admin-facility');
    
    await adminPage.close();
    
    // ===== MOBILE RESPONSIVE SCREENSHOTS =====
    console.log('\n📸 MOBILE screenshots...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 812 }); // iPhone X dimensions
    
    // Mobile landing page
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(mobilePage, '16-mobile-landing');
    
    // Mobile login
    await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(mobilePage, '17-mobile-login');
    
    // Mobile dashboard - login as student
    await login(mobilePage, STUDENT_EMAIL, STUDENT_PASSWORD);
    await takeScreenshot(mobilePage, '18-mobile-dashboard');
    
    // Mobile boards
    await mobilePage.goto(`${BASE_URL}/boards`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await takeScreenshot(mobilePage, '19-mobile-boards');
    
    await mobilePage.close();
    
    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
