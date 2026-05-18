const fs = require('fs');
const path = require('path');
const https = require('https');

// Token provided by the user. Fallback to env GITHUB_TOKEN if available.
const TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  'User-Agent': 'immersive-portfolio-analytics-updater',
  'Accept': 'application/vnd.github.v3+json',
};

if (TOKEN) {
  headers['Authorization'] = `token ${TOKEN}`;
}

// Helper to make HTTPS requests returning JSON
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response from ${url}: ${e.message}`));
          }
        } else {
          reject(new Error(`Request to ${url} failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', (err) => reject(err));
  });
}

// Helper to fetch commit count using the Link header trick
function fetchCommitCount(owner, repo) {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
    const req = https.get(url, { headers }, (res) => {
      const linkHeader = res.headers['link'];
      if (linkHeader) {
        // Parse the link header to find the "last" page number
        // Format: <https://api.github.com/...page=2>; rel="next", <https://api.github.com/...page=15>; rel="last"
        const lastMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
        if (lastMatch && lastMatch[1]) {
          return resolve(parseInt(lastMatch[1], 10));
        }
      }
      
      // If no link header, consume data and check array length
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const commits = JSON.parse(data);
          resolve(Array.isArray(commits) ? commits.length : 0);
        } catch (e) {
          resolve(0);
        }
      });
    });
    req.on('error', () => resolve(0));
  });
}

async function run() {
  console.log('🚀 Starting GitHub Analytics scraper...');
  
  const projectConstantsPath = path.join(__dirname, '../constants/ProjectConstants.ts');
  if (!fs.existsSync(projectConstantsPath)) {
    console.error(`❌ ProjectConstants.ts not found at: ${projectConstantsPath}`);
    process.exit(1);
  }

  // Parse ProjectConstants.ts to extract GitHub URLs
  const content = fs.readFileSync(projectConstantsPath, 'utf8');
  const githubRepoRegex = /https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/g;
  const reposMap = new Map(); // Use Map to avoid duplicates
  
  let match;
  while ((match = githubRepoRegex.exec(content)) !== null) {
    const owner = match[1];
    // Strip trailing commas, quotes, or slashes if any
    const repo = match[2].replace(/[",']/g, '');
    reposMap.set(`${owner}/${repo}`, { owner, repo });
  }

  const uniqueRepos = Array.from(reposMap.values());
  console.log(`🔍 Found ${uniqueRepos.length} unique repositories to query.`);

  const statsCache = {};

  for (const { owner, repo } of uniqueRepos) {
    const repoKey = `${owner}/${repo}`;
    console.log(`⏳ Fetching telemetry for: ${repoKey}...`);
    try {
      // 1. Fetch General Repo Info
      const repoInfo = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
      
      // 2. Fetch Languages
      const languages = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/languages`);
      
      // Calculate language percentages
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      const languagesFormatted = Object.entries(languages).map(([name, bytes]) => {
        return {
          name,
          bytes,
          percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0
        };
      }).sort((a, b) => b.bytes - a.bytes); // Sort descending

      // 3. Fetch Total Commit Count
      const commitsCount = await fetchCommitCount(owner, repo);

      statsCache[repoKey] = {
        title: repoInfo.name,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        watchers: repoInfo.watchers_count,
        openIssues: repoInfo.open_issues_count,
        size: repoInfo.size, // Size in KB
        pushedAt: repoInfo.pushed_at,
        commitsCount,
        languages: languagesFormatted,
        success: true
      };
      
      console.log(`✅ Loaded ${repoKey} (Stars: ${repoInfo.stargazers_count}, Commits: ${commitsCount})`);
    } catch (error) {
      console.error(`❌ Error fetching stats for ${repoKey}:`, error.message);
      statsCache[repoKey] = { success: false, error: error.message };
    }
  }

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'github-stats.json');
  fs.writeFileSync(outputPath, JSON.stringify(statsCache, null, 2), 'utf8');
  console.log(`🎉 Scraping complete! Cached analytics saved to: ${outputPath}`);
}

run();
