
import { LightbulbIcon, MonitorIcon, FanIcon, PowerIcon, HeaterIcon, RefrigeratorIcon, WashingMachineIcon } from "lucide-react";

export type DeviceType = 
  | 'light'
  | 'tv'
  | 'fan'
  | 'outlet'
  | 'thermostat'
  | 'refrigerator'
  | 'washer';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  icon: typeof LightbulbIcon;
  isActive: boolean;
  location: string;
  supportsIntensity?: boolean;
  intensity?: number;
}

export const devices: Device[] = [
  {
    id: "light-living-1",
    name: "Living Room Light",
    type: "light",
    icon: LightbulbIcon,
    isActive: false,
    location: "Living Room",
    supportsIntensity: true,
    intensity: 80
  },
  {
    id: "light-kitchen-1",
    name: "Kitchen Light",
    type: "light",
    icon: LightbulbIcon,
    isActive: false,
    location: "Kitchen",
    supportsIntensity: true,
    intensity: 100
  },
  {
    id: "light-bedroom-1",
    name: "Bedroom Light",
    type: "light",
    icon: LightbulbIcon,
    isActive: false,
    location: "Bedroom",
    supportsIntensity: true,
    intensity: 70
  },
  {
    id: "tv-living-1",
    name: "Living Room TV",
    type: "tv",
    icon: MonitorIcon,
    isActive: false,
    location: "Living Room"
  },
  {
    id: "fan-bedroom-1",
    name: "Bedroom Fan",
    type: "fan",
    icon: FanIcon,
    isActive: false,
    location: "Bedroom",
    supportsIntensity: true,
    intensity: 50
  },
  {
    id: "outlet-kitchen-1",
    name: "Kitchen Outlet",
    type: "outlet",
    icon: PowerIcon,
    isActive: false,
    location: "Kitchen"
  },
  {
    id: "thermostat-home-1",
    name: "Home Thermostat",
    type: "thermostat",
    icon: HeaterIcon,
    isActive: false,
    location: "Home",
    supportsIntensity: true,
    intensity: 72
  },
  {
    id: "refrigerator-kitchen-1",
    name: "Refrigerator",
    type: "refrigerator",
    icon: RefrigeratorIcon,
    isActive: false,
    location: "Kitchen"
  },
  {
    id: "washer-laundry-1",
    name: "Washing Machine",
    type: "washer",
    icon: WashingMachineIcon,
    isActive: false,
    location: "Laundry Room"
  }
];

export const deviceLocations = Array.from(new Set(devices.map(device => device.location)));
