// DisasterDetailModal.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Grid,
    Button,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardMedia,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';

interface Report {
    id: number;
    reporter: number;
    disasterType: string;
    description: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    status: string;
    province: string;
    city: string;
    locationLat: number;
    locationLng: number;
    createdAt: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    data: Report | null;
    onStatusChange: (id: number, newStatus: string) => void;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    fontSize: '1.2rem',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const FieldBox = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    boxShadow: 'none',
    backgroundColor: '#ffffff',
}));

const Label = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
}));

export default function DisasterDetailModal({ open, onClose, data, onStatusChange }: Props) {
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        if (data) {
            setStatus(data.status);
        }
    }, [data]);

    const handleSave = () => {
        if (data) {
            onStatusChange(data.id, status);
        }
        onClose();
    };

    if (!data) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <StyledDialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                    신고 상세 정보
                </Typography>
            </StyledDialogTitle>

            <DialogContent dividers sx={{ pt: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <FieldBox>
                            <CardContent>
                                <Label>신고 ID:</Label>
                                <Typography>{data.id}</Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>
                    <Grid size={6}>
                        <FieldBox>
                            <CardContent>
                                <Label>신고자 ID:</Label>
                                <Typography>{data.reporter}</Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>

                    <Grid size={6}>
                        <FieldBox>
                            <CardContent>
                                <Label>재난 유형:</Label>
                                <Typography>{data.disasterType}</Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>

                    <Grid size={6}>
                        <Label>접수 상태:</Label>
                        <Select
                            fullWidth
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: 1,

                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff7c33', // 기본 테두리
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff7c33', // 호버 시
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff7c33', // 포커스 시
                                },
                                '& .MuiSelect-icon': {
                                    color: '#ff7c33', // 드롭다운 아이콘 색상
                                },
                            }}
                        >
                            <MenuItem value="PENDING">접수대기</MenuItem>
                            <MenuItem value="CONFIRMED">접수완료</MenuItem>
                            <MenuItem value="CLOSED">상황종료</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={12}>
                        <FieldBox sx={{ backgroundColor: "#f5f5f5" }}>
                            <CardContent>
                                <Label>신고 내용:</Label>
                                <Typography>{data.description}</Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>

                    <Grid size={6}>
                        <FieldBox>
                            <CardContent>
                                <Label>지역:</Label>
                                <Typography>{`${data.province} ${data.city}`}</Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>

                    <Grid size={6}>
                        <FieldBox>
                            <CardContent>
                                <Label>좌표:</Label>
                                <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                                    위도: {data.locationLat}, 경도: {data.locationLng}
                                </Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>

                    {(data.imageUrl || data.videoUrl) && (
                        <Grid size={12}>
                            <FieldBox>
                                <CardContent>
                                    <Label>첨부 자료:</Label>
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        {data.imageUrl && (
                                            <CardMedia
                                                component="img"
                                                image={data.imageUrl}
                                                alt="신고 이미지"
                                                sx={{ width: 200, borderRadius: 2 }}
                                            />
                                        )}
                                        {data.videoUrl && (
                                            <video width="240" controls style={{ borderRadius: 8 }}>
                                                <source src={data.videoUrl} type="video/mp4" />
                                            </video>
                                        )}
                                    </Box>
                                </CardContent>
                            </FieldBox>
                        </Grid>
                    )}

                    <Grid size={12}>
                        <FieldBox>
                            <CardContent>
                                <Label>신고 시간:</Label>
                                <Typography>
                                    {new Date(data.createdAt).toLocaleString('ko-KR')}
                                </Typography>
                            </CardContent>
                        </FieldBox>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
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
                >
                    닫기
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{
                        '&:focus': {
                            outline: 'none',
                            boxShadow: 'none',
                        },
                        backgroundColor: '#ff7c33',
                        boxShadow: 'none'
                    }}
                >
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
}
