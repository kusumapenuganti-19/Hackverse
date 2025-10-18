declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: any);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
        panTo(latlng: LatLng | LatLngLiteral): void;
      }

      class Marker {
        constructor(opts?: any);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng | LatLngLiteral): void;
        addListener(eventName: string, handler: Function): void;
      }

      class Polyline {
        constructor(opts?: any);
        setMap(map: Map | null): void;
        setPath(path: LatLng[] | LatLngLiteral[]): void;
      }

      class InfoWindow {
        constructor(opts?: any);
        open(map: Map, anchor?: Marker): void;
        close(): void;
        setContent(content: string | Node): void;
      }

      class LatLngBounds {
        constructor();
        extend(point: LatLng | LatLngLiteral): void;
        contains(latlng: LatLng | LatLngLiteral): boolean;
        getNorthEast(): LatLng;
        getSouthWest(): LatLng;
        getCenter(): LatLng;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      class DirectionsService {
        constructor();
        route(request: DirectionsRequest, callback: (result: DirectionsResult, status: DirectionsStatus) => void): void;
      }

      class DirectionsRenderer {
        constructor(opts?: DirectionsRendererOptions);
        setMap(map: Map | null): void;
        setDirections(directions: DirectionsResult): void;
        setRouteIndex(routeIndex: number): void;
      }

      // Autocomplete API
      namespace places {
        class Autocomplete {
          constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
          addListener(eventName: string, handler: Function): void;
          getPlace(): PlaceResult;
          setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
          setComponentRestrictions(restrictions: ComponentRestrictions): void;
        }

        interface AutocompleteOptions {
          bounds?: LatLngBounds | LatLngBoundsLiteral;
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
          strictBounds?: boolean;
          types?: string[];
        }

        interface ComponentRestrictions {
          country?: string | string[];
        }

        interface PlaceResult {
          address_components?: AddressComponent[];
          formatted_address?: string;
          geometry?: PlaceGeometry;
          name?: string;
          place_id?: string;
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }

        interface PlaceGeometry {
          location: LatLng;
          viewport: LatLngBounds;
        }
      }

      interface DirectionsRendererOptions {
        map?: Map | null;
        directions?: DirectionsResult;
        routeIndex?: number;
        suppressMarkers?: boolean;
        suppressInfoWindows?: boolean;
        suppressBicyclingLayer?: boolean;
        polylineOptions?: any;
        markerOptions?: any;
        preserveViewport?: boolean;
      }

      interface DirectionsRequest {
        origin: string | LatLng | LatLngLiteral;
        destination: string | LatLng | LatLngLiteral;
        travelMode: TravelMode;
        waypoints?: DirectionsWaypoint[];
        optimizeWaypoints?: boolean;
        provideRouteAlternatives?: boolean;
        avoidHighways?: boolean;
        avoidTolls?: boolean;
      }

      interface DirectionsWaypoint {
        location: string | LatLng | LatLngLiteral;
        stopover?: boolean;
      }

      interface DirectionsResult {
        routes: DirectionsRoute[];
        request: DirectionsRequest;
        geocoded_waypoints?: any[];
      }

      interface DirectionsRoute {
        legs: DirectionsLeg[];
        overview_path: LatLng[];
        overview_polyline: string;
        summary: string;
        warnings: string[];
        waypoint_order: number[];
        bounds: LatLngBounds;
      }

      interface DirectionsLeg {
        start_location: LatLng;
        end_location: LatLng;
        start_address: string;
        end_address: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        steps: DirectionsStep[];
      }

      interface DirectionsStep {
        start_location: LatLng;
        end_location: LatLng;
        instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }

      enum DirectionsStatus {
        OK = "OK",
        NOT_FOUND = "NOT_FOUND",
        ZERO_RESULTS = "ZERO_RESULTS",
        MAX_WAYPOINTS_EXCEEDED = "MAX_WAYPOINTS_EXCEEDED",
        INVALID_REQUEST = "INVALID_REQUEST",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
      }

      enum TravelMode {
        DRIVING = "DRIVING",
        WALKING = "WALKING",
        BICYCLING = "BICYCLING",
        TRANSIT = "TRANSIT",
      }

      enum SymbolPath {
        CIRCLE = 0,
        FORWARD_CLOSED_ARROW = 1,
        FORWARD_OPEN_ARROW = 2,
        BACKWARD_CLOSED_ARROW = 3,
        BACKWARD_OPEN_ARROW = 4,
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface LatLngBoundsLiteral {
        east: number;
        north: number;
        south: number;
        west: number;
      }

      namespace geometry {
        namespace encoding {
          function decodePath(encodedPath: string): LatLng[];
          function encodePath(path: LatLng[] | LatLngLiteral[]): string;
        }
      }
    }
  }

  interface Window {
    google: typeof google;
  }
}

export {};