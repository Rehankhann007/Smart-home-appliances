import React from "react";
import { Device, deviceLocations } from "@/data/devices";
import DeviceCard from "./DeviceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Command } from "@/utils/commandParser";

interface DashboardProps {
  devices: Device[];
  onDeviceUpdate: (updatedDevices: Device[]) => void;
  recentCommand?: Command | null;
}

const Dashboard: React.FC<DashboardProps> = ({ devices, onDeviceUpdate, recentCommand }) => {
  const [activeLocation, setActiveLocation] = React.useState<string>("all");

  const handleToggleDevice = (deviceId: string) => {
    const updated = devices.map(device =>
      device.id === deviceId ? { ...device, isActive: !device.isActive } : device
    );
    onDeviceUpdate(updated);
  };

  const handleIntensityChange = (deviceId: string, intensity: number) => {
    const updated = devices.map(device =>
      device.id === deviceId ? { ...device, intensity } : device
    );
    onDeviceUpdate(updated);
  };

  const filteredDevices = activeLocation === "all"
    ? devices
    : devices.filter(device => device.location === activeLocation);

  const shouldHighlight = (device: Device) => {
    if (!recentCommand) return false;
    return (
      recentCommand.deviceId === device.id ||
      (recentCommand.deviceType === device.type && recentCommand.location === device.location)
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={setActiveLocation}>
        <TabsList className="grid grid-cols-4 md:grid-cols-6 bg-smart-home-card">
          <TabsTrigger value="all">All</TabsTrigger>
          {deviceLocations.map(location => (
            <TabsTrigger key={location} value={location}>{location}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeLocation} className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map(device => (
              <div key={device.id} className={cn(
                "transition-all duration-500",
                shouldHighlight(device) && "ring-2 ring-smart-home-accent rounded-xl animate-pulse"
              )}>
                <DeviceCard
                  device={device}
                  onToggle={handleToggleDevice}
                  onIntensityChange={handleIntensityChange}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
