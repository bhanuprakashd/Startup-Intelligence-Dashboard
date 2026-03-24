"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Database, Globe2, Newspaper, TrendingUp } from "lucide-react";
import { useLiveHN } from "@/hooks/use-live-hn";
import { useLiveFunding } from "@/hooks/use-live-funding";
import { Header } from "@/components/layout/header";
import { Sidebar, type SectionId } from "@/components/layout/sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { MetricCard } from "@/components/common/metric-card";
import { FundingFeed } from "@/components/feeds/funding-feed";
import { NewsFeed } from "@/components/feeds/news-feed";
import { StartupGrid } from "@/components/startups/startup-grid";
import { GlobalMap } from "@/components/map/global-map";
import { ChartTabs } from "@/components/charts/chart-tabs";
import { OpportunityFinder } from "@/components/opportunities/opportunity-finder";
import { IdeaValidator } from "@/components/opportunities/idea-validator";
import { CompetitiveXRay } from "@/components/opportunities/competitive-xray";
import { InvestorMatch } from "@/components/opportunities/investor-match";
import { PitchGenerator } from "@/components/opportunities/pitch-generator";
import { NameGenerator } from "@/components/opportunities/name-generator";
import { LaunchRoadmap } from "@/components/opportunities/launch-roadmap";
import { FounderQuiz } from "@/components/opportunities/founder-quiz";
import { LandingPreview } from "@/components/opportunities/landing-preview";
import { ChatPanel } from "@/components/chat/chat-panel";
import { MobileNav } from "@/components/layout/mobile-nav";
import { REFRESH_INTERVALS } from "@/lib/constants";

function shouldShow(active: SectionId, section: SectionId): boolean {
  return active === "overview" || active === section;
}

const SPARK_STARTUPS = [120, 128, 131, 135, 130, 138, 140, 142, 139, 143, 141, 143] as const;
const SPARK_FUNDING = [1.8, 2.1, 1.9, 2.3, 2.0, 2.5, 2.2, 2.7, 2.4, 2.1, 2.6, 2.4] as const;
const SPARK_ECO = [1380, 1390, 1395, 1400, 1405, 1410, 1408, 1415, 1418, 1420, 1421, 1423] as const;
const SPARK_DEAL = [19.2, 18.8, 19.5, 18.1, 19.8, 18.4, 19.0, 18.9, 18.5, 19.1, 18.7, 18.7] as const;

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: hnStories, isLoading: hnLoading } = useLiveHN();
  const { data: fundingItems, isLoading: fundingLoading } = useLiveFunding();
  const [chatOpen, setChatOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState<number>(REFRESH_INTERVALS.funding);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastRefreshed(new Date());
    setIsRefreshing(false);
    setNextRefreshIn(REFRESH_INTERVALS.funding);
  }, [queryClient]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1000) {
          setLastRefreshed(new Date());
          return REFRESH_INTERVALS.funding;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  const showMap = shouldShow(activeSection, "map");
  const showFunding = shouldShow(activeSection, "funding");
  const showSectors = shouldShow(activeSection, "sectors");
  const showNews = shouldShow(activeSection, "news");
  const showStartups = shouldShow(activeSection, "startups");
  const showOpportunities = activeSection === "overview" || activeSection === "opportunities";
  const showValidator = activeSection === "validate";
  const showXray = activeSection === "xray";
  const showInvestors = activeSection === "investors";
  const showPitch = activeSection === "pitch";
  const showNames = activeSection === "names";
  const showRoadmap = activeSection === "roadmap";
  const showProfile = activeSection === "profile";
  const showLanding = activeSection === "landing";

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onSearchOpen={() => {}}
        onCopilotToggle={() => setChatOpen((p) => !p)}
        isCopilotOpen={chatOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-5 lg:pb-5">
          {/* KPI Row */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              title="Trending Stories"
              value={hnLoading ? "—" : String(hnStories?.length ?? 0)}
              numericValue={hnStories?.length ?? 0}
              loading={hnLoading}
              icon={Newspaper}
              color="#818cf8"
              sparkData={SPARK_STARTUPS}
            />
            <MetricCard
              title="Funding Articles"
              value={fundingLoading ? "—" : String(fundingItems?.length ?? 0)}
              numericValue={fundingItems?.length ?? 0}
              loading={fundingLoading}
              changeLabel="from RSS feeds"
              icon={TrendingUp}
              color="#34d399"
              sparkData={SPARK_FUNDING}
            />
            <MetricCard
              title="Ecosystems Tracked"
              value="18"
              numericValue={18}
              icon={Globe2}
              color="#22d3ee"
              sparkData={SPARK_ECO}
            />
            <MetricCard
              title="AI Tools"
              value="13"
              numericValue={13}
              icon={Database}
              color="#f472b6"
              sparkData={SPARK_DEAL}
            />
          </div>

          {/* Global Map */}
          {showMap && (
            <div className="mb-5">
              <GlobalMap />
            </div>
          )}

          {/* Funding Feed + Charts */}
          {(showFunding || showSectors) && (
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
              {showFunding && <FundingFeed />}
              {showSectors && <ChartTabs />}
            </div>
          )}

          {/* Idea Validator */}
          {showValidator && (
            <div className="mb-5">
              <IdeaValidator />
            </div>
          )}

          {/* Competitive X-Ray */}
          {showXray && (
            <div className="mb-5">
              <CompetitiveXRay />
            </div>
          )}

          {/* Investor Match */}
          {showInvestors && (
            <div className="mb-5">
              <InvestorMatch />
            </div>
          )}

          {/* Pitch Deck Generator */}
          {showPitch && (
            <div className="mb-5">
              <PitchGenerator />
            </div>
          )}

          {/* Name + Domain Generator */}
          {showNames && (
            <div className="mb-5">
              <NameGenerator />
            </div>
          )}

          {/* 90-Day Launch Roadmap */}
          {showRoadmap && (
            <div className="mb-5">
              <LaunchRoadmap />
            </div>
          )}

          {/* Founder Profile Quiz */}
          {showProfile && (
            <div className="mb-5">
              <FounderQuiz />
            </div>
          )}

          {/* Landing Page Preview */}
          {showLanding && (
            <div className="mb-5">
              <LandingPreview />
            </div>
          )}

          {/* AI Opportunity Finder */}
          {showOpportunities && (
            <div className="mb-5">
              <OpportunityFinder />
            </div>
          )}

          {/* News Feed */}
          {showNews && (
            <div className="mb-5">
              <NewsFeed />
            </div>
          )}

          {/* Startup Grid */}
          {showStartups && (
            <div className="mb-5">
              <StartupGrid />
            </div>
          )}
        </main>

          <ChatPanel isOpen={chatOpen} onToggle={() => setChatOpen((p) => !p)} />
        </div>

      <StatusBar lastRefreshed={lastRefreshed} nextRefreshIn={nextRefreshIn} />
      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}
