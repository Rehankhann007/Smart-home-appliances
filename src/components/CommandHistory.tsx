
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command } from "@/utils/commandParser";
import { cn } from "@/lib/utils";

interface CommandHistoryProps {
  commands: Command[];
}

const CommandHistory: React.FC<CommandHistoryProps> = ({ commands }) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when new commands are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [commands]);

  if (commands.length === 0) {
    return (
      <div className="text-center py-12 text-smart-home-muted">
        <p>No commands yet. Try saying "Turn on the lights"</p>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-[300px] rounded-md border border-smart-home-card p-2">
      <div className="space-y-3 pr-2">
        {commands.map((command, index) => (
          <div 
            key={index} 
            className={cn(
              "p-3 rounded-lg",
              command.action === 'unknown' 
                ? "bg-smart-home-inactive/20 border border-smart-home-inactive/30" 
                : "bg-smart-home-card"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs rounded-full px-2 py-0.5",
                  command.action === 'unknown' ? "bg-smart-home-inactive/30 text-smart-home-inactive" :
                  command.action === 'turn_on' ? "bg-smart-home-active/30 text-smart-home-active" :
                  command.action === 'turn_off' ? "bg-smart-home-inactive/30 text-smart-home-inactive" :
                  command.action === 'toggle' ? "bg-smart-home-accent/30 text-smart-home-accent" :
                  "bg-blue-500/30 text-blue-400"
                )}>
                  {command.action.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-smart-home-muted">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1 text-sm">"{command.originalText}"</p>
            {command.deviceId && (
              <div className="mt-2 text-xs text-smart-home-muted">
                Device: {command.deviceType} | Location: {command.location}
                {command.intensity && ` | Intensity: ${command.intensity}${command.deviceType === 'thermostat' ? '°F' : '%'}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CommandHistory;
