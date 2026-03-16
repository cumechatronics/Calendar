/* eslint-disable import/order */
/**
 * Configuration module for Calendar Card Pro
 */

import * as Constants from './constants';
import * as Types from './types';
import * as Logger from '../utils/logger';

//-----------------------------------------------------------------------------
// CORE CONFIGURATION
//-----------------------------------------------------------------------------

/**
 * Default configuration for Calendar Card Pro
 */
export const DEFAULT_CONFIG: Types.Config = {
  // Core settings
  entities: [],
  start_date: undefined,
  days_to_show: 3,
  compact_days_to_show: undefined,
  compact_events_to_show: undefined,
  compact_events_complete_days: false,
  show_empty_days: false,
  filter_duplicates: false,
  split_multiday_events: false,
  language: undefined,

  // Header
  title: undefined,
  title_font_size: undefined,
  title_color: undefined,

  // Layout and spacing
  background_color: 'var(--ha-card-background)',
  accent_color: '#03a9f4',
  vertical_line_width: '2px',
  day_spacing: '10px',
  event_spacing: '4px',
  additional_card_spacing: '0px',
  height: 'auto',
  max_height: 'none',

  // Week numbers and horizontal separators
  first_day_of_week: 'system',
  show_week_numbers: null,
  show_current_week_number: true,
  week_number_font_size: '12px',
  week_number_color: 'var(--primary-text-color)',
  week_number_background_color: '#03a9f450',
  day_separator_width: '0px',
  day_separator_color: 'var(--secondary-text-color)',
  week_separator_width: '0px',
  week_separator_color: '#03a9f450',
  month_separator_width: '0px',
  month_separator_color: 'var(--primary-text-color)',

  // Today indicator
  today_indicator: false,
  today_indicator_position: '15% 50%',
  today_indicator_color: '#03a9f4',
  today_indicator_size: '6px',

  // Date column
  date_vertical_alignment: 'middle',
  weekday_font_size: '14px',
  weekday_color: 'var(--primary-text-color)',
  day_font_size: '26px',
  day_color: 'var(--primary-text-color)',
  show_month: true,
  month_font_size: '12px',
  month_color: 'var(--primary-text-color)',
  weekend_weekday_color: undefined, // Inherit from weekday_color
  weekend_day_color: undefined, // Inherit from day_color
  weekend_month_color: undefined, // Inherit from month_color
  today_weekday_color: undefined, // Inherit from weekday_color or weekend_weekday_color
  today_day_color: undefined, // Inherit from day_color or weekend_day_color
  today_month_color: undefined, // Inherit from month_color or weekend_month_color,

  // Event column
  event_background_opacity: 0,
  show_past_events: false,
  show_countdown: false,
  show_progress_bar: false,
  progress_bar_color: 'var(--secondary-text-color)',
  progress_bar_height: 'calc(var(--calendar-card-font-size-time) * 0.75)',
  progress_bar_width: '60px',
  event_font_size: '14px',
  event_color: 'var(--primary-text-color)',
  empty_day_color: 'var(--primary-text-color)',
  show_time: true,
  show_single_allday_time: true,
  time_24h: 'system',
  show_end_time: true,
  time_font_size: '12px',
  time_color: 'var(--secondary-text-color)',
  time_icon_size: '14px',
  show_location: true,
  remove_location_country: false,
  location_font_size: '12px',
  location_color: 'var(--secondary-text-color)',
  location_icon_size: '14px',

  // Weather
  weather: {
    entity: undefined,
    position: 'date',
    date: {
      show_conditions: true,
      show_high_temp: true,
      show_low_temp: false,
      icon_size: '14px',
      font_size: '12px',
      color: 'var(--primary-text-color)',
    },
    event: {
      show_conditions: true,
      show_temp: true,
      icon_size: '14px',
      font_size: '12px',
      color: 'var(--primary-text-color)',
    },
  },

  // Actions
  tap_action: { action: 'none' },
  hold_action: { action: 'none' },

  // Cache and refresh settings
  refresh_interval: Constants.CACHE.DEFAULT_DATA_REFRESH_MINUTES,
  refresh_on_navigate: true,

  // Pattern matching for event customization
  // Array of Pattern objects: { pattern, regex, icon, color, label, priority, matchField, caseSensitive }
  patterns: [],
};

//-----------------------------------------------------------------------------
// CONFIGURATION UTILITIES
//-----------------------------------------------------------------------------

/**
 * Normalizes entity configuration to ensure consistent format
 */
