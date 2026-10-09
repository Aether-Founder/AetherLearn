"use client";

import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface SubjectButton {
  id: string;
  subjectId: string;
  subjectName: string;
  buttonText: string;
  htmlFile: string;
  createdAt: string;
}

export default function SubjectButtonsPage() {
  const [buttons, setButtons] = useState<SubjectButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingButton, setEditingButton] = useState<SubjectButton | null>(null);
  const [formData, setFormData] = useState({
    subjectId: "",
    subjectName: "",
    buttonText: "",
    htmlFile: "",
  });

  useEffect(() => {
    loadButtons();
  }, []);

  const loadButtons = async () => {
    try {
      const response = await fetch("/api/admin/subject-buttons");
      const data = await response.json();
      setButtons(data.buttons || []);
    } catch (error) {
      console.error("Error loading buttons:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveButtons = async () => {
    try {
      const response = await fetch("/api/admin/subject-buttons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttons }),
      });

      if (response.ok) {
        alert("Buttons saved successfully!");
      } else {
        alert("Failed to save buttons");
      }
    } catch (error) {
      console.error("Error saving buttons:", error);
      alert("Failed to save buttons");
    }
  };

  const handleAdd = () => {
    setEditingButton(null);
    setFormData({
      subjectId: "",
      subjectName: "",
      buttonText: "",
      htmlFile: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (button: SubjectButton) => {
    setEditingButton(button);
    setFormData({
      subjectId: button.subjectId,
      subjectName: button.subjectName,
      buttonText: button.buttonText,
      htmlFile: button.htmlFile,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this button?")) {
      setButtons(buttons.filter((b) => b.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.subjectId || !formData.subjectName || !formData.buttonText || !formData.htmlFile) {
      alert("Please fill in all fields");
      return;
    }

    if (editingButton) {
      setButtons(
        buttons.map((b) =>
          b.id === editingButton.id
            ? { ...b, ...formData }
            : b
        )
      );
    } else {
      const newButton: SubjectButton = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setButtons([...buttons, newButton]);
    }

    setShowDialog(false);
    saveButtons();
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Subject Buttons" description="Manage buttons for subjects" />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Subject Buttons"
        description="Add custom buttons to subjects that open standalone HTML files"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            HTML files should be stored in <code className="bg-secondary px-2 py-1 rounded">/public/standalone-html/</code>
          </p>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Button
          </Button>
        </div>

        <div className="border border-border rounded-lg divide-y divide-border">
          {buttons.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No buttons added yet
            </div>
          ) : (
            buttons.map((button) => (
              <div
                key={button.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="font-medium">{button.subjectName}</div>
                  <div className="text-sm text-muted-foreground">
                    Button: {button.buttonText} | File: {button.htmlFile}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(button)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(button.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Button onClick={saveButtons} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingButton ? "Edit Button" : "Add Button"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="subjectId">Subject ID</Label>
              <Input
                id="subjectId"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
                placeholder="e.g., biologie"
              />
            </div>
            <div>
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input
                id="subjectName"
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData({ ...formData, subjectName: e.target.value })
                }
                placeholder="e.g., Biologie"
              />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                placeholder="e.g., Open Extra Material"
              />
            </div>
            <div>
              <Label htmlFor="htmlFile">HTML File</Label>
              <Input
                id="htmlFile"
                value={formData.htmlFile}
                onChange={(e) =>
                  setFormData({ ...formData, htmlFile: e.target.value })
                }
                placeholder="e.g., biologie-extra.html"
              />
              <p className="text-xs text-muted-foreground mt-1">
                File must be in /public/standalone-html/
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
