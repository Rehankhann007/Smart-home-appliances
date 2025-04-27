import React from "react";
import { Device } from "@/data/devices";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DeviceCardProps {
  device: Device;
  onToggle: (deviceId: string) => void;
  onIntensityChange?: (deviceId: string, intensity: number) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, onIntensityChange }) => {
  const handleIntensityChange = (value: number[]) => {
    if (onIntensityChange) {
      onIntensityChange(device.id, value[0]);
    }
  };

  const getIntensityLabel = () => {
    if (device.type === 'thermostat') {
      return `${device.intensity}°F`;
    }
    if (device.type === 'fan') {
      return `Speed: ${device.intensity}%`;
    }
    return `${device.intensity}%`;
  };

  return (
    <div className={cn(
      "p-4 rounded-xl transition-all duration-300 bg-smart-home-card hover:shadow-lg",
      device.isActive && "border border-smart-home-active"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              device.isActive 
                ? "bg-smart-home-active text-black" 
                : "bg-smart-home-inactive/20 text-smart-home-inactive"
            )}>
              <device.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{device.name}</h3>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs mt-1 border-none bg-gray-800/50",
                  device.isActive ? "text-smart-home-active" : "text-smart-home-muted"
                )}
              >
                {device.location}
              </Badge>
            </div>
          </div>
        </div>
        <Switch 
          checked={device.isActive} 
          onCheckedChange={() => onToggle(device.id)} 
          className="data-[state=checked]:bg-smart-home-active"
        />
      </div>

      {device.supportsIntensity && device.isActive && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-smart-home-muted">
              {device.type === 'thermostat' ? 'Temperature' : 'Intensity'}
            </span>
            <span className="font-medium">{getIntensityLabel()}</span>
          </div>
          <Slider
            defaultValue={[device.intensity || 50]}
            max={device.type === 'thermostat' ? 90 : 100}
            min={device.type === 'thermostat' ? 60 : 10}
            step={1}
            onValueChange={handleIntensityChange}
            disabled={!device.isActive}
            className="data-[disabled]:opacity-50"
          />
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
