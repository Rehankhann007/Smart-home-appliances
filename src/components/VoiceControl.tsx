import React, { useState, useEffect } from "react";
import { MicIcon, MicOffIcon, HouseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { Command, parseVoiceCommand, getCommandFeedback } from "@/utils/commandParser";
import Dashboard from "./Dashboard";
import CommandHistory from "./CommandHistory";
import { Device, devices as initialDevices } from "@/data/devices";

const VoiceControl = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("Say a command to control your smart home");
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);
  const [recentCommand, setRecentCommand] = useState<Command | null>(null);

  const { toast } = useToast();
  const { isListening, startListening, stopListening, supported } = useSpeechRecognition({
    onResult: handleVoiceResult,
    onError: (error) => console.error("Speech recognition error:", error)
  });

  useEffect(() => {
    if (recentCommand) {
      const timer = setTimeout(() => setRecentCommand(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentCommand]);

  function handleVoiceResult(transcript: string) {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    const command = parseVoiceCommand(transcript);
    setCommandHistory(prev => [...prev, command]);
    setRecentCommand(command);
    setFeedback(getCommandFeedback(command));
    executeCommand(command);

    setTimeout(() => setIsProcessing(false), 1000);
  }

  function executeCommand(command: Command) {
    if (command.action === 'unknown') return;

    setDevices(prevDevices => {
      let updatedDevices = [...prevDevices];
      let targetDevices: Device[] = [];

      if (command.deviceId) {
        const device = updatedDevices.find(d => d.id === command.deviceId);
        if (device) targetDevices = [device];
      } else if (command.deviceType && command.location) {
        targetDevices = updatedDevices.filter(d => d.type === command.deviceType && d.location === command.location);
      } else if (command.deviceType) {
        targetDevices = updatedDevices.filter(d => d.type === command.deviceType);
      } else if (command.location) {
        targetDevices = updatedDevices.filter(d => d.location === command.location);
      }

      if (targetDevices.length > 0) {
        updatedDevices = updatedDevices.map(device => {
          if (targetDevices.some(d => d.id === device.id)) {
            let updatedDevice = { ...device };
            switch (command.action) {
              case 'turn_on':
                updatedDevice.isActive = true;
                break;
              case 'turn_off':
                updatedDevice.isActive = false;
                break;
              case 'toggle':
                updatedDevice.isActive = !device.isActive;
                break;
              case 'set_intensity':
                if (device.supportsIntensity && command.intensity !== undefined) {
                  updatedDevice.intensity = command.intensity;
                  updatedDevice.isActive = true;
                }
                break;
            }
            return updatedDevice;
          }
          return device;
        });

        toast({
          title: "Command Executed",
          description: getCommandFeedback(command),
        });

        return updatedDevices;
      } else {
        toast({
          title: "No Matching Devices",
          description: "Couldn't find any device matching your command.",
          variant: "destructive",
        });
        return prevDevices;
      }
    });
  }

  const handleDeviceUpdate = (updatedDevices: Device[]) => {
    setDevices(updatedDevices);
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HouseIcon className="h-8 w-8 text-smart-home-accent" />
          <h1 className="text-2xl font-bold">Home Harmony</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-smart-home-card rounded-xl p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">My Devices</h2>
            <Dashboard devices={devices} onDeviceUpdate={handleDeviceUpdate} recentCommand={recentCommand} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-smart-home-card rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Voice Control</h2>
              <Button
                variant={isListening ? "destructive" : "default"}
                className={cn(
                  "relative",
                  isListening ? "bg-smart-home-inactive hover:bg-smart-home-inactive/90" : "bg-smart-home-accent hover:bg-smart-home-accent/90"
                )}
                onClick={isListening ? stopListening : startListening}
                disabled={!supported}
              >
                {isListening ? (
                  <>
                    <MicOffIcon className="h-4 w-4 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <MicIcon className="h-4 w-4 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>

            <div className={cn(
              "flex items-center justify-center p-8 rounded-lg border mb-4 text-center transition-all",
              isListening
                ? "bg-smart-home-accent/10 border-smart-home-accent"
                : "bg-smart-home-bg border-smart-home-card"
            )}>
              {isListening ? (
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1.5 h-6 bg-smart-home-accent rounded-full"
                        style={{ animation: `wave 1.5s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm">Listening for commands...</p>
                </div>
              ) : isProcessing ? (
                <p className="text-sm">Processing command...</p>
              ) : (
                <div>
                  <p className="text-sm mb-2">{feedback}</p>
                  {!supported && (
                    <p className="text-xs text-smart-home-inactive">
                      Speech recognition not supported in your browser.
                    </p>
                  )}
                </div>
              )}
            </div>

            <Tabs defaultValue="history">
              <TabsList className="grid w-full grid-cols-1 bg-smart-home-bg">
                <TabsTrigger value="history">Command History</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="pt-4">
                <CommandHistory commands={commandHistory} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;
