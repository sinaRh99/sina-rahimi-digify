export interface Country {
  cca3: string; // can be used as key when rendering a list of countries
  area: number;
  flags: {
    alt: string; // can be used as image alt tag
    png: string;
  };
  name: {
    common: string;
  };
  population: number;
  region: string;
}
