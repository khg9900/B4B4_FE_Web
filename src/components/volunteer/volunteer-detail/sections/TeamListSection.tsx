import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Box, Typography, Stack, Button, Paper, Divider } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import type { TeamStatus} from '../../../../types/volunteer';
import type { Participant } from '../hooks/useVolunteerDetail';

type Props = {
  teams: TeamStatus[];
  teamsLoading: boolean;
  expandedTeams: Record<number, boolean>;
  toggleTeam: (teamId: number) => void;
  teamMembers: Record<number, Participant[]>;
  teamLoading: Record<number, boolean>;
  memberExpanded: Record<number, boolean>;
  toggleMember: (participantId: number) => void;
  memberSaving: Record<number, boolean>;
  setAttendance: (teamId: number, participant: Participant, nextStatus: 'PRESENT' | 'ABSENT') => void;
};

export default function TeamListSection(props: Props) {
  const { teams, teamsLoading, expandedTeams, toggleTeam, teamMembers, teamLoading, memberExpanded, toggleMember, memberSaving, setAttendance } = props;

  return (
    <TableContainer component={Paper} sx={{ mt: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>팀 이름</TableCell>
            <TableCell align="right">인원 (신청/정원)</TableCell>
            <TableCell align="center">팀원</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teamsLoading && <TableRow><TableCell colSpan={3}>팀 정보 로딩 중…</TableCell></TableRow>}
          {!teamsLoading && teams.length === 0 && <TableRow><TableCell colSpan={3}>팀 정보가 없습니다.</TableCell></TableRow>}
          {!teamsLoading && teams.map(t => {
            const isOpen = !!expandedTeams[t.teamId];
            return (
              <React.Fragment key={t.teamId}>
                <TableRow>
                  <TableCell>{`팀 ${t.teamNumber}`}</TableCell>
                  <TableCell align="right">{t.currentCount} / {t.maxCapacity}명</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => toggleTeam(t.teamId)}>
                      {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} sx={{ p: 0, bgcolor: 'background.default' }}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        {teamLoading[t.teamId] && <Typography variant="body2">팀원 로딩 중…</Typography>}
                        {!teamLoading[t.teamId] && (
                          (!teamMembers[t.teamId] || teamMembers[t.teamId].length === 0) ?
                          <Typography variant="body2">팀원이 없습니다.</Typography> :
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>이름</TableCell>
                                <TableCell>이메일</TableCell>
                                <TableCell>전화번호</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell align="center">참여/비참여</TableCell>
                                <TableCell align="center">상세</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {teamMembers[t.teamId].map(p => {
                                const mOpen = !!memberExpanded[p.participantId];
                                const isSaving = !!memberSaving[p.participantId];
                                const present = p.status === 'PRESENT';
                                const absent = p.status === 'ABSENT';
                                const blacklisted = p.status === 'BLACKLISTED';
                                return (
                                  <React.Fragment key={p.participantId}>
                                    <TableRow hover>
                                      <TableCell>{p.name}</TableCell>
                                      <TableCell>{p.email}</TableCell>
                                      <TableCell>{p.phone}</TableCell>
                                      <TableCell>{p.status}</TableCell>
                                      <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                          <Button size="small" variant={present ? 'contained' : 'outlined'} disabled={isSaving || present || blacklisted} onClick={() => setAttendance(t.teamId, p, 'PRESENT')}>참여</Button>
                                          <Button size="small" variant={absent ? 'contained' : 'outlined'} disabled={isSaving || absent || blacklisted} onClick={() => setAttendance(t.teamId, p, 'ABSENT')}>비참여</Button>
                                        </Stack>
                                      </TableCell>
                                      <TableCell align="center">
                                        <IconButton size="small" onClick={() => toggleMember(p.participantId)}>
                                          {mOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell colSpan={6} sx={{ p: 0, bgcolor: 'background.paper' }}>
                                        <Collapse in={mOpen} timeout="auto" unmountOnExit>
                                          <Box sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>팀원 상세 정보</Typography>
                                            <Divider sx={{ mb: 1 }} />
                                            <Stack spacing={0.5}>
                                              <Typography variant="body2">이름: {p.name}</Typography>
                                              <Typography variant="body2">이메일: {p.email}</Typography>
                                              <Typography variant="body2">전화번호: {p.phone}</Typography>
                                              <Typography variant="body2">상태: {p.status}</Typography>
                                            </Stack>
                                          </Box>
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
