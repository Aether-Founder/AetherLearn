"use client";

import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X, Users, Check, X as XIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface SecretSubject {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

interface AccessRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  secret_subject_id: string;
  status: "pending" | "approved" | "disapproved";
  requested_at: string;
}

export default function SecretSubjectsPage() {
  const [secretSubjects, setSecretSubjects] = useState<SecretSubject[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SecretSubject | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    loadSecretSubjects();
    loadAccessRequests();
  }, []);

  const loadSecretSubjects = async () => {
    try {
      const response = await fetch("/api/admin/secret-subjects");
      const data = await response.json();
      setSecretSubjects(data.secretSubjects || []);
    } catch (error) {
      console.error("Error loading secret subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("secret_subject_access")
        .select(`
          *,
          user:auth.users(email, user_metadata)
        `);

      if (error) throw error;

      const requests: AccessRequest[] = (data || []).map((req: any) => ({
        id: req.id,
        user_id: req.user_id,
        user_email: req.user?.email || "Unknown",
        user_name: req.user?.user_metadata?.full_name || "Unknown",
        secret_subject_id: req.secret_subject_id,
        status: req.status,
        requested_at: req.requested_at,
      }));

      setAccessRequests(requests);
    } catch (error) {
      console.error("Error loading access requests:", error);
    }
  };

  const saveSecretSubjects = async () => {
    try {
      const response = await fetch("/api/admin/secret-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretSubjects }),
      });

      if (response.ok) {
        alert("Secret subjects saved successfully!");
      } else {
        alert("Failed to save secret subjects");
      }
    } catch (error) {
      console.error("Error saving secret subjects:", error);
      alert("Failed to save secret subjects");
    }
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setSubjectFormData({
      name: "",
      code: "",
      description: "",
    });
    setShowSubjectDialog(true);
  };

  const handleEditSubject = (subject: SecretSubject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
    });
    setShowSubjectDialog(true);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm("Are you sure you want to delete this secret subject?")) {
      setSecretSubjects(secretSubjects.filter((s) => s.id !== id));
    }
  };

  const handleSaveSubject = () => {
    if (!subjectFormData.name || !subjectFormData.code) {
      alert("Please fill in name and code");
      return;
    }

    if (editingSubject) {
      setSecretSubjects(
        secretSubjects.map((s) =>
          s.id === editingSubject.id
            ? { ...s, ...subjectFormData }
            : s
        )
      );
    } else {
      const newSubject: SecretSubject = {
        id: Date.now().toString(),
        ...subjectFormData,
        createdAt: new Date().toISOString(),
      };
      setSecretSubjects([...secretSubjects, newSubject]);
    }

    setShowSubjectDialog(false);
    saveSecretSubjects();
  };

  const handleApproveAccess = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("secret_subject_access")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
      loadAccessRequests();
    } catch (error) {
      console.error("Error approving access:", error);
      alert("Failed to approve access");
    }
  };

  const handleDisapproveAccess = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("secret_subject_access")
        .update({
          status: "disapproved",
          disapproved_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
      loadAccessRequests();
    } catch (error) {
      console.error("Error disapproving access:", error);
      alert("Failed to disapprove access");
    }
  };

  const filteredRequests = selectedSubjectId
    ? accessRequests.filter((r) => r.secret_subject_id === selectedSubjectId)
    : accessRequests;

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Secret Subjects" description="Manage hidden subjects and access" />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Secret Subjects"
        description="Manage hidden subjects with access codes and approve user access"
      />

      <div className="space-y-8">
        {/* Secret Subjects */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Secret Subjects</h2>
            <Button onClick={handleAddSubject}>
              <Plus className="mr-2 h-4 w-4" />
              Add Secret Subject
            </Button>
          </div>

          <div className="border border-border rounded-lg divide-y divide-border">
            {secretSubjects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No secret subjects created yet
              </div>
            ) : (
              secretSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: {subject.code}
                    </div>
                    {subject.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {subject.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSubject(subject)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button onClick={saveSecretSubjects} className="w-full mt-4">
            <Save className="mr-2 h-4 w-4" />
            Save Secret Subjects
          </Button>
        </div>

        {/* Access Requests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Access Requests</h2>
            <select
              className="border border-border rounded-md px-3 py-2 text-sm"
              value={selectedSubjectId || ""}
              onChange={(e) => setSelectedSubjectId(e.target.value || null)}
            >
              <option value="">All Subjects</option>
              {secretSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border border-border rounded-lg divide-y divide-border">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No access requests found
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="font-medium">{request.user_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.user_email}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Subject: {request.secret_subject_id} | Status: {request.status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requested: {new Date(request.requested_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveAccess(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisapproveAccess(request.id)}
                        >
                          <XIcon className="h-4 w-4 mr-1" />
                          Disapprove
                        </Button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisapproveAccess(request.id)}
                      >
                        <XIcon className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                    {request.status === "disapproved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveAccess(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Secret Subject" : "Add Secret Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={subjectFormData.name}
                onChange={(e) =>
                  setSubjectFormData({ ...subjectFormData, name: e.target.value })
                }
                placeholder="e.g., Advanced Biology"
              />
            </div>
            <div>
              <Label htmlFor="code">Secret Code</Label>
              <Input
                id="code"
                value={subjectFormData.code}
                onChange={(e) =>
                  setSubjectFormData({ ...subjectFormData, code: e.target.value })
                }
                placeholder="Enter a complex secret code"
                type="text"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This code will be used by users to access the secret subject
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={subjectFormData.description}
                onChange={(e) =>
                  setSubjectFormData({ ...subjectFormData, description: e.target.value })
                }
                placeholder="Describe this secret subject"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubjectDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveSubject}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
