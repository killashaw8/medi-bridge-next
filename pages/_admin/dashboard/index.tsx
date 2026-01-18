import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Button,
	Chip,
	IconButton,
	MenuItem,
	Paper,
	Select,
	Skeleton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import withAdminLayout from '@/libs/components/layout/LayoutAdmin';
import { GET_ADMIN_DASHBOARD_STATS, GET_ALL_COMMENTS_BY_ADMIN, GET_ALL_MEMBERS_BY_ADMIN } from '@/apollo/admin/query';
import { REMOVE_COMMENT_BY_ADMIN, UPDATE_MEMBER_BY_ADMIN } from '@/apollo/admin/mutation';
import { OPEN_ADMIN_CONVERSATION } from '@/apollo/user/mutation';
import { CommentGroup, CommentStatus } from '@/libs/enums/comment.enum';
import { MemberStatus, MemberType } from '@/libs/enums/member.enum';
import { Direction } from '@/libs/enums/common.enum';
import type { AdminDashboardStats, AdminStatsPeriod } from '@/libs/types/admin/admin.stats';
import type { AdminCommentsInquiry } from '@/libs/types/comment/comment.input';
import type { MembersInquiry } from '@/libs/types/member/member.input';
import { userVar } from '@/apollo/store';
import { useRouter } from 'next/router';
import { getImageUrl } from '@/libs/imageHelper';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import CommentIcon from '@mui/icons-material/Comment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HomeIcon from '@mui/icons-material/Home';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const statusColorMap: Record<MemberStatus, 'default' | 'success' | 'warning' | 'error'> = {
	[MemberStatus.ACTIVE]: 'success',
	[MemberStatus.BLOCK]: 'warning',
	[MemberStatus.DELETE]: 'error',
};

