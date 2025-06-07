
import React from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Configure your irrigation system</p>
            </div>
            
            <Tabs defaultValue="general" className="mb-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="sensors">Sensors</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure your irrigation system settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="system-name">System Name</Label>
                        <Input id="system-name" defaultValue="Home Garden System" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" defaultValue="Backyard" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select 
                          id="timezone" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="America/Los_Angeles"
                        >
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="units">Units</Label>
                        <select 
                          id="units" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="imperial"
                        >
                          <option value="imperial">Imperial (°F, in)</option>
                          <option value="metric">Metric (°C, mm)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-irrigation">Automatic Irrigation</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow the system to automatically irrigate based on calculations
                          </p>
                        </div>
                        <Switch id="auto-irrigation" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="rain-detection">Rain Detection</Label>
                          <p className="text-sm text-muted-foreground">
                            Skip scheduled irrigation if rain is detected or forecasted
                          </p>
                        </div>
                        <Switch id="rain-detection" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure when you want to receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="irrigation-events">Irrigation Events</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify when irrigation starts or completes
                          </p>
                        </div>
                        <Switch id="irrigation-events" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="moisture-alerts">Low Moisture Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify when soil moisture falls below threshold
                          </p>
                        </div>
                        <Switch id="moisture-alerts" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weather-alerts">Weather Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify about significant weather changes
                          </p>
                        </div>
                        <Switch id="weather-alerts" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="system-alerts">System Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify about system issues or maintenance needs
                          </p>
                        </div>
                        <Switch id="system-alerts" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sensors" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sensor Configuration</CardTitle>
                    <CardDescription>Manage connected sensors and calibration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h3 className="font-medium">Soil Moisture Sensor 1</h3>
                            <p className="text-sm text-gray-500">Zone: Main Garden</p>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">Calibrate</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h3 className="font-medium">Temperature Sensor 1</h3>
                            <p className="text-sm text-gray-500">Zone: Main Garden</p>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">Calibrate</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h3 className="font-medium">Rain Sensor</h3>
                            <p className="text-sm text-gray-500">Zone: Roof</p>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">Calibrate</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button className="bg-irrigation-green hover:bg-irrigation-green/90">
                        Add New Sensor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Configure advanced system parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="polling-rate">Sensor Polling Rate (minutes)</Label>
                        <Input id="polling-rate" type="number" defaultValue={15} min={1} max={60} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="moisture-threshold">Moisture Threshold (%)</Label>
                        <Input id="moisture-threshold" type="number" defaultValue={25} min={5} max={50} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="api-key">Weather API Key</Label>
                      <Input id="api-key" type="password" defaultValue="*********************" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="data-storage">Data Storage Duration (days)</Label>
                        <Input id="data-storage" type="number" defaultValue={30} min={1} max={365} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-freq">Backup Frequency (days)</Label>
                        <Input id="backup-freq" type="number" defaultValue={7} min={1} max={30} />
                      </div>
                    </div>
                    
                    <div className="pt-4 space-x-2">
                      <Button variant="destructive">Reset System</Button>
                      <Button variant="outline">Export Data</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-irrigation-green hover:bg-irrigation-green/90">Save Settings</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
