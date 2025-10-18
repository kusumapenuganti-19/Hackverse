import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuardianSearch from "@/components/GuardianSearch";
import TrustedContacts from "@/components/TrustedContacts";
import IncidentReport from "@/components/IncidentReport";
import EmergencyPanel from "@/components/EmergencyPanel";
import SafeZonesSearch from "@/components/SafeZonesSearch";

export default function Guardian() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raayan Guardian</h1>
            <p className="text-muted-foreground mt-1">
              Your AI-powered safety companion for secure travel
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Guardian Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Safety & Emergency Support</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time route analysis, emergency support, and safety features
            </p>
          </div>

          {/* Guardian Tabs */}
          <Tabs defaultValue="route" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="route">Route Safety</TabsTrigger>
              <TabsTrigger value="safezones">Safe Zones</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="report">Report Incident</TabsTrigger>
            </TabsList>

            <TabsContent value="route">
              <GuardianSearch />
            </TabsContent>

            <TabsContent value="safezones">
              <div className="max-w-4xl mx-auto">
                <SafeZonesSearch />
              </div>
            </TabsContent>

            <TabsContent value="emergency">
              <div className="grid md:grid-cols-2 gap-6">
                <EmergencyPanel />
                <TrustedContacts />
              </div>
            </TabsContent>

            <TabsContent value="report">
              <div className="max-w-2xl mx-auto">
                <IncidentReport />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
