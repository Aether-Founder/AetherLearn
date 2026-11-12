'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Link, Copy, Check, Users, Lock, Globe, Download, QrCode } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface StudySetSharingProps {
  studySetId: string;
  studySetTitle: string;
  isPublic: boolean;
  onTogglePublic: () => void;
}

export function StudySetSharing({
  studySetId,
  studySetTitle,
  isPublic,
  onTogglePublic,
}: StudySetSharingProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const shareUrl = `${window.location.origin}/studyset/${studySetId}`;
  const embedCode = `<iframe src="${shareUrl}/embed" width="100%" height="400" frameborder="0"></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: studySetTitle,
          text: t('share_study_set_text', undefined, { title: studySetTitle }),
          url: shareUrl,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          {t('share')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Deel Studie Set
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">{t('shell_visibility')}</h3>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">{isPublic ? t('share_open_public') : t('share_private')}</div>
                  <div className="text-sm text-muted-foreground">
                    {isPublic
                      ? t('shell_everyone_can_view')
                      : t('share_only_you')}
                  </div>
                </div>
              </div>
              <Button onClick={onTogglePublic} variant="outline">
                {isPublic ? t('share_public_private') : t('share_make_public')}
              </Button>
            </div>
          </div>

          {isPublic && (
            <>
              <div>
                <h3 className="font-semibold mb-3">{t('shell_share_link')}</h3>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button onClick={handleCopyLink} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t('shell_embed_code')}</h3>
                <div className="flex gap-2">
                  <Input value={embedCode} readOnly className="flex-1 font-mono text-xs" />
                  <Button onClick={handleCopyEmbed} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t('shell_share_options')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleShare} variant="outline" className="h-auto py-4">
                    <Share2 className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{t('shell_share')}</div>
                      <div className="text-xs text-muted-foreground">{t('shell_via_system_share')}</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <QrCode className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{t('shell_qr_code')}</div>
                      <div className="text-xs text-muted-foreground">{t('shell_generate_qr')}</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <Download className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Download</div>
                      <div className="text-xs text-muted-foreground">{t('shell_as_pdf_csv')}</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <Users className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{t('shell_class')}</div>
                      <div className="text-xs text-muted-foreground">{t('shell_share_with_class')}</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <Link className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1">{t('shell_about_sharing')}</div>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• {t('share_public_desc')}</li>
                      <li>• {t('share_copy_desc')}</li>
                      <li>
                        • {t('share_private_bullet')}
                      </li>
                      <li>• {t('shell_tip_visibility')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {!isPublic && (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">{t('shell_share_this_set')}</div>
                  <p className="text-muted-foreground">
                    {t('share_public_hint')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
