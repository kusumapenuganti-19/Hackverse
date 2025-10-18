import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function IncidentReport() {
  const reportIncident = useAction(api.guardian.reportIncident);

  const [formData, setFormData] = useState({
    location: "",
    latitude: "",
    longitude: "",
    incidentType: "",
    description: "",
    severity: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success("Location captured");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location.trim() || !formData.incidentType || !formData.description.trim() || !formData.severity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error("Please provide location coordinates");
      return;
    }

    setSubmitting(true);
    toast.info("Raayan is recording your incident report...");

    try {
      await reportIncident({
        location: formData.location,
        coordinates: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
        },
        incidentType: formData.incidentType as any,
        description: formData.description,
        severity: formData.severity as any,
      });

      toast.success("Raayan has recorded your incident report. Thank you for helping keep our community safe.");
      
      // Reset form
      setFormData({
        location: "",
        latitude: "",
        longitude: "",
        incidentType: "",
        description: "",
        severity: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to report incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Report Safety Incident</h3>
            <p className="text-sm text-muted-foreground">
              Help Raayan keep the community safe by reporting incidents in your area
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Location *</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter location or address"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetCurrentLocation}
                title="Use current location"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Latitude</label>
              <Input
                type="number"
                step="any"
                placeholder="17.3850"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Longitude</label>
              <Input
                type="number"
                step="any"
                placeholder="78.4867"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Incident Type *</label>
            <Select value={formData.incidentType} onValueChange={(value) => setFormData({ ...formData, incidentType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="unsafe_area">Unsafe Area</SelectItem>
                <SelectItem value="poor_lighting">Poor Lighting</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <Textarea
              placeholder="Describe what happened..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Severity *</label>
            <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor concern</SelectItem>
                <SelectItem value="medium">Medium - Moderate risk</SelectItem>
                <SelectItem value="high">High - Serious threat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Raayan is Recording...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-4 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Your report will be reviewed and verified by Raayan's team. 
          All reports are anonymous unless you choose to provide contact information. 
          For immediate emergencies, please call local emergency services.
        </p>
      </Card>
    </div>
  );
}