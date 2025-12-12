import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { ASK_AI } from '../../apollo/user/mutation';
import { AskAiInput, AskAiResponse } from '../types/ai-assistant/ai-assistant-types';
import { sweetErrorAlert } from '../sweetAlert';

interface Message {
	id: string;
	text: string;
	isUser: boolean;
	timestamp: Date;
}

const Ask_AI = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<Message[]>([]);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [askAI, { loading }] = useMutation<{ askAI: AskAiResponse }, { input: AskAiInput }>(ASK_AI, {
		onError: (error) => {
			console.error('AI Assistant Error:', error);
			const errorMessage = error.message.includes('Daily AI limit reached')
				? 'You have reached your daily AI limit (5 requests). Please try again tomorrow.'
				: 'AI Assistant is currently unavailable. Please try again later.';
			sweetErrorAlert(errorMessage);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	// Listen for custom event to open chat from other components
	useEffect(() => {
		const handleOpenChatEvent = () => {
			setOpen(true);
			setOpenButton(true); // Ensure button is visible
		};

		window.addEventListener('openChat', handleOpenChatEvent);

		return () => {
			window.removeEventListener('openChat', handleOpenChatEvent);
		};
	}, []);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMessageInput(e.target.value);
		},
		[],
	);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onClickHandler();
		}
	};

	const onClickHandler = async () => {
		if (!messageInput.trim()) {
			sweetErrorAlert('Please enter a message');
			return;
		}

		if (loading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text: messageInput,
			isUser: true,
			timestamp: new Date(),
		};

		setMessagesList((prev) => [...prev, userMessage]);
		const currentInput = messageInput;
		setMessageInput('');

		try {
			// Build context from user data
			const context = {
				userId: user?._id,
				role: user?.memberType,
				lang: (router.locale || 'en') as 'en' | 'ko' | 'ru' | 'uz',
				clinicId: user?.clinicId,
				doctorId: user?.specialization ? user._id : undefined,
			};

			const { data } = await askAI({
				variables: {
					input: {
						message: currentInput,
						context: context.userId ? context : undefined,
					},
				},
			});

			if (data?.askAI?.reply) {
				const aiMessage: Message = {
					id: (Date.now() + 1).toString(),
					text: data.askAI.reply,
					isUser: false,
					timestamp: new Date(),
				};
				setMessagesList((prev) => [...prev, aiMessage]);
			}
		} catch (error: any) {
			// Error already handled in onError callback
			console.error('Failed to get AI response:', error);
		}
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <SmartToyIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<SmartToyIcon className='icon' style={{ fontSize: 18 }} />
					<div>MediBridge AI Assistant</div>
				</Box>
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							{messagesList.length === 0 && (
								<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<div className={'welcome'}>
										Welcome to MediBridge AI Assistant! I can help answer general medical questions. 
										Please note: I cannot diagnose or prescribe. Always consult a licensed doctor for medical decisions.
									</div>
								</Box>
							)}
							{messagesList.map((message: Message) => {
								return message.isUser ? (
									<Box
										key={message.id}
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-right'}>{message.text}</div>
									</Box>
								) : (
									<Box key={message.id} flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar 
											alt={'AI Assistant'} 
											sx={{ bgcolor: '#336AEA', width: 32, height: 32 }}
										>
											<SmartToyIcon style={{ fontSize: 18 }} />
										</Avatar>
										<div className={'msg-left'}>{message.text}</div>
									</Box>
								);
							})}
							{loading && (
								<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<Avatar sx={{ bgcolor: '#336AEA', width: 32, height: 32 }}>
										<SmartToyIcon style={{ fontSize: 18 }} />
									</Avatar>
									<div className={'msg-left'}>
										<CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} />
										Thinking...
									</div>
								</Box>
							)}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Ask me anything...'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
						disabled={loading}
					/>
					<button 
						className={'send-msg-btn'} 
						onClick={onClickHandler} 
						disabled={loading || !messageInput.trim()}
					>
						{loading ? (
							<CircularProgress size={20} sx={{ color: '#fff' }} />
						) : (
							<SendIcon style={{ color: '#fff' }} />
						)}
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Ask_AI;