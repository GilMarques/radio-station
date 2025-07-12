export namespace RadioBrowserApi {
  export type BaseUrl = {
    ip: string;
    name: string;
  };

  export type Country = {
    iso_3166_1: string;
    name: string;
    stationcount: number;
  };

  export type State = {
    name: string;
    country: string;
    stationcount: number;
  };

  export type Language = {
    name: string;
    iso_639: string;
    stationcount: number;
  };

  export type Tag = {
    name: string;
    stationcount: number;
  };

  export type Station = {
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

  export type AddStationOptions = {
    name: string;
    url: string;
    homepage: string;
    favicon: string;
    countrycode: string;
    state: string;
    iso_3166_2: string;
    language: string;
    tags: string;
    geo_lat: string;
    geo_long: string;
  };

  export function getThumbnailUrl(station: Station): string {
    return station.favicon
      ? station.favicon
      : station.homepage + '/favicon.ico';
  }

  export function getStationCountryCode(station: Station): string {
    if (station.countrycode) {
      return station.countrycode;
    }

    if (station.iso_3166_2) {
      return station.iso_3166_2;
    }

    return '';
  }
}