export function normalizeEntities(
  entities: Array<
    | string
    | {
        entity: string;
        label?: string;
        color?: string;
        accent_color?: string;
        show_time?: boolean;
        show_location?: boolean;
        compact_events_to_show?: number;
        blocklist?: string;
        allowlist?: string;
        split_multiday_events?: boolean;
      }
  >,
): Array<Types.EntityConfig> {
  if (!Array.isArray(entities)) {
    return [];
  }

  return entities
    .map((item) => {
      if (typeof item === 'string') {
        return {
          entity: item,
          color: 'var(--primary-text-color)',
          accent_color: undefined,
        };
      }
      if (typeof item === 'object' && item.entity) {
        return {
          entity: item.entity,
          label: item.label,
          color: item.color || 'var(--primary-text-color)',
          accent_color: item.accent_color || undefined,
          show_time: item.show_time,
          show_location: item.show_location,
          compact_events_to_show: item.compact_events_to_show,
          blocklist: item.blocklist,
          allowlist: item.allowlist,
          split_multiday_events: item.split_multiday_events,
        };
      }
      return null;
    })
    .filter(Boolean) as Array<Types.EntityConfig>;
}

/**
 * Determine if configuration changes affect data retrieval
 */
export function hasConfigChanged(
  previous: Partial<Types.Config> | undefined,
  current: Types.Config,
): boolean {
  // Handle empty/undefined config
  if (!previous || Object.keys(previous).length === 0) {
    return true;
  }

  // Extract entity IDs without colors for comparison - entity colors are styling only
  // and don't require API data refresh
  const previousEntityIds = (previous.entities || [])
    .map((e) => (typeof e === 'string' ? e : e.entity))
    .sort()
    .join(',');

  const currentEntityIds = (current.entities || [])
    .map((e) => (typeof e === 'string' ? e : e.entity))
    .sort()
    .join(',');

  // Check refresh interval separately (it affects both timers and cache now)
  const refreshIntervalChanged = previous?.refresh_interval !== current?.refresh_interval;

  // Check if core data-affecting properties changed
  const dataChanged =
    previousEntityIds !== currentEntityIds ||
    previous.days_to_show !== current.days_to_show ||
    previous.start_date !== current.start_date ||
    previous.show_past_events !== current.show_past_events ||
    previous.filter_duplicates !== current.filter_duplicates;

  if (dataChanged || refreshIntervalChanged) {
    Logger.debug('Configuration change requires data refresh');
  }

  return dataChanged || refreshIntervalChanged;
}

/**
 * Check if entity colors have changed in the configuration
 * This is used to determine if a re-render (but not data refresh) is needed
 *
 * @param previous - Previous configuration
 * @param current - New configuration
 * @returns True if entity colors have changed
 */
export function haveEntityColorsChanged(
  previous: Partial<Types.Config> | undefined,
  current: Types.Config,
): boolean {
  if (!previous || !previous.entities) return false;

  const prevEntities = previous.entities;
  const currEntities = current.entities;

  // If entity count changed, let other functions handle it
  if (prevEntities.length !== currEntities.length) return false;

  // Create a map of entity IDs to colors for previous config
  const prevColorMap = new Map<string, string>();
  prevEntities.forEach((entity) => {
    if (typeof entity === 'string') {
      prevColorMap.set(entity, 'var(--primary-text-color)');
    } else {
      prevColorMap.set(entity.entity, entity.color || 'var(--primary-text-color)');
    }
  });

  // Check if any entity colors changed in current config
  for (const entity of currEntities) {
    const entityId = typeof entity === 'string' ? entity : entity.entity;
    const color =
      typeof entity === 'string'
        ? 'var(--primary-text-color)'
        : entity.color || 'var(--primary-text-color)';

    if (!prevColorMap.has(entityId)) {
      // New entity, let other functions handle it
      continue;
    }

    // If color changed for an existing entity, return true
    if (prevColorMap.get(entityId) !== color) {
      Logger.debug(`Entity color changed for ${entityId}, will re-render`);
      return true;
    }
  }

  return false;
}

//-----------------------------------------------------------------------------
// INITIALIZATION HELPERS
//-----------------------------------------------------------------------------

/**
 * Find a calendar entity in Home Assistant states
 */
export function findCalendarEntity(hass: Record<string, { state: string }>): string | null {
  // No valid hass object provided
  if (!hass || typeof hass !== 'object') {
    return null;
  }

  // Check for entities in the states property (standard Home Assistant structure)
  if ('states' in hass && typeof hass.states === 'object') {
    const stateKeys = Object.keys(hass.states);
    const calendarInStates = stateKeys.find((key) => key.startsWith('calendar.'));
    if (calendarInStates) {
      return calendarInStates;
    }
  }

  // Check for entities at the top level (alternative structure)
  return Object.keys(hass).find((entityId) => entityId.startsWith('calendar.')) || null;
}

