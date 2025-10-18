import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Phone, Mail, Plus, Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function TrustedContacts() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const contacts = useQuery(api.guardianMutations.getTrustedContacts);
  const addContact = useMutation(api.guardianMutations.addTrustedContact);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    contactName: "",
    phoneNumber: "",
    email: "",
    relationship: "",
    isPrimary: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactName.trim() || !formData.phoneNumber.trim()) {
      toast.error("Name and phone number are required");
      return;
    }

    try {
      await addContact(formData);
      toast.success("Trusted contact added successfully");
      setIsOpen(false);
      setFormData({
        contactName: "",
        phoneNumber: "",
        email: "",
        relationship: "",
        isPrimary: false,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to add contact");
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trusted Emergency Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Add contacts who can be notified in case of emergency
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Trusted Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name *</label>
                <Input
                  placeholder="Contact name"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Relationship</label>
                <Input
                  placeholder="e.g., Parent, Sibling, Friend"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPrimary" className="text-sm">
                  Set as primary contact
                </label>
              </div>

              <Button type="submit" className="w-full">
                Add Contact
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts List */}
      {contacts === undefined ? (
        <p className="text-sm text-muted-foreground">Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No trusted contacts added yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add emergency contacts who can be notified during travel
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{contact.contactName}</h4>
                    {contact.isPrimary && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phoneNumber}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.relationship && (
                      <p className="text-xs">Relationship: {contact.relationship}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}