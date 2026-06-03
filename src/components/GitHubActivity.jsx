import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  FiGithub, FiGitCommit, FiGitBranch, FiStar, FiGitPullRequest, 
  FiArrowUpRight, FiFolder, FiUsers, FiActivity, FiMapPin, 
  FiLink, FiBriefcase, FiBookOpen, FiTerminal, FiMail 
} from 'react-icons/fi';
import './GitHubActivity.css';

const GITHUB_USERNAME = 'hamdan-sgpt';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache for profile, events, repos, and SVG heatmap
const cache = { profile: null, events: null, repos: null, heatmapSvg: null, timestamp: 0 };

const eventIcons = {
  PushEvent: FiGitCommit,
  CreateEvent: FiGitBranch,
  WatchEvent: FiStar,
  PullRequestEvent: FiGitPullRequest,
  ForkEvent: FiGitBranch,
  IssuesEvent: FiActivity,
  IssueCommentEvent: FiActivity,
  DeleteEvent: FiGitBranch,
  ReleaseEvent: FiStar,
};

const eventLabels = {
  PushEvent: 'Pushed to',
  CreateEvent: 'Created',
  WatchEvent: 'Starred',
  PullRequestEvent: 'PR on',
  ForkEvent: 'Forked',
  IssuesEvent: 'Issue on',
  IssueCommentEvent: 'Commented on',
  DeleteEvent: 'Deleted from',
  ReleaseEvent: 'Released',
};

const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Vue: '#41b883',
  React: '#61dafb',
  Shell: '#89e051',
  PHP: '#4f5d95',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  Go: '#00ADD8',
  Rust: '#dea584',
};

