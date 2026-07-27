import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Mail as MailIcon, Send, Inbox, RefreshCw, Plus, Paperclip, Trash2,
  Pencil, Eye, Unplug, X, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Avatar } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { getSentEmails, getInboxEmails, GmailEmail, sendEmail, disconnectGmail } from "../utils/email";
import ResizableSplitPane from "./ResizableSplitPane";

const Mail = () => {
  const { isAuthenticated, authenticate, userEmail, refreshStatus } = useEmailAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxEmails, setInboxEmails] = useState<GmailEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [composeVisible, setComposeVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"compose" | "details">("compose");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [composeLoading, setComposeLoading] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [composeErrors, setComposeErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) loadEmails();
  }, [isAuthenticated, activeTab]);

  const loadEmails = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      if (activeTab === "inbox") {
        setInboxEmails(await getInboxEmails(50));
      } else {
        setSentEmails(await getSentEmails(50));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const getInitials = (email: string) => email.split("@")[0].substring(0, 2).toUpperCase();

  const avatarColor = (str: string) => {
    const colors = ["bg-primary", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  };

  const validateCompose = () => {
    const errs: Record<string, string> = {};
    if (!to) errs.to = "Recipient email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) errs.to = "Enter a valid email";
    if (!subject) errs.subject = "Subject is required";
    if (!body) errs.body = "Message is required";
    setComposeErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleComposeSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCompose()) return;
    setComposeLoading(true);
    try {
      await sendEmail({ to, subject, textBody: body, htmlBody: body.replace(/\n/g, "<br>") });
      toast.success("Email sent successfully!");
      setTo(""); setSubject(""); setBody(""); setAttachedFiles([]);
      loadEmails();
    } catch (error: any) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setComposeLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await disconnectGmail();
      toast.success("Gmail account disconnected");
      if (refreshStatus) await refreshStatus();
      setInboxEmails([]); setSentEmails([]); setSelectedEmail(null);
      setComposeVisible(true); setViewMode("compose");
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect Gmail");
    }
  };

  const currentEmails = activeTab === "inbox" ? inboxEmails : sentEmails;

  if (!isAuthenticated) {
    return (
      <div className="h-full p-4">
        <Card className="h-full flex flex-col items-center justify-center">
          <CardContent className="flex flex-col items-center gap-5 py-12">
            <div className="p-5 rounded-full bg-indigo-50 ring-2 ring-indigo-100">
              <MailIcon className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">Connect Gmail</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Connect your Gmail account to send and receive emails directly from this dashboard.
              </p>
            </div>
            <Button onClick={() => authenticate()} size="lg" className="gap-2">
              <MailIcon className="h-4 w-4" /> Connect Gmail Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderEmailList = () => (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadEmails} disabled={loading} className="h-8 gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={() => authenticate()} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Account
          </Button>
        </div>
        <Button size="sm" onClick={() => { setComposeVisible(true); setSelectedEmail(null); setViewMode("compose"); }}
          className="h-8 gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Compose
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 flex-shrink-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="inbox" className="flex-1 gap-1.5">
              <Inbox className="h-3.5 w-3.5" />
              Inbox
              {inboxEmails.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">{inboxEmails.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1 gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Sent
              {sentEmails.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">{sentEmails.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 mt-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : currentEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No emails found</p>
          </div>
        ) : (
          <div>
            {currentEmails.map(email => {
              const name = activeTab === "inbox"
                ? (email.from.split("<")[0].trim() || email.from)
                : email.to;
              const addr = activeTab === "inbox"
                ? (email.from.match(/<(.+)>/)?.[1] || "")
                : email.to;
              const isSelected = selectedEmail?.from === email.from && selectedEmail?.subject === email.subject;

              return (
                <button
                  key={`${email.from}-${email.date.getTime()}`}
                  onClick={() => { setSelectedEmail(email); setComposeVisible(false); setViewMode("details"); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border text-left hover:bg-muted/50 transition-colors ${isSelected ? "bg-accent" : ""}`}
                >
                  <Avatar initials={getInitials(activeTab === "inbox" ? email.from : email.to)}
                    color={avatarColor(activeTab === "inbox" ? email.from : email.to)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{name}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatDate(email.date)}</span>
                    </div>
                    {addr && <p className="text-[10px] text-muted-foreground truncate">{addr}</p>}
                    <p className="text-xs font-medium text-foreground truncate mt-0.5">{email.subject || "(No Subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.snippet || email.body.substring(0, 80)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderRightPanel = () => {
    if (selectedEmail && !composeVisible) {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <button
              onClick={() => { setSelectedEmail(null); setComposeVisible(true); setViewMode("compose"); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Email Details</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
            <h3 className="text-base font-semibold text-foreground mb-3">
              {selectedEmail.subject || "(No Subject)"}
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 mb-4 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">From:</span> {selectedEmail.from}</p>
              <p><span className="font-medium text-foreground">To:</span> {selectedEmail.to}</p>
              <p><span className="font-medium text-foreground">Date:</span> {selectedEmail.date.toLocaleString("en-IN")}</p>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{selectedEmail.body}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-semibold text-foreground">New Email</span>
          </div>
          <button
            onClick={() => { setComposeVisible(false); setTo(""); setSubject(""); setBody(""); setAttachedFiles([]); setComposeErrors({}); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
          <form onSubmit={handleComposeSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="to" className="text-xs">To</Label>
              <Input id="to" placeholder="recipient@example.com" value={to} onChange={e => setTo(e.target.value)}
                className={`h-9 text-sm ${composeErrors.to ? "border-destructive" : ""}`} />
              {composeErrors.to && <p className="text-xs text-destructive">{composeErrors.to}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs">Subject</Label>
              <Input id="subject" placeholder="Email subject" value={subject} onChange={e => setSubject(e.target.value)}
                className={`h-9 text-sm ${composeErrors.subject ? "border-destructive" : ""}`} />
              {composeErrors.subject && <p className="text-xs text-destructive">{composeErrors.subject}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body" className="text-xs">Message</Label>
              <Textarea id="body" placeholder="Write your message here..." value={body} onChange={e => setBody(e.target.value)}
                rows={10} className={`text-sm custom-scrollbar ${composeErrors.body ? "border-destructive" : ""}`} />
              {composeErrors.body && <p className="text-xs text-destructive">{composeErrors.body}</p>}
            </div>

            {/* Attachments */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Attachments</span>
              </div>
              <label className="flex items-center justify-center gap-2 h-9 w-full rounded-lg border border-dashed border-border hover:bg-muted/50 cursor-pointer text-xs text-muted-foreground transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add File
                <input type="file" multiple className="sr-only"
                  onChange={e => { if (e.target.files) setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
              </label>
              {attachedFiles.length > 0 && (
                <div className="space-y-1.5">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                      <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-0.5 rounded hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={composeLoading} className="gap-2">
                <Send className="h-4 w-4" /> Send Email
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full p-4 overflow-hidden">
      <Card className="h-full flex flex-col overflow-hidden shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100">
                <MailIcon className="h-4 w-4 text-indigo-600" />
              </div>
              <CardTitle className="text-base font-bold">Mail</CardTitle>
            </div>
            {isAuthenticated && userEmail && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs hidden sm:flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-0.5" />
                  {userEmail}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Unplug className="h-3.5 w-3.5" /> Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Gmail</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to disconnect <strong>{userEmail}</strong>? You'll need to reconnect to send emails.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDisconnectGmail}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>

        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <ResizableSplitPane
            left={renderEmailList()}
            right={renderRightPanel()}
            defaultLeftWidth={45}
          />
        </div>
      </Card>
    </div>
  );
};

export default Mail;