/**
 * Generate a stub configuration for the card editor
 */
export function getStubConfig(hass: Record<string, { state: string }>): Record<string, unknown> {
  const calendarEntity = findCalendarEntity(hass);
  return {
    type: 'custom:calendar-card-pro-dev',
    entities: calendarEntity ? [calendarEntity] : [],
    days_to_show: 3,
    show_location: true,
    _description: !calendarEntity
      ? 'A calendar card that displays events from multiple calendars with individual styling. Add a calendar integration to Home Assistant to use this card.'
      : undefined,
  };
}
/**
 * Type definitions for Calendar Card Pro
 *
 * This file contains all type definitions used throughout the Calendar Card Pro application.
 */

// -----------------------------------------------------------------------------
// CORE CONFIGURATION
// -----------------------------------------------------------------------------

/**
 * Main configuration interface for the card
 */
export interface Config {
  // Core settings
  entities: Array<string | EntityConfig>;
  start_date?: string;
  days_to_show: number;
  compact_days_to_show?: number;
  compact_events_to_show?: number;
  compact_events_complete_days?: boolean;
  show_empty_days: boolean;
  filter_duplicates: boolean;
  split_multiday_events: boolean;
  language?: string;

  // Header
  title?: string;
  title_font_size?: string;
  title_color?: string;

  // Layout and spacing
  background_color: string;
  accent_color: string;
  vertical_line_width: string;
  day_spacing: string;
  event_spacing: string;
  additional_card_spacing: string;
  max_height: string;
  height: string;

  // Week numbers and horizontal separators
  first_day_of_week: 'sunday' | 'monday' | 'system';
  show_week_numbers: null | 'iso' | 'simple';
  show_current_week_number: boolean;
  week_number_font_size: string;
  week_number_color: string;
  week_number_background_color: string;
  day_separator_width: string;
  day_separator_color: string;
  week_separator_width: string;
  week_separator_color: string;
  month_separator_width: string;
  month_separator_color: string;

  // Today indicator
  today_indicator: string | boolean;
  today_indicator_position: string;
  today_indicator_color: string;
  today_indicator_size: string;

  // Date column
  date_vertical_alignment: string;
  weekday_font_size: string;
  weekday_color: string;
  day_font_size: string;
  day_color: string;
  show_month: boolean;
  month_font_size: string;
  month_color: string;
  weekend_weekday_color?: string;
  weekend_day_color?: string;
  weekend_month_color?: string;
  today_weekday_color?: string;
  today_day_color?: string;
  today_month_color?: string;

  // Event column
  event_background_opacity: number;
  show_past_events: boolean;
  show_countdown: boolean;
  show_progress_bar: boolean;
  progress_bar_color: string;
  progress_bar_height: string;
  progress_bar_width: string;
  event_font_size: string;
  event_color: string;
  empty_day_color: string;
  show_time: boolean;
  show_single_allday_time: boolean;
  time_24h: boolean | 'system';
  show_end_time: boolean;
  time_font_size: string;
  time_color: string;
  time_icon_size: string;
  show_location: boolean;
  remove_location_country: boolean | string;
  location_font_size: string;
  location_color: string;
  location_icon_size: string;

  // Weather
  weather?: WeatherConfig;

  // Actions
  tap_action: ActionConfig;
  hold_action: ActionConfig;

  // Cache and refresh settings
  refresh_interval: number;
  refresh_on_navigate: boolean;

  // Pattern matching for event customization
  patterns?: Pattern[];
}

/**
 * Calendar entity configuration
 */
export interface EntityConfig {
  entity: string;
  label?: string;
  color?: string;
  accent_color?: string;
  show_time?: boolean;
  show_location?: boolean;
  compact_events_to_show?: number;
  blocklist?: string;
  allowlist?: string;
  split_multiday_events?: boolean;
}

// -----------------------------------------------------------------------------
// PATTERN MATCHING
// -----------------------------------------------------------------------------

/**
 * Pattern definition for event matching and customization
 */
export interface Pattern {
  pattern: string;
  regex?: boolean;
  label?: string;
  icon?: string;
  color?: string;
  priority?: number;
  matchField?: 'summary' | 'description' | 'location' | 'all';
  caseSensitive?: boolean;
}

// Add these interfaces to src/config/types.ts

/**
 * Weather position-specific styling configuration
 */
export interface WeatherPositionConfig {
  show_conditions?: boolean;
  show_high_temp?: boolean;
  show_low_temp?: boolean;
  show_temp?: boolean;
  icon_size?: string;
  font_size?: string;
  color?: string;
}

/**
 * Weather configuration
 */