function getEventDescription(event) {
  const label = eventLabels[event.type] || event.type.replace('Event', '');
  const repo = event.repo?.name?.split('/')[1] || event.repo?.name || '';
  
  if (event.type === 'PushEvent') {
    const commits = event.payload?.commits?.length || 0;
    return { label: `${commits} commit${commits > 1 ? 's' : ''} to`, repo };
  }
  if (event.type === 'CreateEvent') {
    const refType = event.payload?.ref_type || 'repository';
    return { label: `Created ${refType}`, repo };
  }
  return { label, repo };
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

const RepoCard = memo(({ repo }) => {
  const langColor = languageColors[repo.language] || '#8b949e';
  
  return (
    <motion.div 
      className="gh-repo-card"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="gh-repo-header">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="gh-repo-name">
          {repo.name}
        </a>
        <span className="gh-repo-badge">Public</span>
      </div>
      <p className="gh-repo-desc">{repo.description || 'No description provided.'}</p>
      <div className="gh-repo-meta">
        {repo.language && (
          <span className="gh-repo-lang">
            <span className="gh-lang-dot" style={{ backgroundColor: langColor }} />
            {repo.language}
          </span>
        )}
        <span className="gh-repo-stat">
          <FiStar /> {repo.stargazers_count}
        </span>
        <span className="gh-repo-stat">
          <FiGitBranch /> {repo.forks_count}
        </span>
      </div>
    </motion.div>
  );
});

RepoCard.displayName = 'RepoCard';

const ActivityItem = memo(({ event, index }) => {
  const { label, repo } = getEventDescription(event);
  const Icon = eventIcons[event.type] || FiActivity;
  
  return (
    <motion.div
      className="gh-activity-item"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <div className="gh-activity-icon">
        <Icon />
      </div>
      <div className="gh-activity-info">
        <span className="gh-activity-label">{label}</span>
        <span className="gh-activity-repo">{repo}</span>
      </div>
      <span className="gh-activity-time">{timeAgo(event.created_at)}</span>
    </motion.div>
  );
});

ActivityItem.displayName = 'ActivityItem';

const GitHubActivity = () => {
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [repos, setRepos] = useState([]);
  const [heatmapSvg, setHeatmapSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'repos', 'activity'
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cache.profile && cache.events && cache.repos && cache.heatmapSvg && Date.now() - cache.timestamp < CACHE_DURATION) {
      setProfile(cache.profile);
      setEvents(cache.events);
      setRepos(cache.repos);
      setHeatmapSvg(cache.heatmapSvg);
      setLoading(false);
      return;
    }

    try {
      const [profileRes, eventsRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`),
      ]);

      if (!profileRes.ok || !eventsRes.ok || !reposRes.ok) throw new Error('API error');

      const profileData = await profileRes.json();
      const eventsData = await eventsRes.json();
      const reposData = await reposRes.json();
      
      let svgText = '';
      try {
        const heatmapRes = await fetch(`https://ghchart.rshah.org/39d353/${GITHUB_USERNAME}`);
        if (heatmapRes.ok) {
          svgText = await heatmapRes.text();
          // Modify SVG colors to look exactly like GitHub Dark Mode
          svgText = svgText
            .replace(/fill="#ebedf0"/g, 'fill="#161b22"') // Empty
            .replace(/fill="#c6e48b"/g, 'fill="#0e4429"') // Level 1 (Light Green)
            .replace(/fill="#7bc96f"/g, 'fill="#006d32"') // Level 2
            .replace(/fill="#239a3b"/g, 'fill="#26a641"') // Level 3
            .replace(/fill="#196127"/g, 'fill="#39d353"') // Level 4 (Bright Green)
            .replace(/<text/g, '<text fill="#8b949e" font-size="9" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif"');
        }
      } catch (svgErr) {
        console.warn('CORS or network error fetching SVG heatmap:', svgErr);
      }

      // Update cache
      cache.profile = profileData;
      cache.events = eventsData;
      cache.repos = reposData;
      cache.heatmapSvg = svgText;
      cache.timestamp = Date.now();

      setProfile(profileData);
      setEvents(eventsData);
      setRepos(reposData);
      setHeatmapSvg(svgText);
    } catch (err) {
      console.warn('GitHub data fetch failed:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInView) {
      fetchData();
    }
  }, [isInView, fetchData]);

  // Auto-refresh every 5 minutes when visible
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(fetchData, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [isInView, fetchData]);

  if (error && !profile) return null; // Silent fail

  const popularRepos = repos.slice(0, 6);
  const recentEvents = events.slice(0, 8);

  return (
    <section ref={sectionRef} className="github-section" id="github">
      <div className="container section-padding">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">GitHub Integration</div>
          <div className="flex-between">
            <h2 className="section-title">
              GitHub <span className="gradient-text-shimmer">Profile</span>
            </h2>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-profile-link-btn"
            >
              <FiGithub />
              <span>Visit GitHub</span>
              <FiArrowUpRight />
            </a>
          </div>
        </motion.div>

        {loading ? (
          <div className="gh-loading">
            <div className="gh-loading-bar" />
            <span>Connecting to GitHub...</span>
          </div>
        ) : (
          <div className="gh-profile-layout">
            {/* Left: GitHub Profile Card */}
            {profile && (
              <motion.div 
                className="gh-profile-card-left"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="gh-avatar-wrap">
                  <img src={profile.avatar_url} alt={profile.name} className="gh-avatar-img" />
                </div>
                
                <div className="gh-user-info">
                  <h3 className="gh-user-fullname">{profile.name || GITHUB_USERNAME}</h3>
                  <span className="gh-user-login">{profile.login}</span>
                </div>

                {profile.bio && <p className="gh-user-bio">{profile.bio}</p>}

                <a 
                  href={`https://github.com/${GITHUB_USERNAME}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="gh-edit-profile-btn"
                >
                  Follow
                </a>

                <div className="gh-follow-stats">
                  <span className="gh-follow-stat-item">
                    <FiUsers />
                    <strong>{profile.followers}</strong> followers
                  </span>
                  <span className="gh-dot-sep">&middot;</span>
                  <span className="gh-follow-stat-item">
                    <strong>{profile.following}</strong> following
                  </span>
                </div>

                <div className="gh-user-meta-list">
                  {profile.company && (
                    <div className="gh-meta-item">
                      <FiBriefcase />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="gh-meta-item">
                      <FiMapPin />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="gh-meta-item">
                      <FiMail />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.blog && (
                    <div className="gh-meta-item">
                      <FiLink />
                      <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noopener noreferrer">
                        {profile.blog.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Right: Tabs & Dynamic Content */}
            <div className="gh-profile-content-right">
              {/* Tab navigation */}
              <div className="gh-tabs-header">
                <button 
                  className={`gh-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <FiBookOpen className="gh-tab-icon" />
                  <span>Overview</span>
                </button>
                <button 
                  className={`gh-tab-btn ${activeTab === 'repos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('repos')}
                >
                  <FiFolder className="gh-tab-icon" />
                  <span>Repositories</span>
                  {profile && <span className="gh-tab-badge">{profile.public_repos}</span>}
                </button>
                <button 
                  className={`gh-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  <FiTerminal className="gh-tab-icon" />
                  <span>Activity Feed</span>
                </button>
              </div>

              {/* Tab contents */}
              <div className="gh-tab-content">
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div 
                    className="gh-tab-pane"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="gh-section-sub-title">Popular repositories</h4>
                    <div className="gh-repos-grid">
                      {popularRepos.length > 0 ? (
                        popularRepos.map(repo => (
                          <RepoCard key={repo.id} repo={repo} />
                        ))
                      ) : (
                        <div className="gh-empty-tab">No public repositories found.</div>
                      )}
                    </div>

                    <h4 className="gh-section-sub-title mt-4">Contribution Heatmap</h4>
                    <div className="gh-heatmap-card glass-card">
                      <div className="gh-heatmap-header">
                        <span className="gh-heatmap-title">
                          <FiActivity className="gh-heatmap-icon" />
                          Activity Graph (Past Year)
                        </span>
                      </div>
                      <div className="gh-heatmap-wrap">
                        {heatmapSvg ? (
                          <div 
                            className="gh-heatmap-svg-container"
                            dangerouslySetInnerHTML={{ __html: heatmapSvg }} 
                          />
                        ) : (
                          <div className="gh-heatmap-fallback">
                            <span>Contribution calendar loaded directly from GitHub Profile.</span>
                            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer">
                              View Calendar <FiArrowUpRight />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. REPOSITORIES TAB */}
                {activeTab === 'repos' && (
                  <motion.div 
                    className="gh-tab-pane"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="gh-repos-list">
                      {repos.length > 0 ? (
                        repos.map(repo => (
                          <RepoCard key={repo.id} repo={repo} />
                        ))
                      ) : (
                        <div className="gh-empty-tab">No repositories found.</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. ACTIVITY FEED TAB */}
                {activeTab === 'activity' && (
                  <motion.div 
                    className="gh-tab-pane"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="gh-feed-card glass-card">
                      <div className="gh-feed-header">
                        <span className="gh-feed-title">Recent Activity</span>
                        <div className="gh-feed-live">
                          <span className="status-dot" />
                          <span>LIVE</span>
                        </div>
                      </div>
                      <div className="gh-feed-list">
                        {recentEvents.length > 0 ? (
                          recentEvents.map((event, i) => (
                            <ActivityItem key={event.id} event={event} index={i} />
                          ))
                        ) : (
                          <div className="gh-feed-empty">No recent activity found.</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GitHubActivity;
