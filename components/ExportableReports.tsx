'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface ExportableReportsProps {
  userId: string;
}

export function ExportableReports({ userId: _userId }: ExportableReportsProps) {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<
    'analytics' | 'progress' | 'achievements' | 'homework'
  >('analytics');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/reports/export?type=${reportType}&format=${format}&timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${timeRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setExporting(false);
    }
  };

  const reportDescriptions = {
    analytics:
      t('shell_report_desc_analytics'),
    progress: t('shell_report_desc_progress'),
    achievements: t('shell_report_desc_achievements'),
    homework: t('shell_report_desc_homework'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exporteer Rapporten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_report_type')}</label>
            <Select
              value={reportType}
              onValueChange={(value: 'analytics' | 'progress' | 'achievements' | 'homework') =>
                setReportType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analytics">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                </SelectItem>
                <SelectItem value="progress">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('shell_progress')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="achievements">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{t('shell_achievements')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="homework">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{t('shell_homework')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{reportDescriptions[reportType]}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_time_period')}</label>
            <Select
              value={timeRange}
              onValueChange={(value: 'week' | 'month' | 'all') => setTimeRange(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t('shell_this_week')}</SelectItem>
                <SelectItem value="month">{t('shell_this_month')}</SelectItem>
                <SelectItem value="all">{t('shell_all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_format')}</label>
            <Select
              value={format}
              onValueChange={(value: 'pdf' | 'csv' | 'json') => setFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">{t('shell_pdf_readable')}</SelectItem>
                <SelectItem value="csv">{t('shell_csv_data')}</SelectItem>
                <SelectItem value="json">{t('shell_json_api')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExport} disabled={exporting} className="w-full">
          {exporting ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-spin" />
              Exporteren...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exporteer Rapport
            </>
          )}
        </Button>

        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <h4 className="font-semibold text-sm">{t('shell_available_reports')}</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span>Analytics</span>
              </div>
              <Badge variant="outline">PDF, CSV, JSON</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span>{t('shell_progress')}</span>
              </div>
              <Badge variant="outline">PDF, CSV, JSON</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{t('shell_achievements')}</span>
              </div>
              <Badge variant="outline">PDF, CSV, JSON</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{t('shell_homework')}</span>
              </div>
              <Badge variant="outline">PDF, CSV, JSON</Badge>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border">
          <h4 className="font-semibold text-sm mb-2">{t('shell_tips')}</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {t('shell_tip_pdf')}</li>
            <li>• {t('shell_tip_csv')}</li>
            <li>• {t('shell_tip_json')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
