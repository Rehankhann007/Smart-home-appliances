import { Device, DeviceType, devices } from "../data/devices";

export interface Command {
  action: 'turn_on' | 'turn_off' | 'toggle' | 'set_intensity' | 'unknown';
  deviceId?: string;
  deviceType?: DeviceType;
  location?: string;
  intensity?: number;
  originalText: string;
}

const ON_KEYWORDS = ['turn on', 'switch on', 'enable', 'activate', 'power on'];
const OFF_KEYWORDS = ['turn off', 'switch off', 'disable', 'deactivate', 'power off'];
const TOGGLE_KEYWORDS = ['toggle', 'flip', 'switch'];
const INTENSITY_KEYWORDS = ['set', 'adjust', 'change', 'make'];
const INTENSITY_PARAMS = ['brightness', 'intensity', 'level', 'temperature', 'speed'];

export function parseVoiceCommand(text: string): Command {
  const lowerText = text.toLowerCase();
  
  let action: Command['action'] = 'unknown';
  
  if (ON_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    action = 'turn_on';
  } else if (OFF_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    action = 'turn_off';
  } else if (TOGGLE_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    action = 'toggle';
  } else if (INTENSITY_KEYWORDS.some(keyword => lowerText.includes(keyword)) && 
            INTENSITY_PARAMS.some(param => lowerText.includes(param))) {
    action = 'set_intensity';
  }
  
  let targetDevice: Device | undefined;
  let location: string | undefined;

  for (const device of devices) {
    if (lowerText.includes(device.name.toLowerCase())) {
      targetDevice = device;
      break;
    }
  }

  if (!targetDevice) {
    for (const device of devices) {
      if (lowerText.includes(device.type.toLowerCase())) {
        if (lowerText.includes(device.location.toLowerCase())) {
          targetDevice = device;
          location = device.location;
          break;
        } else {
          targetDevice = device;
        }
      }
    }
  }

  if (!location) {
    for (const device of devices) {
      if (lowerText.includes(device.location.toLowerCase())) {
        location = device.location;
        if (!targetDevice) targetDevice = device;
        break;
      }
    }
  }

  let intensity: number | undefined;
  if (action === 'set_intensity') {
    const percentMatch = lowerText.match(/(\d+)(\s*)(%|percent)/);
    const numberMatch = lowerText.match(/\b(\d+)\b/);
    
    if (percentMatch) {
      intensity = Number(percentMatch[1]);
    } else if (numberMatch) {
      intensity = Number(numberMatch[0]);
      if (!lowerText.includes('temperature') && intensity > 0 && intensity <= 10) {
        intensity = intensity * 10;
      }
    }
  }

  return {
    action,
    deviceId: targetDevice?.id,
    deviceType: targetDevice?.type,
    location,
    intensity,
    originalText: text
  };
}

export function getCommandFeedback(command: Command): string {
  if (command.action === 'unknown') {
    return "I didn't understand that command. Try saying something like 'Turn on the living room light'.";
  }

  const deviceName = command.deviceId ? 
    devices.find(d => d.id === command.deviceId)?.name : 
    command.deviceType || command.location || "device";

  switch (command.action) {
    case 'turn_on':
      return `Turning on ${deviceName}.`;
    case 'turn_off':
      return `Turning off ${deviceName}.`;
    case 'toggle':
      return `Toggling ${deviceName}.`;
    case 'set_intensity':
      return `Setting ${deviceName} ${command.deviceType === 'thermostat' ? 'temperature' : 'intensity'} to ${command.intensity}${command.deviceType === 'thermostat' ? '°F' : '%'}.`;
    default:
      return "Processing your command...";
  }
}
