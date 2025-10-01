import { JSONValue } from "@/components/JSONViewer";

export const modelosData : JSONValue = {
  "serie": "SAGA",
  "modelos": {
    "SAGA 100": [
      "1105",
      "1110",
      "1120",
      "1130",
      "1130L",
      "1150",
      "1150L",
      "1150CL",
      "YEDRA",
      "CLASICA",
      "CORAL",
      "PROVENZAL",
      "SEMIPROVENZAL",
      "ACACIA",
      "ACACIA FM",
      "AZALEA",
      "AZALEA FM",
      "IRIS FM",
      "CAMELIA",
      "CAMELIA FM",
      "CINTIA",
      "CINTIA FM"
    ],
    "SAGA 100 CR": [
      "CORAL-CR",
      "CLASICA-CR",
      "CLASICA-CR REJA",
      "M1110-CR",
      "1150 CL-CR",
      "CINTIA FM-CRL",
      "CINTIA-CRL"
    ],
    "SAGACOR 100": [
      "1105",
      "1110",
      "1120",
      "1130",
      "1130L",
      "1150",
      "1150L",
      "1150CL",
      "YEDRA",
      "CLASICA",
      "CORAL",
      "PROVENZAL",
      "SEMIPROVENZAL",
      "ACACIA",
      "ACACIA FM",
      "AZALEA",
      "AZALEA FM",
      "IRIS FM",
      "CAMELIA",
      "CAMELIA FM",
      "CINTIA",
      "CINTIA FM"
    ],
    "SAGA M-100": [
      "1105",
      "1110",
      "CLASICO",
      "CORAL",
      "PROVENZAL",
      "SEMIPROVENZAL",
      "YEDRA"
    ]
  }
}

export const puertasData = {
  "serie": "SAGA",
  "dimensiones_base": {
    "< 800": [2000, 2050, 2100],
    "800": [2000, 2050, 2100],
    "900": [2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400],
    "950": [2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400],
    "1000": [2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400],
    "1100/1150": [2150, 2200, 2250, 2300, 2350, 2400],
    "1200": [2150, 2200, 2250, 2300, 2350, 2400]
  },
  "modelos": {
    "1105": {
      "lineas": ["SAGA 100", "SAGACOR 100"],
      "versatil": false,
      "combinaciones": {
        // < 800mm: no disponible
        // 800mm: todas disponibles, solo una cara
        "800x2000": { "disponible": true, "dos_caras": false },
        "800x2050": { "disponible": true, "dos_caras": false },
        "800x2100": { "disponible": true, "dos_caras": false },
        // 850mm: todas disponibles, solo una cara
        "850x2000": { "disponible": true, "dos_caras": false },
        "850x2050": { "disponible": true, "dos_caras": false },
        "850x2100": { "disponible": true, "dos_caras": false },
        // 900mm: todas disponibles, doble cara
        "900x2000": { "disponible": true, "dos_caras": true },
        "900x2050": { "disponible": true, "dos_caras": true },
        "900x2100": { "disponible": true, "dos_caras": true },
        "900x2150": { "disponible": true, "dos_caras": true },
        "900x2200": { "disponible": true, "dos_caras": true },
        "900x2250": { "disponible": true, "dos_caras": true },
        "900x2300": { "disponible": true, "dos_caras": true },
        "900x2350": { "disponible": true, "dos_caras": true },
        "900x2400": { "disponible": true, "dos_caras": true },
        // 950mm: todas disponibles, doble cara
        "950x2000": { "disponible": true, "dos_caras": true },
        "950x2050": { "disponible": true, "dos_caras": true },
        "950x2100": { "disponible": true, "dos_caras": true },
        "950x2150": { "disponible": true, "dos_caras": true },
        "950x2200": { "disponible": true, "dos_caras": true },
        "950x2250": { "disponible": true, "dos_caras": true },
        "950x2300": { "disponible": true, "dos_caras": true },
        "950x2350": { "disponible": true, "dos_caras": true },
        "950x2400": { "disponible": true, "dos_caras": true },
        // 1000mm: todas disponibles, doble cara
        "1000x2000": { "disponible": true, "dos_caras": true },
        "1000x2050": { "disponible": true, "dos_caras": true },
        "1000x2100": { "disponible": true, "dos_caras": true },
        "1000x2150": { "disponible": true, "dos_caras": true },
        "1000x2200": { "disponible": true, "dos_caras": true },
        "1000x2250": { "disponible": true, "dos_caras": true },
        "1000x2300": { "disponible": true, "dos_caras": true },
        "1000x2350": { "disponible": true, "dos_caras": true },
        "1000x2400": { "disponible": true, "dos_caras": true },
        // 1100/1150mm: todas disponibles, una cara
        "1100x2150": { "disponible": true, "dos_caras": false },
        "1100x2200": { "disponible": true, "dos_caras": false },
        "1100x2250": { "disponible": true, "dos_caras": false },
        "1100x2300": { "disponible": true, "dos_caras": false },
        "1100x2350": { "disponible": true, "dos_caras": false },
        "1100x2400": { "disponible": true, "dos_caras": false },
        "1150x2150": { "disponible": true, "dos_caras": false },
        "1150x2200": { "disponible": true, "dos_caras": false },
        "1150x2250": { "disponible": true, "dos_caras": false },
        "1150x2300": { "disponible": true, "dos_caras": false },
        "1150x2350": { "disponible": true, "dos_caras": false },
        "1150x2400": { "disponible": true, "dos_caras": false },
        // 1200mm: todas disponibles, una cara
        "1200x2150": { "disponible": true, "dos_caras": false },
        "1200x2200": { "disponible": true, "dos_caras": false },
        "1200x2250": { "disponible": true, "dos_caras": false },
        "1200x2300": { "disponible": true, "dos_caras": false },
        "1200x2350": { "disponible": true, "dos_caras": false },
        "1200x2400": { "disponible": true, "dos_caras": false }
      }
    },
    "1110": {
      "lineas": ["SAGA 100", "SAGACOR 100"],
      "versatil": true, // Puede usarse en cualquier cara y medida
      "combinaciones": {
        "800x2000": { "disponible": true, "dos_caras": true },
        "800x2050": { "disponible": true, "dos_caras": true }
        // ... todas las combinaciones con dos_caras: true
      }
    }
    // ... resto de modelos
  }
}
  





// Combined context data for the viewer
export const contextData: JSONValue = {
  puertas: puertasData,
};
