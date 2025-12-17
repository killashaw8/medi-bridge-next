import React, { useEffect, useRef, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Box, Stack, CircularProgress } from '@mui/material';

interface TViewerProps {
	content?: string;
	className?: string;
}

const TViewer: React.FC<TViewerProps> = ({ content = '', className }) => {
	const viewerRef = useRef<any>(null);
	const [ViewerComponent, setViewerComponent] = useState<any>(null);

	// Lazy-load viewer on client to avoid SSR issues (toast-ui expects window/self)
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const mod = await import('@toast-ui/react-editor');
				if (mounted) setViewerComponent(() => mod.Viewer);
			} catch (err) {
				console.error('Failed to load Toast Viewer', err);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	// Push HTML into the viewer instance so Toast styles are applied (like nestar-next)
	useEffect(() => {
		if (!viewerRef.current || !ViewerComponent) return;
		const instance = viewerRef.current.getInstance?.();
		if (!instance) return;

		// Prefer setHTML when available; fall back to markdown rendering
		if (content) {
			if (typeof instance.setHTML === 'function') {
				instance.setHTML(content);
			} else if (typeof instance.setMarkdown === 'function') {
				instance.setMarkdown(content);
			}
		} else if (typeof instance.setMarkdown === 'function') {
			instance.setMarkdown('');
		}
	}, [content, ViewerComponent]);

	return (
		<Stack
			className={className}
			sx={{ background: 'white', mt: 3, borderRadius: '12px', border: '1px solid #EFF1F6' }}
		>
			<Box component={'div'} sx={{ p: { xs: 3, md: 4 } }}>
				{ViewerComponent ? (
					<ViewerComponent
						ref={viewerRef}
						initialValue={content || ' '}
						customHTMLRenderer={{
							htmlBlock: {
								iframe(node: any) {
									return [
										{
											type: 'openTag',
											tagName: 'iframe',
											outerNewLine: true,
											attributes: node.attrs,
										},
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'iframe', outerNewLine: true },
									];
								},
								div(node: any) {
									return [
										{ type: 'openTag', tagName: 'div', outerNewLine: true, attributes: node.attrs },
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'div', outerNewLine: true },
									];
								},
							},
							htmlInline: {
								big(node: any, { entering }: any) {
									return entering
										? { type: 'openTag', tagName: 'big', attributes: node.attrs }
										: { type: 'closeTag', tagName: 'big' };
								},
							},
						}}
					/>
				) : (
					<CircularProgress />
				)}
			</Box>
		</Stack>
	);
};

export default TViewer;
