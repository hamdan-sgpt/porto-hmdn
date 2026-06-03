import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiGithub, FiGitCommit, FiGitBranch, FiStar, FiGitPullRequest, FiArrowUpRight, FiFolder, FiUsers, FiActivity } from 'react-icons/fi';
import './GitHubActivity.css';

const GITHUB_USERNAME = 'hamdan-sgpt';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
const cache = { profile: null, events: null, timestamp: 0 };

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

const StatCard = memo(({ icon: Icon, value, label, delay }) => (
  <motion.div
    className="gh-stat-card"
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="gh-stat-icon-wrap">
      <Icon />
    </div>
    <div className="gh-stat-value">{value}</div>
    <div className="gh-stat-label">{label}</div>
  </motion.div>
));

StatCard.displayName = 'StatCard';

const ActivityItem = memo(({ event, index }) => {
  const { label, repo } = getEventDescription(event);
  const Icon = eventIcons[event.type] || FiActivity;
  
  return (
    <motion.div
      className="gh-activity-item"
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cache.profile && cache.events && Date.now() - cache.timestamp < CACHE_DURATION) {
      setProfile(cache.profile);
      setEvents(cache.events);
      setLoading(false);
      return;
    }

    try {
      const [profileRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`),
      ]);

      if (!profileRes.ok || !eventsRes.ok) throw new Error('API error');

      const profileData = await profileRes.json();
      const eventsData = await eventsRes.json();
      
      // Update cache
      cache.profile = profileData;
      cache.events = eventsData;
      cache.timestamp = Date.now();

      setProfile(profileData);
      setEvents(eventsData);
    } catch (err) {
      console.warn('GitHub API fetch failed:', err);
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

  const recentEvents = events.slice(0, 8);

  if (error && !profile) return null; // Silent fail

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
          <div className="section-label">Live Feed</div>
          <div className="flex-between">
            <h2 className="section-title">
              GitHub <span className="gradient-text-shimmer">Activity</span>
            </h2>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-profile-link hover-trigger"
            >
              <FiGithub />
              <span>@{GITHUB_USERNAME}</span>
              <FiArrowUpRight />
            </a>
          </div>
        </motion.div>

        {loading ? (
          <div className="gh-loading">
            <div className="gh-loading-bar" />
            <span>Fetching activity...</span>
          </div>
        ) : (
          <div className="gh-activity-container">
            {/* 1. Full-Width Heatmap Card */}
            <motion.div 
              className="gh-heatmap-card glass-card"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="gh-heatmap-header">
                <span className="gh-heatmap-title">
                  <FiActivity className="gh-heatmap-icon" />
                  Contribution Calendar (Past Year)
                </span>
                <span className="gh-heatmap-count">
                  Real-time Contributions
                </span>
              </div>
              <div className="gh-heatmap-wrap">
                {imgError ? (
                  <div className="gh-heatmap-fallback">
                    <span>Unable to load contribution graph directly.</span>
                    <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer">
                      View on GitHub <FiArrowUpRight />
                    </a>
                  </div>
                ) : (
                  <img 
                    src={`https://ghchart.rshah.org/39d353/${GITHUB_USERNAME}`} 
                    alt="GitHub Contribution Heatmap" 
                    className="gh-heatmap-img"
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            </motion.div>

            {/* 2. Bottom Grid: Stats & Activity Feed */}
            <div className="gh-bottom-grid">
              {/* Stats */}
              <motion.div 
                className="gh-stats-column"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="gh-stats-grid">
                  {profile && (
                    <>
                      <StatCard icon={FiFolder} value={profile.public_repos} label="Repos" delay={0.1} />
                      <StatCard icon={FiUsers} value={profile.followers} label="Followers" delay={0.15} />
                      <StatCard icon={FiStar} value={profile.following} label="Following" delay={0.2} />
                    </>
                  )}
                </div>
              </motion.div>

              {/* Feed */}
              <motion.div 
                className="gh-feed-column glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
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
                    <div className="gh-feed-empty">No recent public activity.</div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GitHubActivity;
