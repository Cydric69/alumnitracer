// types/address.ts
export interface Region {
  code: string;
  name: string;
  regionName: string;
}

export interface Province {
  code: string;
  name: string;
  regionCode: string;
}

export interface City {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Barangay {
  code: string;
  name: string;
  cityCode: string;
}
