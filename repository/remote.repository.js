import { remember } from '../utils/cache.js';

const CACHE_TTL = 1000 * 60 * 5;

const fetchWithRetry = async (url, retries = 3) => {
  const controller = new AbortController();
  for (let attempt = 0; attempt < retries; attempt++) {
    console.debug(`--- attempt ${attempt + 1} to fetch ${url}`);
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      console.debug(
        `--- successfully fetched ${url} on attempt ${attempt + 1}`,
      );
      return response;
    } catch (error) {
      clearTimeout(timer);
      if (attempt === retries - 1) {
        console.error(`--- failed to fetch ${url} after ${retries} attempts`);
        throw error;
      }
      const delay = 1000 * Math.pow(2, attempt);
      console.debug(
        `--- fetch failed: ${error.message}. retrying in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

async function getReferenceData() {
  return remember('devices', CACHE_TTL, async () => {
    const response = await fetchWithRetry('http://localhost:3002/deviceTypes');
    return await response.json();
  });
}

export default { getReferenceData };
