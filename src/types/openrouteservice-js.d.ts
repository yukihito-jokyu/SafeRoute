declare module 'openrouteservice-js' {
  namespace Openrouteservice {
    interface DirectionsOptions {
      coordinates: number[][];
      profile?: string;
      format?: string;
    }

    interface Directions {
      calculate(options: DirectionsOptions): OrsDirectionsResponse;
      calculate(options: DirectionsOptions, callback: (err: any, result: any) => void): void;
    }

    class Directions {
      constructor(options?: { api_key: string });
    }

    // 他にも必要があれば追加
  }

  const Openrouteservice: {
    Directions: typeof Openrouteservice.Directions;
  };

  export default Openrouteservice;
}
