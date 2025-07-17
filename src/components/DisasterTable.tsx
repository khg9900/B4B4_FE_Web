import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';
import { useState } from 'react';
import DisasterDetailModal from './DisasterDetailModal';

const getDisasterTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    FIRE: '화재',
    FLOOD: '침수',
    EARTHQUAKE: '지진',
    LANDSLIDE: '산사태',
    TYPHOON: '태풍',
    OTHER: '기타',
  };
  return map[type] || type;
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '접수대기',
    CONFIRMED: '접수완료',
    CLOSED: '상황종료',
  };
  return map[status] || status;
};

const DisasterTable = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      reporter: 1001,
      disasterType: 'FIRE',
      description: '아파트 3층에서 화재 발생. 연기가 심하게 나고 있습니다.',
      imageUrl: 'https://via.placeholder.com/300x200?text=Fire+Scene',
      videoUrl: null,
      status: 'PENDING',
      province: '서울특별시',
      city: '강남구',
      locationLat: 37.5665,
      locationLng: 126.978,
      createdAt: '2024-01-15T09:30:00',
    },
    // ...더 추가 가능
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const handleOpenModal = (report: any) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setModalOpen(false);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    // 모달 내부 상태 업데이트
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }

    // 전체 리스트 상태 업데이트
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, status: newStatus } : report
      )
    );
  };

  return (
    <Box px={3} py={2} sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Paper elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>신고 ID</TableCell>
              <TableCell>재난 유형</TableCell>
              <TableCell>위치</TableCell>
              <TableCell>접수 상태</TableCell>
              <TableCell>신고 시간</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell>{getDisasterTypeLabel(report.disasterType)}</TableCell>
                <TableCell>{`${report.province} ${report.city}`}</TableCell>
                <TableCell sx={{ color: getStatusColor(report.status), fontWeight: 600 }}>
                  {getStatusLabel(report.status)}
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleString('ko-KR')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      borderColor: '#ff7c33',
                      color: '#ff7c33',
                      '&:hover': {
                        borderColor: '#ff7c33',
                        backgroundColor: '#fff5ec',
                      },
                      '&:focus': {
                        outline: 'none',
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() => handleOpenModal(report)}
                  >
                    상세 보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* 모달 연결 */}
      <DisasterDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        data={selectedReport}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
};

// 상태별 색상
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '#ff7c33';
    case 'CONFIRMED':
      return '#2196f3';
    case 'CLOSED':
      return '#757575';
    default:
      return 'inherit';
  }
};

export default DisasterTable;
