import * as React from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Paper,
  Dialog,
} from '@mui/material';
import AppDialog from '../AppDialog';
import type { ReportDto, ReportStatusEN } from '../../types/report';
import { DISASTER_TYPE_KO, REPORT_STATUS_KO } from '../../types/report';
import { logger } from '../../utils/logger';

type Props = {
  open: boolean;
  onClose: () => void;
  data: ReportDto;
  onStatusChange?: (id: number, next: ReportStatusEN) => Promise<void>;
};

export default function DisasterDetailModal({ open, onClose, data, onStatusChange }: Props) {
  const [status, setStatus] = React.useState<ReportStatusEN>(data.status);
  const [saving, setSaving] = React.useState(false);

  const [imageOpen, setImageOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) setStatus(data.status);
  }, [open, data]);

  const handleSave = async () => {
    if (!onStatusChange) {
      onClose();
      return;
    }
    try {
      setSaving(true);
      await onStatusChange(data.id, status);
      onClose();
    } catch (e) {
      logger.capture('DisasterDetailModal:handleSave', e, {
        id: data.id,
        prev: data.status,
        next: status,
      });
      alert('상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ minHeight: 32 }}>
      <Typography sx={{ width: { xs: 96, sm: 120 }, fontWeight: 700, fontSize: 15 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 15 }}>{children}</Typography>
    </Stack>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );

  const AttachmentBox: React.FC<{ imageUrl?: string | null; videoUrl?: string | null }> = ({
    imageUrl,
    videoUrl,
  }) => {
    if (videoUrl) {
      return (
        <Box
          component="video"
          src={videoUrl}
          controls
          preload="metadata"
          sx={{
            width: 200,
            height: 140,
            objectFit: 'contain',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            display: 'block',
            bgcolor: 'black',
          }}
          onError={(e) => logger.capture('DisasterDetailModal:videoLoadError', new Error('video load error'))}
        />
      );
    }
    if (imageUrl) {
      return (
        <>
          <Box
            component="img"
            src={imageUrl}
            alt="신고 이미지"
            onClick={() => setImageOpen(true)}
            onError={() => logger.capture('DisasterDetailModal:imageLoadError', new Error('image load error'))}
            sx={{
              width: 200,
              height: 140,
              objectFit: 'contain',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              display: 'block',
              bgcolor: 'background.default',
              cursor: 'zoom-in',
            }}
          />
          <Dialog open={imageOpen} onClose={() => setImageOpen(false)} maxWidth="lg">
            <Box
              component="img"
              src={imageUrl}
              alt="원본 이미지"
              sx={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block',
              }}
              onClick={() => setImageOpen(false)}
              onError={() => logger.capture('DisasterDetailModal:imageLoadError', new Error('image load error (dialog)'))}
            />
          </Dialog>
        </>
      );
    }
    return (
      <Box
        sx={{
          p: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1.5,
          color: 'text.secondary',
          textAlign: 'center',
          width: 200,
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        첨부 없음
      </Box>
    );
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="신고 상세 정보"
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} color="inherit" disabled={saving}>닫기</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {saving ? '저장 중…' : '저장'}
          </Button>
        </>
      }
    >
      <Stack spacing={3}>
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <InfoRow label="신고 ID">{data.id}</InfoRow>
            </Grid>
            <Grid size={12}>
              <InfoRow label="신고자 ID">{data.reporterId}</InfoRow>
            </Grid>
            <Grid size={12}>
              <InfoRow label="재난 유형">
                {DISASTER_TYPE_KO[data.disasterType] ?? data.disasterType}
              </InfoRow>
            </Grid>
            <Grid size={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <Typography sx={{ width: { xs: 96, sm: 120 }, fontWeight: 700, fontSize: 15 }}>
                  접수 상태
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="status-select-label">접수 상태</InputLabel>
                  <Select<ReportStatusEN>
                    labelId="status-select-label"
                    label="접수 상태"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReportStatusEN)}
                  >
                    <MenuItem value="PENDING">{REPORT_STATUS_KO.PENDING}</MenuItem>
                    <MenuItem value="RECEIVED">{REPORT_STATUS_KO.RECEIVED}</MenuItem>
                    <MenuItem value="CLOSED">{REPORT_STATUS_KO.CLOSED}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </Section>

        {/* 신고 내용 */}
        <Section title="신고 내용">
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'grey.50',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {data.description || '내용 없음'}
            </Typography>
          </Paper>
        </Section>

        {/* 위치/좌표 */}
        <Section title="위치 정보">
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <InfoRow label="지역">
                {data.province} {data.city}
              </InfoRow>
            </Grid>
            <Grid size={12}>
              <InfoRow label="좌표">
                위도: {Number(data.locationLat).toFixed(4)}, 경도: {Number(data.locationLng).toFixed(4)}
              </InfoRow>
            </Grid>
          </Grid>
        </Section>

        {/* 첨부 */}
        <Section title="첨부 자료">
          <AttachmentBox imageUrl={data.imageUrl as any} videoUrl={(data as any).videoUrl as any} />
        </Section>

        <Section title="타임라인">
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <InfoRow label="신고 시간">
                {new Date(data.createdAt).toLocaleString('ko-KR')}
              </InfoRow>
            </Grid>
            <Grid size={12}>
              <InfoRow label="최근 업데이트">
                {new Date(data.updatedAt).toLocaleString('ko-KR')}
              </InfoRow>
            </Grid>
          </Grid>
        </Section>
      </Stack>
    </AppDialog>
  );
}