const DashboardPage: NextPage = () => {
	const [tab, setTab] = useState(0);
	const [statsPeriod, setStatsPeriod] = useState<AdminStatsPeriod>('MONTHLY');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [memberPage, setMemberPage] = useState(0);
	const [membersPerPage, setMembersPerPage] = useState(10);
	const [memberSearch, setMemberSearch] = useState('');
	const [memberStatusFilter, setMemberStatusFilter] = useState<MemberStatus | 'ALL'>('ALL');
	const [memberTypeFilter, setMemberTypeFilter] = useState<MemberType | 'ALL'>('ALL');
	const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
	const [chattingMemberId, setChattingMemberId] = useState<string | null>(null);

	const [commentPage, setCommentPage] = useState(0);
	const [commentsPerPage, setCommentsPerPage] = useState(10);
	const [commentSearch, setCommentSearch] = useState('');
	const [commentGroupFilter, setCommentGroupFilter] = useState<CommentGroup | 'ALL'>('ALL');
	const [commentStatusFilter, setCommentStatusFilter] = useState<CommentStatus | 'ALL'>('ALL');
	const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

	const membersInput = useMemo<MembersInquiry>(
		() => ({
			page: memberPage + 1,
			limit: membersPerPage,
			sort: 'createdAt',
			direction: "DESC",
			search: {
				text: memberSearch.trim() || undefined,
				memberStatus: memberStatusFilter === 'ALL' ? undefined : memberStatusFilter,
				memberType: memberTypeFilter === 'ALL' ? undefined : memberTypeFilter,
			},
		}),
		[memberPage, membersPerPage, memberSearch, memberStatusFilter, memberTypeFilter],
	);

	const { data: membersData, loading: membersLoading, error: membersError, refetch: refetchMembers } = useQuery(
		GET_ALL_MEMBERS_BY_ADMIN,
		{
			variables: { input: membersInput },
			fetchPolicy: 'cache-and-network',
		},
	);

	const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_ADMIN_DASHBOARD_STATS, {
		variables: { input: { period: statsPeriod } },
		fetchPolicy: 'cache-and-network',
	});

	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const [removeCommentByAdmin] = useMutation(REMOVE_COMMENT_BY_ADMIN);
	const [openAdminConversation] = useMutation(OPEN_ADMIN_CONVERSATION);

	const commentsInput = useMemo<AdminCommentsInquiry>(
		() => ({
			page: commentPage + 1,
			limit: commentsPerPage,
			sort: 'createdAt',
			direction: "DESC",
			search: {
				text: commentSearch.trim() || undefined,
				commentGroup: commentGroupFilter === 'ALL' ? undefined : commentGroupFilter,
				commentStatus: commentStatusFilter === 'ALL' ? undefined : commentStatusFilter,
			},
		}),
		[commentPage, commentsPerPage, commentSearch, commentGroupFilter, commentStatusFilter],
	);

	const {
		data: commentsData,
		loading: commentsLoading,
		error: commentsError,
		refetch: refetchComments,
	} = useQuery(GET_ALL_COMMENTS_BY_ADMIN, {
		variables: { input: commentsInput },
		fetchPolicy: 'cache-and-network',
	});

	const members = (membersData?.getAllMembersByAdmin?.list ?? []) as any[];
	const membersTotal = membersData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;

	const stats: AdminDashboardStats | undefined = statsData?.getAdminDashboardStats;
	const comments = (commentsData?.getAllCommentsByAdmin?.list ?? []) as any[];
	const commentsTotal = commentsData?.getAllCommentsByAdmin?.metaCounter?.[0]?.total ?? 0;

	const handleMemberStatusToggle = async (memberId: string, status: MemberStatus) => {
		if (status === MemberStatus.DELETE) return;
		setUpdatingMemberId(memberId);
		const nextStatus = status === MemberStatus.BLOCK ? MemberStatus.ACTIVE : MemberStatus.BLOCK;
		try {
			await updateMemberByAdmin({
				variables: {
					input: {
						_id: memberId,
						memberStatus: nextStatus,
					},
				},
			});
			await refetchMembers();
		} finally {
			setUpdatingMemberId(null);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		setDeletingCommentId(commentId);
		try {
			await removeCommentByAdmin({ variables: { input: commentId } });
			await refetchComments();
		} finally {
			setDeletingCommentId(null);
		}
	};

	const handleTabChange = (_event: React.SyntheticEvent, next: number) => {
		setTab(next);
	};

	const handleStartChat = async (memberId: string) => {
		if (!memberId || memberId === user?._id) return;
		setChattingMemberId(memberId);
		try {
			const result = await openAdminConversation({ variables: { input: { memberId } } });
			const conversationId = result.data?.openAdminConversation?._id;
			if (conversationId) {
				await router.push(`/chat/${conversationId}`);
			}
		} finally {
			setChattingMemberId(null);
		}
	};

	const formatDate = (value?: string) => {
		if (!value) return 'N/A';
		return new Date(value).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		});
	};

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

	const periodLabel = statsPeriod.charAt(0) + statsPeriod.slice(1).toLowerCase();
	const skeletonRows = Array.from({ length: 5 });
	const showStatsSkeleton = statsLoading && !stats;
	const showMembersSkeleton = membersLoading && members.length === 0;
	const showCommentsSkeleton = commentsLoading && comments.length === 0;

	const handleCopy = async (value?: string) => {
		if (!value) return;
		if (navigator?.clipboard?.writeText) {
			await navigator.clipboard.writeText(value);
		}
	};

	const getMemberProfileUrl = (member: any) => {
		if (!member?._id) return null;
		if (member.memberType === MemberType.DOCTOR) return `/doctors/details?memberId=${member._id}`;
		if (member.memberType === MemberType.CLINIC) return `/clinics/details?memberId=${member._id}`;
		return null;
	};

	return (
		<div className="admin-dashboard">
			<div className="admin-dashboard__banner">
				<Typography variant="h4">Admin Dashboard</Typography>
			</div>

			<div className="admin-dashboard__body">
				<aside className="admin-dashboard__sidebar">
					<div className="admin-dashboard__profile">
						<div className="admin-dashboard__profile-image">
							<img
								src={user?.memberImage ? getImageUrl(user.memberImage) : '/images/users/defaultUser.svg'}
								alt="Admin"
							/>
						</div>
						<div className="admin-dashboard__profile-meta">
							<span className="admin-dashboard__profile-name">{user?.memberNick || 'Admin'}</span>
							<span className="admin-dashboard__profile-role">Administrator</span>
						</div>
						<Button className="admin-dashboard__home-btn" startIcon={<HomeIcon />} href="/">
							Home
						</Button>
					</div>

					<div className="admin-dashboard__nav">
						<button
							type="button"
							className={`admin-dashboard__nav-item ${tab === 0 ? 'is-active' : ''}`}
							onClick={(event) => handleTabChange(event, 0)}
						>
							<DashboardIcon />
							<span>Overview</span>
						</button>
						<div className="admin-dashboard__nav-divider" />
						<button
							type="button"
							className={`admin-dashboard__nav-item ${tab === 1 ? 'is-active' : ''}`}
							onClick={(event) => handleTabChange(event, 1)}
						>
							<GroupIcon />
							<span>Members</span>
						</button>
						<div className="admin-dashboard__nav-divider" />
						<button
							type="button"
							className={`admin-dashboard__nav-item ${tab === 2 ? 'is-active' : ''}`}
							onClick={(event) => handleTabChange(event, 2)}
						>
							<CommentIcon />
							<span>Comments</span>
						</button>
						<div className="admin-dashboard__nav-divider" />
						<button
							type="button"
							className={`admin-dashboard__nav-item ${tab === 3 ? 'is-active' : ''}`}
							onClick={(event) => handleTabChange(event, 3)}
						>
							<EventNoteIcon />
							<span>Appointments</span>
						</button>
					</div>
				</aside>

				<div className="admin-dashboard__content">
					<div className="admin-dashboard__header">
						<div>
							<Typography variant="h5">Dashboard overview</Typography>
							<Typography variant="body2" color="text.secondary">
								Manage members, moderation, and high-level stats in one place.
							</Typography>
						</div>
						<Select
							value={statsPeriod}
							onChange={(event) => setStatsPeriod(event.target.value as AdminStatsPeriod)}
							size="small"
							className="admin-dashboard__period"
						>
							<MenuItem value="DAILY">Daily</MenuItem>
							<MenuItem value="MONTHLY">Monthly</MenuItem>
							<MenuItem value="YEARLY">Yearly</MenuItem>
						</Select>
					</div>

					<Paper className="admin-dashboard__panel">
						{tab === 0 && (
						<Stack spacing={3} className="admin-dashboard__section">
							{statsError && <Alert severity="error">Failed to load dashboard stats.</Alert>}
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<div className="admin-dashboard__card">
									<Typography variant="subtitle2" color="text.secondary">
										Total members
									</Typography>
									<Typography variant="h4" className="admin-dashboard__metric">
										{showStatsSkeleton ? <Skeleton width={72} height={32} /> : stats?.members.total ?? 0}
									</Typography>
								</div>
								<div className="admin-dashboard__card">
									<Typography variant="subtitle2" color="text.secondary">
										Active members
									</Typography>
									<Typography variant="h4" className="admin-dashboard__metric">
										{showStatsSkeleton ? <Skeleton width={72} height={32} /> : stats?.members.active ?? 0}
									</Typography>
								</div>
								<div className="admin-dashboard__card">
									<Typography variant="subtitle2" color="text.secondary">
										Blocked members
									</Typography>
									<Typography variant="h4" className="admin-dashboard__metric">
										{showStatsSkeleton ? <Skeleton width={72} height={32} /> : stats?.members.blocked ?? 0}
									</Typography>
								</div>
							</Stack>

							<div className="admin-dashboard__panel-block">
								<Typography variant="h6" className="admin-dashboard__section-title">
									Analytics snapshot
								</Typography>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<div className="admin-dashboard__card admin-dashboard__card--flat">
										<Typography variant="subtitle2" color="text.secondary">
											{periodLabel} visitors
										</Typography>
										<Stack spacing={0.5}>
											<Typography variant="h5" className="admin-dashboard__metric">
												{showStatsSkeleton ? <Skeleton width={90} height={28} /> : stats?.visitors.total ?? 0}
											</Typography>
											<Stack direction="row" spacing={2}>
												<Typography variant="body2" color="text.secondary">
													Members: {showStatsSkeleton ? '...' : stats?.visitors.memberVisitors ?? 0}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Non-members: {showStatsSkeleton ? '...' : stats?.visitors.nonMemberVisitors ?? 0}
												</Typography>
											</Stack>
										</Stack>
									</div>
									<div className="admin-dashboard__card admin-dashboard__card--flat">
										<Typography variant="subtitle2" color="text.secondary">
											{periodLabel} sales
										</Typography>
										<Stack spacing={0.5}>
											<Typography variant="body2">
												Orders: {showStatsSkeleton ? '...' : stats?.sales.totalOrders ?? 0}
											</Typography>
											<Typography variant="body2">
												Items sold: {showStatsSkeleton ? '...' : stats?.sales.totalItems ?? 0}
											</Typography>
											<Typography variant="body2">
												Revenue: {showStatsSkeleton ? '...' : formatCurrency(stats?.sales.totalRevenue ?? 0)}
											</Typography>
										</Stack>
									</div>
									<div className="admin-dashboard__card admin-dashboard__card--flat">
										<Typography variant="subtitle2" color="text.secondary">
											{periodLabel} appointments
										</Typography>
										<Stack spacing={0.5}>
											<Typography variant="h5" className="admin-dashboard__metric">
												{showStatsSkeleton ? <Skeleton width={90} height={28} /> : stats?.appointments.count ?? 0}
											</Typography>
										</Stack>
									</div>
								</Stack>
							</div>
						</Stack>
					)}

					{tab === 1 && (
						<Stack spacing={2} className="admin-dashboard__section">
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
								<div className="admin-dashboard__chip-row">
									<button
										type="button"
										className={`admin-dashboard__chip ${memberTypeFilter === 'ALL' ? 'is-active' : ''}`}
										onClick={() => {
											setMemberTypeFilter('ALL');
											setMemberPage(0);
										}}
									>
										All members
									</button>
									<button
										type="button"
										className={`admin-dashboard__chip ${memberTypeFilter === MemberType.USER ? 'is-active' : ''}`}
										onClick={() => {
											setMemberTypeFilter(MemberType.USER);
											setMemberPage(0);
										}}
									>
										Users
									</button>
									<button
										type="button"
										className={`admin-dashboard__chip ${memberTypeFilter === MemberType.DOCTOR ? 'is-active' : ''}`}
										onClick={() => {
											setMemberTypeFilter(MemberType.DOCTOR);
											setMemberPage(0);
										}}
									>
										Doctors
									</button>
									<button
										type="button"
										className={`admin-dashboard__chip ${memberTypeFilter === MemberType.CLINIC ? 'is-active' : ''}`}
										onClick={() => {
											setMemberTypeFilter(MemberType.CLINIC);
											setMemberPage(0);
										}}
									>
										Clinics
									</button>
									<button
										type="button"
										className={`admin-dashboard__chip ${memberTypeFilter === MemberType.ADMIN ? 'is-active' : ''}`}
										onClick={() => {
											setMemberTypeFilter(MemberType.ADMIN);
											setMemberPage(0);
										}}
									>
										Admins
									</button>
								</div>
							</Stack>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
								<TextField
									label="Search member nick"
									value={memberSearch}
									onChange={(event) => {
										setMemberSearch(event.target.value);
										setMemberPage(0);
									}}
									size="small"
									className="admin-dashboard__filter-search"
								/>
								<Select
									value={memberStatusFilter}
									onChange={(event) => {
										setMemberStatusFilter(event.target.value as MemberStatus | 'ALL');
										setMemberPage(0);
									}}
									size="small"
									className="admin-dashboard__filter-select"
								>
									<MenuItem value="ALL">All statuses</MenuItem>
									<MenuItem value={MemberStatus.ACTIVE}>Active</MenuItem>
									<MenuItem value={MemberStatus.BLOCK}>Blocked</MenuItem>
									<MenuItem value={MemberStatus.DELETE}>Deleted</MenuItem>
								</Select>
							</Stack>

							{membersError && <Alert severity="error">Failed to load members.</Alert>}

							<TableContainer component={Paper} className="admin-dashboard__table">
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Member</TableCell>
											<TableCell>Type</TableCell>
											<TableCell>Status</TableCell>
											<TableCell>Created</TableCell>
											<TableCell align="right">Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{showMembersSkeleton ? (
											skeletonRows.map((_, idx) => (
												<TableRow key={`member-skeleton-${idx}`}>
													<TableCell>
														<Stack spacing={0.6}>
															<Skeleton height={18} width="50%" />
															<Skeleton height={12} width="70%" />
														</Stack>
													</TableCell>
													<TableCell>
														<Skeleton height={16} width="50%" />
													</TableCell>
													<TableCell>
														<Skeleton height={20} width="60%" />
													</TableCell>
													<TableCell>
														<Skeleton height={16} width="50%" />
													</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={1} justifyContent="flex-end">
															<Skeleton variant="rectangular" width={64} height={28} />
															<Skeleton variant="rectangular" width={48} height={28} />
															<Skeleton variant="circular" width={28} height={28} />
															<Skeleton variant="circular" width={28} height={28} />
														</Stack>
													</TableCell>
												</TableRow>
											))
										) : members.length === 0 ? (
											<TableRow>
												<TableCell colSpan={5} align="center">
													<Typography variant="body2" color="text.secondary">
														No members found for this filter.
													</Typography>
												</TableCell>
											</TableRow>
										) : (
											members.map((member) => (
												<TableRow key={member._id}>
													<TableCell>
														<Stack spacing={0.2}>
															<Typography variant="subtitle2">{member.memberNick || 'N/A'}</Typography>
															<Typography variant="caption" color="text.secondary">
																{member.memberFullName || member.memberEmail || member.memberPhone || 'No contact'}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell>{member.memberType}</TableCell>
													<TableCell>
														<Chip
															label={member.memberStatus}
															size="small"
															color={statusColorMap[member.memberStatus as MemberStatus] || 'default'}
															variant="outlined"
														/>
													</TableCell>
													<TableCell>{formatDate(member.createdAt)}</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={1} justifyContent="flex-end" className="admin-dashboard__table-actions">
															<Button
																size="small"
																variant="outlined"
																disabled={updatingMemberId === member._id || member.memberStatus === MemberStatus.DELETE}
																color={member.memberStatus === MemberStatus.BLOCK ? 'success' : 'warning'}
																onClick={() => handleMemberStatusToggle(member._id, member.memberStatus)}
															>
																{member.memberStatus === MemberStatus.BLOCK ? 'Unblock' : 'Block'}
															</Button>
															<Button
																size="small"
																variant="outlined"
																disabled={chattingMemberId === member._id || member._id === user?._id}
																onClick={() => handleStartChat(member._id)}
															>
																Chat
															</Button>
															<Tooltip title="Copy contact">
																<span>
																	<IconButton
																		size="small"
																		onClick={() =>
																			handleCopy(member.memberEmail || member.memberPhone || member.memberNick)
																		}
																	>
																		<ContentCopyIcon fontSize="small" />
																	</IconButton>
																</span>
															</Tooltip>
															{getMemberProfileUrl(member) && (
																<Tooltip title="View profile">
																	<IconButton size="small" component="a" href={getMemberProfileUrl(member) as string}>
																		<OpenInNewIcon fontSize="small" />
																	</IconButton>
																</Tooltip>
															)}
														</Stack>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</TableContainer>

							<TablePagination
								component="div"
								count={membersTotal}
								page={memberPage}
								onPageChange={(_event: unknown, newPage: number) => setMemberPage(newPage)}
								rowsPerPage={membersPerPage}
								onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setMembersPerPage(parseInt(event.target.value, 10));
									setMemberPage(0);
								}}
									rowsPerPageOptions={[5, 10, 20, 50]}
								/>
						</Stack>
					)}

					{tab === 2 && (
						<Stack spacing={2} className="admin-dashboard__section">
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
								<TextField
									label="Search comment content"
									value={commentSearch}
									onChange={(event) => {
										setCommentSearch(event.target.value);
										setCommentPage(0);
									}}
									size="small"
									className="admin-dashboard__filter-search"
								/>
								<Select
									value={commentGroupFilter}
									onChange={(event) => {
										setCommentGroupFilter(event.target.value as CommentGroup | 'ALL');
										setCommentPage(0);
									}}
									size="small"
									className="admin-dashboard__filter-select"
								>
									<MenuItem value="ALL">All groups</MenuItem>
									<MenuItem value={CommentGroup.MEMBER}>Member</MenuItem>
									<MenuItem value={CommentGroup.PRODUCT}>Product</MenuItem>
									<MenuItem value={CommentGroup.ARTICLE}>Article</MenuItem>
								</Select>
								<Select
									value={commentStatusFilter}
									onChange={(event) => {
										setCommentStatusFilter(event.target.value as CommentStatus | 'ALL');
										setCommentPage(0);
									}}
									size="small"
									className="admin-dashboard__filter-select"
								>
									<MenuItem value="ALL">All statuses</MenuItem>
									<MenuItem value={CommentStatus.ACTIVE}>Active</MenuItem>
									<MenuItem value={CommentStatus.DELETE}>Deleted</MenuItem>
								</Select>
							</Stack>

							{commentsError && <Alert severity="error">Failed to load comments.</Alert>}

							<TableContainer component={Paper} className="admin-dashboard__table">
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Author</TableCell>
											<TableCell>Group</TableCell>
											<TableCell>Status</TableCell>
											<TableCell>Content</TableCell>
											<TableCell>Created</TableCell>
											<TableCell align="right">Action</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{showCommentsSkeleton ? (
											skeletonRows.map((_, idx) => (
												<TableRow key={`comment-skeleton-${idx}`}>
													<TableCell>
														<Skeleton height={18} width="50%" />
													</TableCell>
													<TableCell>
														<Skeleton height={16} width="60%" />
													</TableCell>
													<TableCell>
														<Skeleton height={16} width="60%" />
													</TableCell>
													<TableCell>
														<Skeleton height={16} width="90%" />
													</TableCell>
													<TableCell>
														<Skeleton height={16} width="60%" />
													</TableCell>
													<TableCell align="right">
														<Skeleton variant="rectangular" width={64} height={28} />
													</TableCell>
												</TableRow>
											))
										) : comments.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} align="center">
													<Typography variant="body2" color="text.secondary">
														No comments found for this filter.
													</Typography>
												</TableCell>
											</TableRow>
										) : (
											comments.map((comment) => (
												<TableRow key={comment._id}>
													<TableCell>{comment.memberData?.memberNick || 'Unknown'}</TableCell>
													<TableCell>{comment.commentGroup}</TableCell>
													<TableCell>{comment.commentStatus}</TableCell>
													<TableCell>{comment.commentContent}</TableCell>
													<TableCell>{formatDate(comment.createdAt)}</TableCell>
													<TableCell align="right">
														<Button
															size="small"
															variant="outlined"
															color="error"
															disabled={deletingCommentId === comment._id}
															onClick={() => handleDeleteComment(comment._id)}
														>
															Delete
														</Button>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</TableContainer>
							<TablePagination
								component="div"
								count={commentsTotal}
								page={commentPage}
								onPageChange={(_event: unknown, newPage: number) => setCommentPage(newPage)}
								rowsPerPage={commentsPerPage}
								onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setCommentsPerPage(parseInt(event.target.value, 10));
									setCommentPage(0);
								}}
									rowsPerPageOptions={[5, 10, 20, 50]}
								/>
						</Stack>
					)}

					{tab === 3 && (
						<Stack spacing={2} className="admin-dashboard__section">
							{statsError && <Alert severity="error">Failed to load appointment stats.</Alert>}
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<div className="admin-dashboard__card">
									<Typography variant="subtitle2" color="text.secondary">
										{periodLabel} appointments
									</Typography>
									<Typography variant="h5" className="admin-dashboard__metric">
										{showStatsSkeleton ? <Skeleton width={90} height={28} /> : stats?.appointments.count ?? 0}
									</Typography>
								</div>
							</Stack>

							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<div className="admin-dashboard__card admin-dashboard__card--flat">
									<Typography variant="subtitle2" color="text.secondary" className="admin-dashboard__list-title">
										Top clinics
									</Typography>
									<Stack spacing={1}>
										{(stats?.appointments.topClinics ?? []).length === 0 ? (
											<Typography variant="body2" color="text.secondary">
												No data yet.
											</Typography>
										) : (
											(stats?.appointments.topClinics ?? []).map((clinic, index) => (
												<Stack key={clinic.memberId} direction="row" justifyContent="space-between">
													<Typography variant="body2">
														{index + 1}. {clinic.name || clinic.memberId}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{clinic.count}
													</Typography>
												</Stack>
											))
										)}
									</Stack>
								</div>
								<div className="admin-dashboard__card admin-dashboard__card--flat">
									<Typography variant="subtitle2" color="text.secondary" className="admin-dashboard__list-title">
										Top doctors
									</Typography>
									<Stack spacing={1}>
										{(stats?.appointments.topDoctors ?? []).length === 0 ? (
											<Typography variant="body2" color="text.secondary">
												No data yet.
											</Typography>
										) : (
											(stats?.appointments.topDoctors ?? []).map((doctor, index) => (
												<Stack key={doctor.memberId} direction="row" justifyContent="space-between">
													<Typography variant="body2">
														{index + 1}. {doctor.name || doctor.memberId}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{doctor.count}
													</Typography>
												</Stack>
											))
										)}
									</Stack>
								</div>
							</Stack>
						</Stack>
					)}
					</Paper>
				</div>
			</div>
		</div>
	);
};

export default withAdminLayout(DashboardPage);
