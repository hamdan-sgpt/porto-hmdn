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

// Build a 7-row × 15-col heatmap grid from events (last ~15 weeks)
function buildHeatmap(events) {
  const grid = Array.from({ length: 7 }, () => Array(15).fill(0));
  const now = new Date();
  
  events.forEach((event) => {
    const date = new Date(event.created_at);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays >= 105) return; // 15 weeks = 105 days
    const weekIndex = 14 - Math.floor(diffDays / 7);
    const dayIndex = date.getDay();
    if (weekIndex >= 0 && weekIndex < 15 && dayIndex >= 0 && dayIndex < 7) {
      grid[dayIndex][weekIndex] += 1;
    }
  });
  
  return grid;
}

function getHeatLevel(count) {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const StatCard = memo(({ icon: Icon, value, label, delay }) => (
  <motion.div
    className="gh-stat-card"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
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
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease: [0.16, 1, 0.3, 1] }}
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

  const heatmap = buildHeatmap(events);
  const recentEvents = events.slice(0, 8);

  if (error && !profile) return null; // Silent fail

  return (
    <section ref={sectionRef} className="github-section" id="github">
      <div className="container section-padding">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
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
          <div className="gh-grid">
            {/* Left: Stats + Heatmap */}
            <motion.div
              className="gh-left"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Stats Row */}
              {profile && (
                <div className="gh-stats-row">
                  <StatCard icon={FiFolder} value={profile.public_repos} label="Repos" delay={0.1} />
                  <StatCard icon={FiUsers} value={profile.followers} label="Followers" delay={0.15} />
                  <StatCard icon={FiStar} value={profile.following} label="Following" delay={0.2} />
                </div>
              )}

              {/* Contribution Heatmap */}
              <div className="gh-heatmap-card glass-card">
                <div className="gh-heatmap-header">
                  <span className="gh-heatmap-title">
                    <FiActivity className="gh-heatmap-icon" />
                    Activity Heatmap
                  </span>
                  <span className="gh-heatmap-count">
                    {events.length} events
                  </span>
                </div>
                <div className="gh-heatmap-grid">
                  {heatmap.map((row, dayIndex) => (
                    <div key={dayIndex} className="gh-heatmap-row">
                      {row.map((count, weekIndex) => (
                        <div
                          key={weekIndex}
                          className={`gh-heatmap-cell gh-heat-${getHeatLevel(count)}`}
                          title={`${count} event${count !== 1 ? 's' : ''}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="gh-heatmap-legend">
                  <span>Less</span>
                  <div className="gh-heatmap-cell gh-heat-0" />
                  <div className="gh-heatmap-cell gh-heat-1" />
                  <div className="gh-heatmap-cell gh-heat-2" />
                  <div className="gh-heatmap-cell gh-heat-3" />
                  <div className="gh-heatmap-cell gh-heat-4" />
                  <span>More</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Activity Feed */}
            <motion.div
              className="gh-right glass-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  <div className="gh-feed-empty">No recent activity</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GitHubActivity;