export interface WeatherConfig {
  entity?: string;
  position?: 'date' | 'event' | 'both';
  date?: WeatherPositionConfig;
  event?: WeatherPositionConfig;
}

/**
 * Raw weather forecast data from Home Assistant
 */
export interface WeatherForecast {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
  wind_speed?: number;
  wind_bearing?: number;
  humidity?: number;
}

/**
 * Processed weather data for use in templates
 */
export interface WeatherData {
  icon: string;
  condition: string;
  temperature: string | number;
  templow?: string | number;
  datetime: string;
  hour?: number;
  precipitation?: number;
  precipitation_probability?: number;
}

/**
 * Weather forecasts organized by type and date/time
 */
export interface WeatherForecasts {
  daily?: Record<string, WeatherData>;
  hourly?: Record<string, WeatherData>;
}

// -----------------------------------------------------------------------------
// CALENDAR DATA STRUCTURES
// -----------------------------------------------------------------------------

/**
 * Calendar event data structure
 */
export interface CalendarEventData {
  readonly start: { readonly dateTime?: string; readonly date?: string };
  readonly end: { readonly dateTime?: string; readonly date?: string };
  summary?: string;
  location?: string;
  _entityId?: string;
  _entityLabel?: string;
  _isEmptyDay?: boolean;
  _matchedConfig?: EntityConfig;
  _matchedPattern?: Pattern;
  time?: string;
}

/**
 * Grouped events by day
 */
export interface EventsByDay {
  weekday: string;
  day: number;
  month: string;
  timestamp: number;
  events: CalendarEventData[];
  weekNumber?: number | null; // Changed from number | undefined to number | null
  isFirstDayOfWeek?: boolean;
  isFirstDayOfMonth?: boolean;
  monthNumber?: number;
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
  events: CalendarEventData[];
  timestamp: number;
}

// -----------------------------------------------------------------------------
// USER INTERACTION
// -----------------------------------------------------------------------------

/**
 * Action configuration for tap and hold actions
 */
export interface ActionConfig {
  action: string;
  navigation_path?: string;
  service?: string;
  service_data?: object;
  url_path?: string;
  open_tab?: string;
}

/**
 * Context data for action execution
 */
export interface ActionContext {
  element: Element;
  hass: Hass | null;
  entityId?: string;
  toggleCallback?: () => void;
}

/**
 * Configuration for interaction module
 */
export interface InteractionConfig {
  tapAction?: ActionConfig;
  holdAction?: ActionConfig;
  context: ActionContext;
}

// -----------------------------------------------------------------------------
// HOME ASSISTANT INTEGRATION
// -----------------------------------------------------------------------------

/**
 * Home Assistant interface
 */
export interface Hass {
  states: Record<string, { state: string }>;
  callApi: (method: string, path: string, parameters?: object) => Promise<unknown>;
  callService: (domain: string, service: string, serviceData?: object) => void;
  locale?: {
    language: string;
    time_format?: string;
  };
  connection?: {
    subscribeEvents: (callback: (event: unknown) => void, eventType: string) => Promise<() => void>;
    subscribeMessage: (
      callback: (message: WeatherForecastMessage) => void,
      options: SubscribeMessageOptions,
    ) => () => void;
  };
  formatEntityState?: (stateObj: HassEntity, state: string) => string;
}

/**
 * Weather forecast message structure received from Home Assistant
 */
export interface WeatherForecastMessage {
  forecast: WeatherForecast[];
  forecast_type?: string;
  [key: string]: unknown;
}

/**
 * Home Assistant subscribe message options
 */
export interface SubscribeMessageOptions {
  type: string;
  entity_id: string;
  forecast_type?: string;
  [key: string]: unknown;
}

/**
 * Home Assistant state object type
 */
export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
  context?: {
    id?: string;
    parent_id?: string;
    user_id?: string | null;
  };
}

/**
 * Custom card registration interface for Home Assistant
 */
export interface CustomCard {
  type: string;
  name: string;
  preview: boolean;
  description: string;
  documentationURL?: string;
}

/**
 * Home Assistant more-info event interface
 */
export interface HassMoreInfoEvent extends CustomEvent {
  detail: {
    entityId: string;
  };
}

// -----------------------------------------------------------------------------
// UI SUPPORT
// -----------------------------------------------------------------------------

/**
 * Interface for language translations
 */
export interface Translations {
  loading: string;
  noEvents: string;
  error: string;
  allDay: string;
  multiDay: string;
  at: string;
  months: string[];
  daysOfWeek: string[];
  fullDaysOfWeek: string[];
  endsToday: string;
  endsTomorrow: string;
  editor?: {
    [key: string]: string | string[];
  };
}
