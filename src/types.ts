export interface LandmarkTimelineItem {
  year: string;
  title: string;
  details: string;
}

export interface LandmarkDetails {
  name: string;
  location: string;
  era: string;
  text: string;
  desc: string;
  guideTip: string;
  timeline: LandmarkTimelineItem[];
}

export interface WeatherCondition {
  location: string;
  temp: string;
  humidity: string;
  uvIndex: number;
  uvLevel: string;
  uvTip: string;
  aqi: number;
  aqiStatus: string;
  heatStatus: string;
}

export interface IterationItem {
  time: string;
  title: string;
  description: string;
  duration: string;
  transport: string;
  rating: number;
  imgUrl: string;
}

export interface DayPlan {
  id: number;
  title: string;
  items: IterationItem[];
}

export interface TourPlan {
  title: string;
  badge: string;
  days: DayPlan[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ra";
  text: string;
  time: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: string;
  isUser?: boolean;
}
