export type RadioBrowserBase = {
  ip: string;
  name: string;
};

export type RadioBrowserCountry = {
  iso_3166_1: string;
  name: string;
  stationcount: number;
};

export type RadioBrowserServerConfig = {
  check_enabled: boolean;
  prometheus_exporter_enabled: boolean;
  pull_servers: string[];
  tcp_timeout_seconds: number;
  broken_stations_never_working_timeout_seconds: number;
  broken_stations_timeout_seconds: number;
  checks_timeout_seconds: number;
  click_valid_timeout_seconds: number;
  clicks_timeout_seconds: number;
  mirror_pull_interval_seconds: number;
  update_caches_interval_seconds: number;
  server_name: string;
  server_location: string;
  server_country_code: string;
  check_retries: number;
  check_batchsize: number;
  check_pause_seconds: number;
  api_threads: number;
  cache_type: string;
  cache_ttl: number;
  language_replace_filepath: string;
  language_to_code_filepath: string;
};

export type RadioBrowserStation = {
  changeuuid: string;
  stationuuid: string;
  serveruuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  iso_3166_2: string;
  state: string;
  language: string;
  languagecodes: string;
  votes: number;
  lastchangetime: string;
  lastchangetime_iso8601: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime: string;
  lastchecktime_iso8601: string;
  lastcheckoktime: string;
  lastcheckoktime_iso8601: string;
  lastlocalchecktime: string;
  lastlocalchecktime_iso8601: string;
  clicktimestamp: string;
  clicktimestamp_iso8601: string;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
  geo_lat: number;
  geo_long: number;
  geo_distance: number | null;
  has_extended_info: boolean;
};
